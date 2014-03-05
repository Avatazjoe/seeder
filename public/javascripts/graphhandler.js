

/*
                               /$$             /$$    
                              |__/            | $$    
  /$$$$$$$  /$$$$$$$  /$$$$$$  /$$  /$$$$$$  /$$$$$$  
 /$$_____/ /$$_____/ /$$__  $$| $$ /$$__  $$|_  $$_/  
|  $$$$$$ | $$      | $$  \__/| $$| $$  \ $$  | $$    
 \____  $$| $$      | $$      | $$| $$  | $$  | $$ /$$
 /$$$$$$$/|  $$$$$$$| $$      | $$| $$$$$$$/  |  $$$$/
|_______/  \_______/|__/      |__/| $$____/    \___/  
                                  | $$                
                                  | $$                
                                  |__/                
  */
  
var sys;
  
function getSaveState(particlesys){

	var Edges = new Array();
	var Nodes = new Array();

	particlesys.eachNode(function (node, pt) {
		Nodes.push(node);
	});
	particlesys.eachEdge(function (edge, pt1, pt2){
		Edges.push(edge);
	});
	
	var userdata = JSON.parse($.cookie('seederuser'));
	var GraphMeta = new Object();
	GraphMeta.datecreated = +new Date;
	GraphMeta.likes = 0;
	GraphMeta.dislikes = 0;
	GraphMeta.views = 0;

	var Graph = new Object();
	Graph.nodes = Nodes;
	Graph.edges = Edges;
	
	var Savestate = new Object();
	Savestate.graphid = "abc";
	Savestate.author = userdata.id;
	Savestate.graph = Graph;
	Savestate.graphmeta = GraphMeta;
	
	return Savestate;

};


$(document).ready(function () {

    var DEPLOYIP = '54.201.24.162'; //localhost for dev, ip for prod
    var socket = io.connect(DEPLOYIP + ':8080');
    console.log( socket);
    var addnodemode = false;

    //initial ui
    $("#tabs").tabs();
    $("input[type=submit]").button();
    $("#pallete").draggable({containment: "parent"});
    $('#graph_tab').height($("body").height());
    $('#text_tab').height(0);
    $('.menu-link').bigSlide();
    $('#tabs-1').show();
    $('#tabs-2').hide();
    $('#tabs-3').hide();
    $('#tabs-4').hide();
    

    var MainSidebarBuild = $('.ui.sidebar');
    MainSidebarBuild.sidebar('toggle');
    MainSidebarBuild.sidebar('attach events', '#sidebar-toggle', 'toggle');


    var adding = false;
    var menuwidth = $('#menu').width();
    var navheight = $('#nav').height();
    var addnodePREFS = new Object();


    //def
    addnodePREFS['name'] = 'welcome!';
    addnodePREFS['text'] = 'lorem ipsum';
    addnodePREFS['link'] = 'http://www.google.com/';
    addnodePREFS['TYPE'] = 'TEST';
    addnodePREFS['size'] = 10;
    addnodePREFS['id'] = 0;
    addnodePREFS['color'] = '#81CF2D';

    sys = arbor.ParticleSystem(100, 1000, 0.3) //repulsion/stiffness/friction
    sys.parameters({
        gravity: false
    });
    sys.renderer = Renderer("#graph_canvas");



    sys.addNode('a', addnodePREFS);
    sys.addNode('e', addnodePREFS);
    sys.addEdge('a', 'e');

    var nearestmouse;

    //keep a count of node id's
    var ct = 0;
    var data_to_add;


    /*
                                          /$$             
                                         | $$             
  /$$$$$$  /$$    /$$/$$$$$$  /$$$$$$$  /$$$$$$   /$$$$$$$
 /$$__  $$|  $$  /$$/$$__  $$| $$__  $$|_  $$_/  /$$_____/
| $$$$$$$$ \  $$/$$/ $$$$$$$$| $$  \ $$  | $$   |  $$$$$$ 
| $$_____/  \  $$$/| $$_____/| $$  | $$  | $$ /$$\____  $$
|  $$$$$$$   \  $/ |  $$$$$$$| $$  | $$  |  $$$$//$$$$$$$/
 \_______/    \_/   \_______/|__/  |__/   \___/ |_______/ 
                                                          
*/

    $('body').mousemove(function (e) {

        nearestmouse = sys.nearest({
            x: e.pageX + menuwidth,
            y: e.pageY - navheight
        });

        if (nearestmouse) {




            if (nearestmouse.node.data.length > 0) {
                nearestmouse.node.data[6].val = true;
                $('#node-title').text(nearestmouse.node.data[2].val);
                $('#node-domain').text(nearestmouse.node.data[5].val);
                $('#node-description').text(nearestmouse.node.data[1].val);
                $('#node-image').attr("src", nearestmouse.node.data[3].val);
                $('#node-link').attr("href", nearestmouse.node.data[0].val);
                //console.log(nearestmouse.node);
            } else {
                //console.log('id is : ' + nearestmouse.node.name);

            }

        }
        //sys.stop();

    });



    $('#graph_canvas').click(function (a) {

        if (addnodemode) {
            var nearme = sys.nearest({
                x: a.pageX - menuwidth,
                y: a.pageY - navheight
            });
            console.log('called1');
            var i = addnodePREFS;

            var data = jQuery.extend(true, {}, addnodePREFS);


            sys.addNode(data['name'], data);
            sys.addEdge(nearme.node.name, data['name']);
            ct++;

        }

    });

    $('body').mousedown(function (evt) {
        //console.log(evt);
        if ((evt.target.className.indexOf('search_result') != -1) || (evt.target.parentElement.className.indexOf('search_result') != -1)) {

            adding = true;
            $('body').addClass('unselectable');
            $('search_results_holder').addClass('stop-scroll');
            //console.log('article clicked');
            //console.log(evt);

            //build attributes to be passed to the node on creation

            if ((evt.target.className == 'search_result')) {


                attribs_article = [{
                    name: 'URL',
                    val: evt.srcElement.attributes.URL.nodeValue
                }, {
                    name: 'DESCRIPTION',
                    val: evt.srcElement.attributes.DESCRIPTION.nodeValue
                }, {
                    name: 'TITLE',
                    val: evt.srcElement.attributes.TITLE.nodeValue
                }, {
                    name: 'IMAGE',
                    val: evt.srcElement.attributes.IMAGE.nodeValue
                }, {
                    name: 'TYPE',
                    val: evt.srcElement.attributes.TYPE.nodeValue
                }, {
                    name: 'DOMAIN',
                    val: evt.srcElement.attributes.DOMAIN.nodeValue
                }, {
                    name: 'NEAREST',
                    val: false
                }];

            } else {

                attribs_article = [{
                    name: 'URL',
                    val: evt.srcElement.parentElement.attributes.URL.nodeValue
                }, {
                    name: 'DESCRIPTION',
                    val: evt.srcElement.parentElement.attributes.DESCRIPTION.nodeValue
                }, {
                    name: 'TITLE',
                    val: evt.srcElement.parentElement.attributes.TITLE.nodeValue
                }, {
                    name: 'IMAGE',
                    val: evt.srcElement.parentElement.attributes.IMAGE.nodeValue
                }, {
                    name: 'TYPE',
                    val: evt.srcElement.parentElement.attributes.TYPE.nodeValue
                }, {
                    name: 'DOMAIN',
                    val: evt.srcElement.parentElement.attributes.DOMAIN.nodeValue
                }, {
                    name: 'NEAREST',
                    val: false
                }];

            }

            //console.log(attribs_article);
            data_to_add = attribs_article;

        }
    });



    $('body').mouseup(function (e) {

        $('body').removeClass('unselectable');
        $('search_results_holder').removeClass('stop-scrolling');

        if (adding) {
            //preload the image 

            var prefetch = new Image();
            prefetch.src = data_to_add[3].val;
            data_to_add['imagedata'] = prefetch;

            adding = false;

            //console.log('event');
            //console.log(e);

            var len = 0;




            var nearme_ = sys.nearest({
                x: e.pageX - menuwidth,
                y: e.pageY - navheight
            });

            var res;

            if (nearme_) {

                res = sys.addNode(ct + '', data_to_add);
                sys.addEdge(nearme_.node.name, ct + '');
            } else {
                res = sys.addNode(ct + '', data_to_add);
            }

            if (res) {
                //console.log('returned something');
                //console.log(res);
            } else {
                //console.log('returned nothing');
            }



            sys.eachNode(function (node, pt) {
                //console.log('node');
                //console.log(node);
                len++;
            });

            //console.log('ct: ' + len);

            ct++;



        }
    });

    /*
                               /$$                   /$$             
                              | $$                  | $$             
  /$$$$$$$  /$$$$$$   /$$$$$$$| $$   /$$  /$$$$$$  /$$$$$$   /$$$$$$$
 /$$_____/ /$$__  $$ /$$_____/| $$  /$$/ /$$__  $$|_  $$_/  /$$_____/
|  $$$$$$ | $$  \ $$| $$      | $$$$$$/ | $$$$$$$$  | $$   |  $$$$$$ 
 \____  $$| $$  | $$| $$      | $$_  $$ | $$_____/  | $$ /$$\____  $$
 /$$$$$$$/|  $$$$$$/|  $$$$$$$| $$ \  $$|  $$$$$$$  |  $$$$//$$$$$$$/
|_______/  \______/  \_______/|__/  \__/ \_______/   \___/ |_______/ 
                                                                                                                                          
*/

    socket.on('hs_id', function (data) {
        socket.id = data.data;
        //console.log('client : recieved id ' + socket.id + ' from server');
    });

    socket.on('request_pullGraph_success', function (data) {
        //console.log('client : pullGraph request successful, result:');
        //console.log(data.data);
        rebuildPullGraph(data.data);
    });


    //for generating debug graphs, retrieve a random hex color code
    function get_random_color() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.round(Math.random() * 15)];
        }
        return color;
    }


    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX,
            y: evt.clientY
        };
    };

	
	function transportSaveState(ss){
		socket.emit('USER_SAVEGRAPH', {payload: ss});
	}
	
    //when a user wants to get a graph, use the socket connection to
    //send a message to the server indicating which graph to pull
    function initiatePullGraph(gID) {
        socket.emit('request_pullGraph', {
            graphID: gID
        });
    }

    //once a graph has been pulled from the server, it is neccacary to
    //rebuild it into a valid sigma graph
    function rebuildPullGraph(pulled) {
        //TO DO
        //add all nodes and edges back to the sigmajs instance
    }

    //add a node to the graph
    function addNode(x, y, s, id, n, c, attr) {

    }

    $('#btn_savegraph').click(function () {
    
    //open up the save console
    $('#search_results_holder').height(0);
    $('#savepanel').css("height","100px");
    	
  		transportSaveState(getSaveState(sys));
    });

    $('.edittab').click(function (evt) {

        $('.edittab').removeClass('active');

        $(evt.srcElement).addClass('active');
        $(evt.srcElement).addClass('purple');
        //console.log(evt.srcElement.attributes[0].nodeValue);

        $('#tabs-1').hide();
        $('#tabs-2').hide();
        $('#tabs-3').hide();
        $('#tabs-4').hide();

        $(evt.srcElement.attributes[0].nodeValue).show();
    });

    $('#btn_export').click(function (e) {

        var xport_string = "";


        sys.eachNode(function (node, pt) {
            //console.log(node);
            if (node.data[4]) {
                if (node.data[4].val == 'article') {
                    //console.log('has data 4');
                    //title Available From <URL>
                    //an article has been found, need to export this to the list
                    xport_string += node.data[2].val + " Available From <" + node.data[0].val + ">\n\n";
                }


            } else {
                //console.log(node);
                if (node.data['TYPE'] == 'TEXT') {
                    //the node is a text node add it and format appropriatley
                    xport_string += node.data['name'] + " Available From <" + node.data['link'] + ">\n\n";
                }
            }
        });

        //console.log(xport_string);

        var blob = new Blob([xport_string], {
            type: "text/plain;charset=utf-8"
        });
        saveAs(blob, "reference list.txt");




    });



    $('#btn_addnode').click(function () {

        addnodemode = !addnodemode;

        //console.log('called2');

        var updated = new Object();

        updated['name'] = $('#field_node_name').val();
        updated['text'] = $('#field_node_text').val();
        updated['link'] = $('#field_node_link').val();
        updated['size'] = $('#field_node_size').val();
        updated['id'] = $('#field_node_id').val();
        updated['color'] = $('#picker_edgecolor').val();
        updated['TYPE'] = 'TEXT';



        addnodePREFS = updated;


    });


});