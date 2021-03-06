


  
var sys;

var waiting_save_confirm = false;
var waiting_publish_confirm = false;

var nodelength = 0;
var edgelength = 0;

function ID() {
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  return '_' + Math.random().toString(36).substr(2, 9);
};

//this function will generate a state object of the entire graph
// so it can be saved to the database

/**
 * generate a object containing graph data as well as metadata needed for saving
 * @param {Object} layercake object containing data about each layer
 * @param {String} graphname desired name of the graph (passed from interface)
 * @param {String} graphdesc desired description of graph
 * @param {boolean} publishme represents weather the graph should be published or saved
 * @return {Object} savestate returns the save state object ready for passing to database
 */
  
function getSaveState(layercake, gname, gdesc, publishme){

	
	var userdata = JSON.parse($.cookie('seederuserID'));
	//console.log(userdata);
	var GraphMeta = new Object();
	GraphMeta.datecreated = +new Date;
	GraphMeta.likes = 0;
	GraphMeta.dislikes = 0;
	GraphMeta.views = 0;
	GraphMeta.nsize = nodelength;
	GraphMeta.esize = edgelength;
	
	//deep copy the object
	var Graph = jQuery.extend(true, {}, layercake);
	
	for(key in Graph){
		Graph[key].nodes.forEach(function (x){
			delete x.nodedata['imagedata'];
			//console.log(x);
		});
	}
	
	var Savestate = new Object();
	Savestate.graphid = ID();
	Savestate.publish = publishme;
	Savestate.author = userdata.id;
	Savestate.authorname = userdata.displayName;
	Savestate.graphname = gname;
	Savestate.graphdesc = gdesc;
	Savestate.graph = Graph;
	Savestate.graphmeta = GraphMeta;
	
	//console.log(Savestate);
	
	return Savestate;

};

/*!
*
*/


$(document).ready(function () {

    var DEPLOYIP = '127.0.0.1'; //localhost for dev, ip for prod
    var socket = io.connect(DEPLOYIP + ':8080');
    //console.log( socket);
    var addnodemode = false;
    var addedgemode = false;
    var edgepath = new Array();

    //initial ui
    $("#tabs").tabs();
    $("input[type=submit]").button();
    //$("#pallete").draggable({containment: "parent"});
    $('#graph_tab').height($("body").height());
    $('#text_tab').height(0);
    //$('.menu-link').bigSlide();
    $('#tabs-1').show();
    $('#tabs-2').hide();
    $('#tabs-3').hide();
    $('#tabs-4').hide();
    $('#updatelabel').hide();
    
    var MainSidebarBuild = $('.ui.sidebar');
    MainSidebarBuild.sidebar('toggle');
    MainSidebarBuild.sidebar('attach events', '#sidebar-toggle', 'toggle');


    var adding = false;
    var menuwidth = $('#menu').width();
    var navheight = $('#nav').height();
    var addnodePREFS = new Object();
    var editnodePREFS = new Object();
    var current_edit_focus;
    
    //track the state of the graph as a collection of layers
    var GraphLayers = new Object();
	var currentlayer = '-1';
	addLayer('-1', '0');
	



    //def
    addnodePREFS['name'] = 'Start';
    addnodePREFS['text'] = 'lorem ipsum';
    addnodePREFS['link'] = 'http://www.google.com/';
    addnodePREFS['TYPE'] = 'TEXT';
    addnodePREFS['size'] = 30;
    addnodePREFS['nodeid'] = "-1";
    addnodePREFS['color'] = '#564F8A';
    
    

    sys = arbor.ParticleSystem(0, 500, 1.0) //repulsion/stiffness/friction
    sys.parameters({
        gravity: true,
        friction: 1.0, 
        repulsion : 0
    });
    sys.renderer = Renderer("#graph_canvas");
	
	//console.log('here is the system in full');
	//console.log(sys);
	
	//sys.addNode(addnodePREFS['name'], addnodePREFS);
	createNode(-1+'', addnodePREFS, currentlayer);
	
	var mousenow;


    var nearestmouse;

    //keep a count of node id's
    var ct = 0;
    var data_to_add;
    
    
    var op = new Object();
    op.w = 300;
    op.h = 70;
    op.title = "Welcome!";
    op.subtext = "begin by adding some nodes";
    
    
    note('#contain_main', op);



    $('body').mousemove(function (e) {
    
    var mouse = {
        x: e.pageX - 270,
        y: e.pageY - 50
    };
				mousenow = mouse;
        nearestmouse = sys.nearest(mouse);

        if (nearestmouse) {
        //console.log(nearestmouse);

            if (nearestmouse.node.data['TYPE'] == 'ARTICLE') {
            //hide the initial hover message
            $('#info-hover-message').hide();
            //display the data contained in the article node
            
                nearestmouse.node.data['NEAREST'] = true;
                $('#node-title').text(nearestmouse.node.data['TITLE']);
                $('#node-domain').text(nearestmouse.node.data['DOMAIN']);
                $('#node-description').text(nearestmouse.node.data['DESCRIPTION']);
                $('#node-image').attr("src", nearestmouse.node.data['IMAGE']);
                $('#node-link').attr("href", nearestmouse.node.data['URL']);
                //console.log(nearestmouse.node);
            } else {
                //console.log('id is : ' + nearestmouse.node.name);
                

            }

        }
        //sys.stop();
        
        
        //handle the re drawing of the node dropper div 
        
        if(addnodemode){
        
        	
        	var size = $('#field_node_size').val();
        	var col = $('#picker_edgecolor').val();
        	
        	if((size == '') || (col == '')){
        	//some properties not set render default
        	$('#node-dropper').css('top',(e.pageY - navheight)+'px').css('left',(e.pageX + menuwidth)+'px');
        	}else{
        		$('#node-dropper').css('top',(e.pageY - navheight)+'px').css('left',(e.pageX + menuwidth)+'px');
        		$('#node-dropper').css('background-color',col);
        		$('#node-dropper').css('width',(size*2)+'px');
        		$('#node-dropper').css('height',(size*2)+'px');
        		$('#node-dropper').css('border-radius',size+'px');
        	}

        }
        
        
        if(adding){
        	//console.log(data_to_add);
        	//show the user the preview node
        	if($('.preview-node').length)
        	{
        		//the preview node is present
        		$('.preview-node').css('top', (e.pageY - navheight)+'px').css('left',(e.pageX + menuwidth)+'px');
        	}else{
        		//is not present, create it
        		$('body').append('<div class="preview-node">
        											<img src="' + data_to_add["IMAGE"] + '"/>
        											</div>');
        											
        		$('.preview-node').css('top', (e.pageY - navheight)+'px').css('left',(e.pageX + menuwidth)+'px');
        	}
        }

    });



    $('#graph_canvas').click(function (a) {
    
    
    
    sys.start();
    
    var nearme = sys.nearest({
        x: a.offsetX,
        y: a.offsetY
    });
    
    //console.log(nearme);
    
		//console.log(nearme.node.name);

        if (addnodemode) {
        
        
        	

            //console.log('called1');
            var i = addnodePREFS;

            var data = jQuery.extend(true, {}, addnodePREFS);
            data.nodeid = ++ct + '';
            
            var conflict = false;
            
            sys.eachNode(function (n,pt){
            
            	if(n.data.name == addnodePREFS['name']){
            	conflict = true;
            	}
            });
			
			if(conflict){
				//a node was found that matched the id, dont add the node
				//issue a notification to the user
				alert('node name already exists, you can edit nodes by clicking "edit nodes"');
			}else{
			
			if(nearme != null){
				//sys.addNode(data['name'], addnodePREFS);
				createNode(data['nodeid'], data, currentlayer);
				createEdge(nearme.node.data.nodeid, data['nodeid'], currentlayer);
				//sys.addEdge(nearme.node.name, data['name']);
				//console.log(nearme.node.name + ' ' + data['name']);
				//sys.stop();
				
						//alert the user
						var op = new Object();
						op.w = 300;
						op.h = 70;
						op.title = "Node Added!";
						op.subtext = "node named " + data['name'] + " added.";
						
						
						note('#contain_main', op);
						
						
				ct++;
				}else{
					//console.log('ahahahah');
					
					//sys.addNode(data['name'], addnodePREFS);
					createNode(data['nodeid'], data, currentlayer);
					
					//console.log('ahahahah');
					
							//alert the user
							var op = new Object();
							op.w = 300;
							op.h = 70;
							op.title = "Node Added!";
							op.subtext = "node named " + data['name'] + " added.";
							
							
							note('#contain_main', op);
				
					
						
				}
				//sys.stop();
			}
			
			$('#node-dropper').remove();
			$('#btn_addnode').removeClass('red').addClass('green');
			$('#btn_addnode').val('Add Node');
			addnodemode = false;
			
			var leng = 0;
			
			sys.eachNode(function (node, pt) {
			    //console.log('node');
			    //console.log('inside count');
			    leng++;
			});
			
			//console.log(s);
			
			if(leng >= 1){
			
				sys.parameters({
				    gravity: true,
				    friction: 0.1, 
				    repulsion : 00,
				    stiffness: 500
				});
		
				//console.log(sys.parameters());
			}
	
			
			return;
        }
        
        if(addedgemode){
        	//the user is adding an edge 
        	
        	if((edgepath.length == 0) || (edgepath.length == 1)){
        		edgepath.push(nearme);
        		//console.log('added edge to edge path');
        		//edgepath[0].node.name
        		
        		if(edgepath.length == 1){
        			$('#edgesource').text(edgepath[0].node.data.name);
        		}
			}
			
			if(edgepath.length == 2){
			$('#edgedestination').text(edgepath[1].node.data.name);
				//edge is full
				//build and erase
				//console.log(edgepath);
				
				$('#btn_addedge').removeClass('red').addClass('green');
				$('#btn_addedge').val('Add Edge');
				createEdge(edgepath[0].node.data.nodeid, edgepath[1].node.data.nodeid, currentlayer)
				//sys.addEdge(edgepath[0].node.name, edgepath[1].node.name);
				addedgemode = false;
				edgepath = new Array();
			}
			
			return;
        }
        
        //if the edit node pallete is visible
        if ($('#tabs-3').is(":visible")) {
        	//user has the edit tab visible, and has clicked the graph view
        	//show the edit form
        	$('#form_editnode').show();
        	$('#edit_notice').hide();
           //console.log('edit tab is visible');
           displayEditNodePrefs(nearme);
           return;
        }
        


    });
    
    $('#graph_canvas').dblclick(function (a){
    
    var nearme = sys.nearest({
        x: a.offsetX,
        y: a.offsetY
    });
    
    
    	//console.log(nearme);
    	if(nearme.distance < 20)
    	{
    		//console.log('direct click on a node');
    		if(nearme.node.data['TYPE'] == 'LAYER')
    		{
    			//console.log('TYPEISLAYER' );
    			//if the layer node clicked corresponds to this layer
    			//then exit the layer
    			if(nearme.node.data['nodeid'] == currentlayer)
    			{
    				
    				loadLayer(GraphLayers[currentlayer+'z'].parentlayer);
    				//console.log('loading 1:: ' );
    				//console.log(GraphLayers[currentlayer+'z'].parentlayer);
    			}else{
    				//layer node clicked is pointing to a different layer
    				//load it 
    				loadLayer(nearme.node.data['nodeid']);
    				//console.log('loading 2:: ' );
    				//console.log(GraphLayers[nearme.node.data['nodeid']]);
    			}
    			
    			
    		}
    	}
    });
    
    $('#editnode_tab_button').click(function (evt){
    
    	$('#edit_notice').show();
    });
    
    $(window).scroll(function(event){
        if(addnodemode){
        event.preventDefault();
        } 
    })

    $('body').mousedown(function (evt) {
        //console.log(evt);
        if ((evt.target.className.indexOf('result_adder') != -1) || (evt.target.parentElement.className.indexOf('result_adder') != -1)) {
			
            adding = true;
            	

            
            //$('body').addClass('unselectable');
            $('#search_results_holder').css('overflow-x', 'hidden');
            $('search_results_holder').addClass('stop-scroll');
            //console.log('article clicked');
            //console.log(evt);

            //build attributes to be passed to the node on creation
            
            var att = new Object();

            if ((evt.target.className == 'sr')) {
            
            //get nearest sr elem via jq closest
            var jqel = $(evt.srcElement).closest('.sr')[0];
            console.log(jqel);
            
            att['URL'] = jqel.attributes.URL.nodeValue;
            att['DESCRIPTION'] = jqel.attributes.DESCRIPTION.nodeValue;
            att['TITLE'] = jqel.attributes.TITLE.nodeValue;
            att['IMAGE'] = jqel.attributes.IMAGE.nodeValue;
            att['TYPE'] = jqel.attributes.TYPE.nodeValue;
            att['DOMAIN'] = jqel.attributes.DOMAIN.nodeValue;
            att['NEAREST'] = false;




            } else {
            
            var jqelpar = $(evt.srcElement.parentElement).closest('.sr')[0];
            console.log(jqelpar);
            
            att['URL'] =  jqelpar.attributes.URL.nodeValue;
            att['DESCRIPTION'] = jqelpar.attributes.DESCRIPTION.nodeValue;
            att['TITLE'] = jqelpar.attributes.TITLE.nodeValue;
            att['IMAGE'] = jqelpar.attributes.IMAGE.nodeValue;
            att['TYPE'] = jqelpar.attributes.TYPE.nodeValue;
            att['DOMAIN'] = jqelpar.attributes.DOMAIN.nodeValue;
            att['NEAREST'] = false;
            
            



            }
            //console.log(attribs_article);
            
            
            //provide a ui conformation that a article is being dragged
            //alert the user
            var op = new Object();
            op.w = 300;
            op.h = 70;
            op.title = "Adding Article!";
            op.subtext = "release near destination to add";
            
            
            note('#contain_main', op);
            
            
            data_to_add = att;
        }
    });



    $('body').mouseup(function (e) {

        $('body').removeClass('unselectable');
        $('search_results_holder').removeClass('stop-scrolling');

        if (adding) {
        //remove the preview
        $('.preview-node').remove();
            //preload the image 
			 $('#search_results_holder').css('overflow-x', 'scroll');
            var prefetch = new Image();
            prefetch.src = data_to_add['IMAGE'];
            //console.log(data_to_add['IMAGE']);
            data_to_add['imagedata'] = prefetch;

            adding = false;

            //console.log('event');
            //console.log(e);

            var len = 0;




            var nearme_ = sys.nearest({
					x: e.pageX - 270,
					y: e.pageY - 50
            });

            var res;
            
            //console.log(nearme_);

            if (nearme_) {

                //res = sys.addNode(ct + '', data_to_add);
                data_to_add.nodeid = ct+'';
                createNode(ct+'', data_to_add, currentlayer);
                createEdge(nearme_.node.data.nodeid, ct + '', currentlayer);
                //sys.addEdge(nearme_.node.name, ct + '');
            } else {
                //res = sys.addNode(ct + '', data_to_add);
                createNode(ct+'', data_to_add, currentlayer);
            }



            sys.eachNode(function (node, pt) {
                //console.log('node');
                //console.log(node);
                len++;
            });
            
            
            
            var op = new Object();
            op.w = 300;
            op.h = 70;
            op.title = "Added Article!";
            op.subtext = "Article bound to node " + nearme_.node.data.name;
            
            
            note('#contain_main', op);

            //console.log('ct: ' + len);

            ct++;



        }
        
        socket.on('hs_id', function (data) {
            socket.id = data.data;
            //console.log('client : recieved id ' + socket.id + ' from server');
        });
    
        socket.on('SAVE_SUCCESS', function (data){
        
        if(waiting_save_confirm){
        	//console.log('got save confirm');
        	waiting_save_confirm = false;
        	//console.log($('#updatelabel').height() +"px");
        	$('#savepanel').css("height",$('#updatelabel').height() +10 +"px");
        	var date = new Date();
        	$('#lastsave').text(" " + date);
        	$('#lastlink').hide(); 
        	$('#updatelabel').show();
        }
    
        	
        });
        
        socket.on('PUBLISH_SUCCESS', function (data){
        
        if(waiting_publish_confirm){
        //console.log('got publish confirm');
        	waiting_publish_confirm = false;
        	
        	 $('#savepanel').css("height",$('#updatelabel').height() +10 +"px");
        	 $('#savepanel').css("background-color",'#ffffff');
        	 var date = new Date();
        	 $('#lastsave').text(" " + date.toDateString());
        	 $('#lastlink').attr('href',data.payload); 
        	 $('#lastlink').attr('target','_blank'); 
        	 $('#updatelabel').show();
        	 
        }
        	
        });
        
        
    });



/**
 * This function grabs editable data from a node and displays its current value in the edit panel
 * @param {Object} node node to get data from
 */


 	function displayEditNodePrefs(n){
 	
 		//after the information is passed to the view to show the user may change the
 		//node name, in order to edit the old node, save the name in a var
 		
 		current_edit_focus = n.node.data;
 		//get a node and draw it to the tab window
 		
 		        //validate form
 		        //console.log(n);
 		
 		        $('#field_edit_node_name').val(n.node.data['name']);
 		        $('#field_edit_node_text').val(n.node.data['text']);
 		        $('#field_edit_node_link').val(n.node.data['link']);
 		        $('#field_edit_node_size').val(n.node.data['size']);
 		        $('#picker_edit_edgecolor').val(n.node.data['color']);
 	}

    //for generating debug graphs, retrieve a random hex color code
    /**
     * generate a random hex color string (#123ABC)
     * @return {String} The randomly generated hex color reference
     */
    function get_random_color() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.round(Math.random() * 15)];
        }
        return color;
    }
	/*!
	*
	*/
	
    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX,
            y: evt.clientY
        };
    };
    
    function flipSaveButton(){
    	
    	if($('#btn_publishgraph').hasClass('positive')){
    		$('#btn_publishgraph').removeClass('positive');
    		$('#btn_savegraph').addClass('positive');
    	}else{
	    	$('#btn_publishgraph').addClass('positive');
	    	$('#btn_savegraph').removeClass('positive');
    	}
    
    }

	/**
	 * Function to send a generated save state over Web-Socket, and initiate waiting for a server conformation
	 * @param {Object} savestate save state object
	 */
	function transportSaveState(ss){	
		socket.emit('USER_SAVEGRAPH', {payload: ss});
			
			if(ss.publish){
				waiting_publish_confirm = true;
				//console.log('waiting publish confirm');
			}else{
				waiting_save_confirm = true;
				//console.log('waiting save confirm');
			}

		
	}
	/*!
	*
	*/


	/**
	 * Loads a layer from the layer-cake given its name, prunes all nodes from graph and iterates over new nodes to add 
	 * @param {String} layertoload The name of the layer to load in the layer-cake
	 */
    function loadLayer(layertoload){
    
    	currentlayer = layertoload;
    
       layertoload = layertoload +'z'; 
        
    if(GraphLayers[layertoload])
    {
    //console.log('lyr');
    //console.log(GraphLayers[layertoload]);
    	sys.prune(function (a,b,c){
    		return true;
    	});
    	
    	GraphLayers[layertoload].nodes.forEach(function(val, idx, ar){
    		sys.addNode(val.nodename, val.nodedata);
    	});
    	
    	GraphLayers[layertoload].edges.forEach(function(val, idx, ar){
    		sys.addEdge(val.fromnode, val.tonode);
    	});
    	
    	
    }else{
    	//console.log('layer not found');
    }
    	
    }
    
    /**
     * add a layer to the layer-cake
     * @param {String} layername The name of the layer to add
     * @param {String} layerparent The name of the intended parent of this layer
     */
    function addLayer(layername_, layerparent){
    	layername = layername_ +'z';
    	GraphLayers[layername] = new Object();
    	GraphLayers[layername].layername = layername_;
    	GraphLayers[layername].parentlayer = layerparent;
    	GraphLayers[layername].nodes = new Array();
    	GraphLayers[layername].edges = new Array();
    	
    	
    }
    
    function editNode (name, newprefs, layern){
    	layern = layern+'z';
    	
    	GraphLayers[layern].nodes.forEach( function (x, ct) {
    		if(x.nodename == name){
    			GraphLayers[layern].nodes[ct].nodedata = newprefs;
    			
    			//console.log(ct);
    			//console.log(GraphLayers);
    			return false;
    		}
    	
    	});
    	
    	
    }
    
    
    /**
     * remove a node in the current layer of the graph 
     * @param {String} Name The name of the node to add
     * @param {String} Layer Layer in which the node to be removed resides
     */
    function deleteNode(id, layer)
    {
		    //remove from view (particle system)
		    sys.pruneNode(id);
		    layer = layer+'z';
				//remove from underlying structure
		    var newnodes = $.grep(GraphLayers[layer].nodes, function ( node, index ){ return node.nodename != id; });
		    //assign the new node list to the graph object
		    GraphLayers[layer].nodes = newnodes;
		    //reduce nodecount
		    nodelength -=1;
		    //remove any edges from the underlying node structure
		    var newedges = $.grep(GraphLayers[layer].edges, function ( edge, index ){ return (edge.fromnode != id) && (edge.tonode != id); });
		    //assign the new edge list to the graph object
		    GraphLayers[layer].edges = newedges;
    }
    /*!
    *
    */

    /**
     * add a node to the current layer of the graph 
     * @param {String} Name The name of the node to add
     * @param {Object} Data Attributed data of the node to add
     * @param {String} Layer Name of the layer, in the cake, to which the node will be added 
     */
    function createNode(name, data, layer)
    {
    nodelength +=1;
    layer = layer+'z';
    
    
    	if(data['TYPE'] == 'LAYER'){
    		//create new layer
    		addLayer(data['nodeid'], currentlayer);
    		data.parentlayer = currentlayer;
    		GraphLayers[data['nodeid']+'z'].nodes.push({nodename : data.nodeid, nodedata : data});
    	}
    	//add node not particle system
    	sys.addNode(data.nodeid, data);
    	//add node to layer
    	GraphLayers[layer].nodes.push({nodename : data.nodeid, nodedata : data});
    	//console.log(data);
    	return;
    }
    /*!
    *
    */
    
    /**
     * add a edge to the current layer of the graph 
     * @param {String} from name of the source node
     * @param {String} to name of the destination node 
     * @param {String} layer Name of the layer, in the cake, to which the edge will be added 
     */
    function createEdge(from, to, layer)
    {
    	edgelength +=1;
    	layer = layer+'z';
    	//addedge to particle system
    	sys.addEdge(from, to);
    	//add edge to layer
    	GraphLayers[layer].edges.push({fromnode : from, tonode : to});
    }
    /*!
    *
    */
    
    $('#btn_publishgraph').click(function () {
			    
			    //open up the save console
			    $('#search_results_holder').height(0);
			    $('#savepanel').css("height","150px");
			    $('#savepanel').css("background-color","#564F8A");
			    
			    
			    var name = $('#sp_graphname').val();
			    var desc = $('#sp_graphdesc').val();
			    
			    $('#sp_graphname').val('');
			    $('#sp_graphdesc').val('');
			    
			    //console.log('namedesc: ' + name + ' ' +desc);
			    if((name != '') && (desc != '')){
			    	transportSaveState(getSaveState(GraphLayers, name, desc, 1));
			    	
			    	//console.log('sent publish graph data');
			    }
			    		//transportSaveState(getSaveState(sys));
    });

    $('#btn_savegraph').click(function () {
	    
	    //open up the save console
	    $('#search_results_holder').height(0);
	    $('#savepanel').css("height","100px");
	    $('#savepanel').css("background-color","#564F8A");
	    flipSaveButton();
	    
	    var name = $('#sp_graphname').val();
	    var desc = $('#sp_graphdesc').val();
	   	
	   	if((name != '') && (desc != '')){
	    	transportSaveState(getSaveState(GraphLayers, name, desc, 0));
	    	
	    	//console.log('sent graph data');
	    }
    });

    $('.edittab').click(function (evt) {
    
    var target = evt.srcElement;

        $('.edittab').removeClass('active-tab');

        $(target).addClass('active-tab');
        //console.log(evt.srcElement.attributes[0].nodeValue);

        $('#tabs-1').hide();
        $('#tabs-2').hide();
        $('#tabs-3').hide();
        $('#tabs-4').hide();
        $('#form_editnode').hide();
        
       	//console.log('hshhshs');
		//console.log(evt);
		//console.log(target.getAttribute('tablink'));
		$(target.getAttribute('tablink')).show();

        
    });
    
    //delete click handler
    $('body').click(function (e){
    //the delete button has been clicked
    if(e.srcElement.className == 'deleteinner'){
    	//console.log($('.delete').attr('node-data'));
    	//remove node
    	//sys.pruneNode($('.delete').attr('node-data'));
    	deleteNode($('.delete').attr('node-data'), currentlayer);
    }
    });

    $('#btn_export').click(function (e) {

        var xport_string = "";
		
		//traverse graph 

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
    
    /**
     * generates a node data attribute object from the values entered into the edit node panel
     * @return {Object} the attribute object, or -1 if data entered is invalid
     */
	function updateEditNodePrefs(){
	
	if(current_edit_focus != null || current_edit_focus != undefined ){
	        var updatededits = new Object();
	        
	        //validate form
	
	        updatededits['name'] = $('#field_edit_node_name').val();
	        updatededits['text'] = $('#field_edit_node_text').val();
	        updatededits['link'] = $('#field_edit_node_link').val();
	        updatededits['size'] = $('#field_edit_node_size').val();
	        updatededits['id'] = get_random_color();
	        updatededits['color'] = $('#picker_edit_edgecolor').val();
	        
	        updatededits['TYPE'] = current_edit_focus['TYPE'];
	        
	        
	        if(updatededits['name'] == ""){
	        	$('#field_edit_node_name').addClass('errorform');
	        	return -1;
	        }else{
	        	$('#field_edit_node_name').removeClass('errorform');
	        	return updatededits;
	        }
	}
	return;

	

	}
	/**
	 * generates an attribute object from the data entered into the add node pallete
	 * @return {Object} the attribute object or -1 if data entered is invalid
	 */
	function updateAddNodePrefs(){
	
	        var updated = new Object();
	        
	        //validate form
	        
	        //console.log($('#select_node_type').val());
			
	        updated['name'] = $('#field_node_name').val();
	        updated['text'] = $('#field_node_text').val();
	        updated['link'] = $('#field_node_link').val();
	        updated['size'] = $('#field_node_size').val();
	        updated['id'] = get_random_color();
	        updated['color'] = $('#picker_edgecolor').val();
	        updated['TYPE'] = $('#select_node_type').val();
	        
	        
	        if(updated['name'] == ""){
	        	$('#field_node_name').addClass('errorform');
	        	return -1;
	        }else{
	        	$('#field_node_name').removeClass('errorform');
	        	return updated;
	        }
	

	}
	/*!
	*
	*/
	
	$('input').on('input',function (e){
	
		var itemclass = e.srcElement.className;
		
		if(itemclass.indexOf("add")){
			addnodePREFS = updateAddNodePrefs();
		}
		
		if(itemclass.indexOf("edit")){
			editnodePREFS = updateEditNodePrefs();
		}
		
	});
	
	$('#btn_addedge').click(function (evt){
		if(!addedgemode){
		addedgemode = true;
		$('#btn_addedge').removeClass('green').addClass('red');
		$('#btn_addedge').val('cancel');
		}else{
		//cancel
		$('#btn_addedge').removeClass('red').addClass('green');
		$('#btn_addedge').val('Add Edge');
		addedgemode = false;
		}
	});
	
	$('#btn_editnode').click(function (evt){
	//console.log(editnodePREFS);
	
	//editnodePREFS['color'] = 'aliceblue';
	
	
		editnodePREFS['easing'] = 'cubic';
		editnodePREFS['nodeid'] = current_edit_focus['nodeid'];
		sys.tweenNode(current_edit_focus['nodeid'], 0.5, editnodePREFS);
		
		editNode(current_edit_focus['nodeid'], editnodePREFS, currentlayer);
		//console.log('fcs');
		//console.log(current_edit_focus);
		//console.log('edits');
		//console.log(editnodePREFS);
		$('#form_editnode').hide();
		$('#edit_notice').show();
		
	});

    $('#btn_addnode').click(function () {
    
    if(addnodemode){
    	//the user wants to cancel the addnode operation
    	$('#btn_addnode').removeClass('red').addClass('green');
    	$('#btn_addnode').val('Add Node');
    	addnodemode = !addnodemode;
    	$('#node-dropper').remove();
    }else{
    
    		//validate form input
    		
    		addnodePREFS = updateAddNodePrefs();
    		
    		if(addnodePREFS != -1){
    		
    			        addnodemode = true;
    			        $('#btn_addnode').removeClass('green').addClass('red');
    			        $('#btn_addnode').val('cancel');
    			        $( "body" ).append( '<div id="node-dropper"></div>' );
    			        
    			        var op = new Object();
    			        op.w = 300;
    			        op.h = 70;
    			        op.title = "Adding node!";
    			        op.subtext = "click to place the node : ";
    			        //console.log('dhdhdhhdhdhdh');
    			        
    			        note('#contain_main', op);
    		}else{
    			//addnodeprefs returned a -1, [so form was not valid
    			//issue an error
    			
    			alert('form invalid, please enter a name for the node ');
    		}
    		
    	

    
    }




    });


});