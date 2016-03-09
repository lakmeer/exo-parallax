
/*
 * Init canvas
 *
 */

var canvas      = document.getElementById('special-200');
  canvas.width  = 900;
  canvas.height = 560;


/*
* Paul Irish's requestAnimationFrame shim -
*
* http://paulirish.com/2011/requestanimationframe-for-smart-animating/
*
*/

window.requestAnimFrame = (function() {
  return window.requestAnimationFrame   ||
    window.webkitRequestAnimationFrame  ||
    window.mozRequestAnimationFrame     ||
    window.oRequestAnimationFrame       ||
    window.msRequestAnimationFrame      ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    };
})();



/*
 * Scene assets
 *
 */

// Asset source collections - define properties for each layer. Arrays for speed.

var ASSET_PATH = '/specials/200/assets';

function asset (filename) {
  return ASSET_PATH + '/' + filename;
}

var src = {

  'layers' : [              //  x      y    z     mode
    [ asset('0.jpg'),       [    0,     0,  0.0,    0 ] ],
    [ asset('1.png'),       [    0,   228,  0.45,   0 ] ],
    [ asset('2.png'),       [  362,   264,  0.56,   0 ] ],
    [ asset('3.png'),       [  416,   199,  0.6,    0 ] ],
    [ asset('4.png'),       [  429,   151,  0.65,   0 ] ],
    [ asset('5.png'),       [  467,   283,  0.70,   0 ] ],
    [ asset('6.png'),       [  485,     0,  0.8,    0 ] ],
    [ asset('mnt.png'),     [  643,     0,  1.0,    0 ] ],
    [ asset('mntl.png'),    [  642,   287,  1.0,    1 ] ],
    [ asset('char.png'),    [  698,   381,  1.01,   0 ] ],
    [ asset('charl.png'),   [  655,   287,  1.01,   1 ] ],
    [ asset('9.png'),       [  573,   459,  1.015,  0 ] ],
    [ asset('9l.png'),      [  573,   459,  1.015,  1 ] ],
    [ asset('10.png'),      [  575,   473,  1.05,   0 ] ],
    [ asset('10l.png'),     [  575,   473,  1.05,   1 ] ],
    [ asset('frame.png'),   [    0,     0,  0.0,    0 ] ]
  ],

  'reflections' : [         //   x     y     z    mode
    [ asset('1r.png'),      [    0,   375,  0.45,   0 ] ],
    [ asset('2r.png'),      [  361,   396,  0.56,   0 ] ],
    [ asset('3r.png'),      [  419,   411,  0.6,    0 ] ],
    [ asset('4r.png'),      [  426,   424,  0.65,   0 ] ],
    [ asset('5r.png'),      [  468,   438,  0.70,   0 ] ],
    [ asset('6r.png'),      [  485,   478,  0.8,    0 ] ],
    [ asset('9r.png'),      [  570,   510,  1.015,  0 ] ]
  ],

  'eyes' : [                //   x     y     z    mode
    [ asset('eyes1.png'),   [ 1347,    76,  0 ] ],
    [ asset('eyes2.png'),   [ 1208,   308,  0 ] ],
    [ asset('eyes3.png'),   [ 1346,   351,  0 ] ],
    [ asset('eyes4.png'),   [ 1310,   365,  0 ] ],
    [ asset('eyes5.png'),   [ 1210,   375,  0 ] ],
    [ asset('eyes5.png'),   [ 1379,   462,  0 ] ],
    [ asset('eyes7.png'),   [ 1278,   477,  0 ] ],
    [ asset('eyes8.png'),   [ 1311,   524,  0 ] ]
  ]

}


// Asset destination collections - Images from source collections get loaded into these collections once processed
//
var data_layers      = [],
    data_reflections = [],
    data_eyes        = [],
    data_stars       = [];


/*
 * Initialisation
 *
 */


// Start loading assets with preloader

var assetManager = new AssetManager(canvas);
    assetManager.loadCollection('layers',       src.layers,       data_layers   );
    assetManager.loadCollection('reflections',  src.reflections,  data_reflections);
    assetManager.loadCollection('eyes',         src.eyes,         data_eyes   );


// Initialise scene from above specs

var scene = new Scene(canvas, data_layers, data_reflections, data_eyes, data_stars);


// Finally, begin render loop once assets are ready

assetManager.onComplete(scene.render);

