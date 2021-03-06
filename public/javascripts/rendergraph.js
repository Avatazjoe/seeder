/**
 * generate a object containing graph data as well as metadata needed for saving
 * @param {String} color The initial color to start with 
 * @param {int} percent the percent to brighten or darken by
 */

function shadeColor(color, percent) {

    var R = parseInt(color.substring(1,3),16);
    var G = parseInt(color.substring(3,5),16);
    var B = parseInt(color.substring(5,7),16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R<255)?R:255;  
    G = (G<255)?G:255;  
    B = (B<255)?B:255;  

    var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
    var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
    var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

    return "#"+RR+GG+BB;
}


function drawToolsHud(canvas_context, active_node) {
	
	
//	canvas_context.fillStyle = "rgba(0, 0, 0, 0.6)";
//	canvas_context.fillRect(active_node.screenPoint.x+200,active_node.screenPoint.y,20,20);
//canvas_context.rect(active_node.screenPoint.x,active_node.screenPoint.y,150,100);
//canvas_context.stroke();

var drawatx = active_node.screenPoint.x;
var delete_html = '<div class=\"delete\">
									<div class=\"deleteinner\">x</div>
									</div>';

if($('#explore-sidebar').hasClass("active")){
	//sidebar is active, push co x co ordinates
	drawatx += $('#explore-sidebar').width();
}

if ($('.delete').length) {
	//div found, move position
	$('.delete').css("top", active_node.screenPoint.y + 'px').css("left", drawatx + "px");
	
}else{
	//div not found, add and position
	$('#contain_main').append(delete_html);
	console.log(active_node);
	$('.delete').css("top", active_node.screenPoint.y + 'px').css("left", drawatx + "px");
}

	$('.delete').attr('node-data', active_node.node.data.nodeid+'');
	
	
}

$(document).mousemove(function(e) {

		var mousex = e.pageX;
		
		if($('#explore-sidebar').hasClass("active")){
			//sidebar is active, push co x co ordinates
			mousex -= $('#explore-sidebar').width();
		}

    window.x = mousex;
    window.y = e.pageY;
  
});


/**
 * The main renderer for the graph drawing system 
 * @param {DOM Canvas Object} canvas The canvas object inside the page DOM that the renderer should draw to
 */

var Renderer = function (canvas) {
    var canvas = $(canvas).get(0);
    var ctx = canvas.getContext("2d");
    var particleSystem;

    var that = {
        init: function (system) {
            //
            // the particle system will call the init function once, right before the
            // first frame is to be drawn. it's a good place to set up the canvas and
            // to pass the canvas size to the particle system
            //
            // save a reference to the particle system for use in the .redraw() loop
            particleSystem = system;

            // inform the system of the screen dimensions so it can map coords for us.
            // if the canvas is ever resized, screenSize should be called again with
            // the new dimensions
            particleSystem.screenSize(canvas.width, canvas.height);
            particleSystem.screenPadding(00); // leave an extra 80px of whitespace per side

            // set up some event handlers to allow for node-dragging
            that.initMouseHandling();
        },

        redraw: function () {
        

            // 
            // redraw will be called repeatedly during the run whenever the node positions
            // change. the new positions for the nodes can be accessed by looking at the
            // .p attribute of a given node. however the p.x & p.y values are in the coordinates
            // of the particle system rather than the screen. you can either map them to
            // the screen yourself, or use the convenience iterators .eachNode (and .eachEdge)
            // which allow you to step through the actual node objects but also pass an
            // x,y point in the screen's coordinate system
            // 
            //console.log('renderer running ');
        	//transparent
        	ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "rgba(255, 255, 255, 0.0)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            particleSystem.eachEdge(function (edge, pt1, pt2) {
                // edge: {source:Node, target:Node, length:#, data:{}}
                // pt1:  {x:#, y:#}  source position in screen coords
                // pt2:  {x:#, y:#}  target position in screen coords

                // draw a line from pt1 to pt2
                ctx.strokeStyle = "rgba(0,0,0, 1.0)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(pt1.x, pt1.y);
                ctx.lineTo(pt2.x, pt2.y);
                ctx.stroke();
            });

            particleSystem.eachNode(function (node, pt) {
            
            //console.log('ll');
            
                // node: {mass:#, p:{x,y}, name:"", data:{}}
                // pt:   {x:#, y:#}  node position in screen coords

                // draw a rectangle centered at pt
                var w = 10
                var imagesize = 70;
                var radius = imagesize / 2;
                var radius_imageless = 10;


                if (node.data['TYPE'] == 'ARTICLE') {
                    //draw a data rich node
                    //console.log('here');
                    //console.log(node);
                    if (node.data['imagedata'] != undefined) {
                    
                    //console.log(node.data['imagedata']);


                        node.data['imagedata'].width = imagesize + 'px';
                        node.data['imagedata'].height = imagesize + 'px';

                        //draw the image clip arc
                        ctx.beginPath();
                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(pt.x, pt.y, radius, 0, 2 * Math.PI, false);
                        ctx.lineWidth = 5;
                        ctx.strokeStyle = '#003300';
                        ctx.shadowColor = '#000';
                        ctx.shadowBlur = 5;
                        ctx.shadowOffsetX = 0;
                        ctx.shadowOffsetY = 0;
                        ctx.stroke();


                        //clip the arc and draw the image, restore canvas state after
                        ctx.clip();
                        try {
                            ctx.drawImage(node.data['imagedata'], pt.x - (imagesize / 2), pt.y - (imagesize / 2), imagesize, imagesize);
                        } catch (InvalidStateError) {
                            //console.log('ssssssss');
                        }
                        ctx.restore();

                        //draw the node title
                        ctx.font = '10pt Arial';
                        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
                        ctx.fillRect(pt.x - imagesize - 2,pt.y + 10,ctx.measureText(node.data['TITLE'].substring(0,30)).width +10,-25);
                        
                        
                        ctx.fillStyle = 'white';
                        ctx.fillText(node.data['TITLE'].substring(0,30), pt.x - (imagesize) + 3, pt.y + 3);

                    } else {


                        ctx.beginPath();
                        ctx.arc(pt.x, pt.y, node.data['size'], 0, 2 * Math.PI, false);
                        ctx.fillStyle = node.data['color'];
												ctx.shadowColor = '#000';
												ctx.shadowBlur = 5;
												ctx.shadowOffsetX = 0;
												ctx.shadowOffsetY = 0;
                        ctx.fill();
                        ctx.lineWidth = 3;
                        ctx.strokeStyle = shadeColor(node.data['color'], -20);
                        ctx.stroke();

                        ctx.font = '12pt Arial';
                        ctx.fillStyle = 'black';
                        ctx.fillText(node.data.name, pt.x - 4, pt.y + 3);

                    }


                } 
                
	            if(node.data['TYPE'] == 'TEXT')
	            {
	                var radius = node.data['size'];
	               
					
	                ctx.beginPath();
	                ctx.arc(pt.x, pt.y, radius, 0, 2 * Math.PI, false);
	                ctx.fillStyle = node.data['color'];
					ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
					ctx.shadowBlur = 5;
					ctx.shadowOffsetX = 0;
					ctx.shadowOffsetY = 0;
	                ctx.fill();
	                ctx.lineWidth = 3;
	                ctx.strokeStyle = shadeColor(node.data['color'], -20);
	                ctx.stroke();
	                
	                ctx.font = '12pt Arial';
	                
	                ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
	                ctx.fillRect(pt.x - 10,pt.y + 10,ctx.measureText(node.data.name).width +10,-25);
	
	                
	                ctx.fillStyle = 'white';
	                ctx.fillText(node.data.name, pt.x - 4, pt.y + 3);
	            }
	            
	            if(node.data['TYPE'] == 'LAYER')
	            {
	            	//console.log('layer');
	                var radius = node.data['size'];
	                ctx.beginPath();
	                ctx.arc(pt.x, pt.y, radius, 0, 2 * Math.PI, false);
	                ctx.fillStyle = node.data['color'];
	                ctx.fill();
	                ctx.lineWidth = 8;
	                ctx.strokeStyle = shadeColor(node.data['color'], -20);
	                ctx.stroke();
	                
	                ctx.font = '12pt Arial';
	                
	                ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
	                ctx.fillRect(pt.x - 10,pt.y + 10,ctx.measureText(node.data.name).width+10,-25);
	                
	                
	                ctx.fillStyle = 'white';
	                ctx.fillText(node.data.name, pt.x - 4, pt.y + 3);		
	            }
            });
            
            
            
            drawToolsHud(ctx, particleSystem.nearest({
            		x: window.x,
            		y: window.y
            })
            );
            
            
        },

        initMouseHandling: function () {
            // no-nonsense drag and drop (thanks springy.js)
            var dragged = null;

            // set up a handler object that will initially listen for mousedowns then
            // for moves and mouseups while dragging
            var handler = {
                clicked: function (e) {
                    var pos = $(canvas).offset();
                    _mouseP = arbor.Point(e.pageX - pos.left, e.pageY - pos.top);
                    dragged = particleSystem.nearest(_mouseP);

                    if (dragged && dragged.node !== null) {
                        // while we're dragging, don't let physics move the node
                        dragged.node.fixed = true;
                    }

                    $(canvas).bind('mousemove', handler.dragged);
                    $(window).bind('mouseup', handler.dropped);

                    return false
                },
                dragged: function (e) {
                    var pos = $(canvas).offset();
                    var s = arbor.Point(e.pageX - pos.left, e.pageY - pos.top);

                    if (dragged && dragged.node !== null) {
                        var p = particleSystem.fromScreen(s);
                        dragged.node.p = p;
                    }

                    return false;
                },

                dropped: function (e) {
                    if (dragged === null || dragged.node === undefined) return;
                    if (dragged.node !== null) dragged.node.fixed = false;
                    dragged.node.tempMass = 1000;
                    dragged = null;
                    $(canvas).unbind('mousemove', handler.dragged);
                    $(window).unbind('mouseup', handler.dropped);
                    _mouseP = null;
                    return false;
                }
            }

            // start listening
            $(canvas).mousedown(handler.clicked);

        },

    }
    return that;
}