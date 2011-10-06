
/*
 * Init canvas
 * 
 */

var canvas			= document.getElementById('special-200');
	canvas.width	= 900;
	canvas.height	= 560;





/*
* Paul Irish's requestAnimationFrame shim -
*
* http://paulirish.com/2011/requestanimationframe-for-smart-animating/
*
*/

window.requestAnimFrame = (function() {
	return	window.requestAnimationFrame		|| 
			window.webkitRequestAnimationFrame	|| 
			window.mozRequestAnimationFrame		|| 
			window.oRequestAnimationFrame		|| 
			window.msRequestAnimationFrame		|| 
			function(callback, element){
				window.setTimeout(callback, 1000 / 60);
			};
})();




	   


/*
 * Scene assets
 *
 */

// Asset source collections - define properties for each layer. Arrays for speed.
var src = {

	'layers' : [
									//  x        y       z     mode
		[ 'assets/0.jpg',  			[    0,		  0,	0.0,	0	] ],
		[ 'assets/1.png', 			[    0,		228,	0.45,	0	] ],
		[ 'assets/2.png', 			[  362,		264,	0.56,	0	] ],
		[ 'assets/3.png', 			[  416,		199,	0.6,	0	] ],
		[ 'assets/4.png', 			[  429,		151,	0.65,	0	] ],
		[ 'assets/5.png', 			[  467,		283,	0.70,	0	] ],
		[ 'assets/6.png', 			[  485,		  0,	0.8,	0	] ],
		[ 'assets/mnt.png',			[  643,		  0,	1.0,	0	] ],
		[ 'assets/mntl.png',		[  642,		287,	1.0,	1	] ],
		[ 'assets/char.png',		[  698,		381,	1.01,	0	] ],
		[ 'assets/charl.png',		[  655,		287,	1.01,	1	] ],
		[ 'assets/9.png',  			[  573,		459,	1.015,	0	] ],
		[ 'assets/9l.png', 			[  573,		459,	1.015,	1	] ],
		[ 'assets/10.png', 			[  575,		473,	1.05,	0	] ],
		[ 'assets/10l.png',			[  575,		473,	1.05,	1	] ],
		[ 'assets/frame.png',		[    0,		  0,	0.0,  	0	] ]

	],

	'reflections' : [
									//   x       y        z    mode
		[ 'assets/1r.png', 			[    0,		375,	0.45,	0	] ],
		[ 'assets/2r.png', 			[  361,		396,	0.56,	0	] ],
		[ 'assets/3r.png', 			[  419,		411,	0.6,	0	] ],
		[ 'assets/4r.png', 			[  426,		424,	0.65,	0	] ],
		[ 'assets/5r.png', 			[  468,		438,	0.70,	0	] ],
		[ 'assets/6r.png', 			[  485,		478,	0.8,	0	] ],
		[ 'assets/9r.png', 			[  570,		510,	1.015,	0	] ]
						   
	],                     

	'eyes' : [
									//  x        y,   blink
		[ 'assets/eyes1.png',		[ 1347,		 76,	0	] ],
		[ 'assets/eyes2.png',		[ 1208,		308,	0	] ],
		[ 'assets/eyes3.png',		[ 1346,		351,	0	] ],
		[ 'assets/eyes4.png',		[ 1310,		365,	0	] ],
		[ 'assets/eyes5.png',		[ 1210,		375,	0	] ],
		[ 'assets/eyes5.png',		[ 1379,		462,	0	] ],
		[ 'assets/eyes7.png',		[ 1278,		477,	0	] ],
		[ 'assets/eyes8.png',		[ 1311,		524,	0	] ]
	
	]


}


// Asset destination collections - Images from source collections get loaded into these collections once processed
//
var data_layers			= [],
	data_reflections	= [],
	data_eyes			= [],
	data_stars			= [];


/*
 * Initialisation
 *
 */


// Start loading assets with preloader

var assetManager = new AssetManager(canvas);
	assetManager.loadCollection('layers',		src.layers,			data_layers		);
	assetManager.loadCollection('reflections',	src.reflections,	data_reflections);
	assetManager.loadCollection('eyes',			src.eyes,			data_eyes		);


// Initialise scene from above specs

var scene = new Scene(canvas, data_layers, data_reflections, data_eyes, data_stars);



// Finally, begin render loop once assets are ready

assetManager.onComplete(scene.render);

