
/*
 * Scene
 *
 * Parallax engine with various effects used on exocomics.com/200 
 *
 */

var Scene = function (_canvas, _data_layers, _data_ref, _data_eyes, _data_stars) {

	// Prepare display canvas
	var canvas				= _canvas,					// The canvas and 2d context from it
		c					= canvas.getContext('2d');

	// Asset collections
	var dLayers				= _data_layers,				// These are the 'destination' arrays from the Asset Manager
		dRef				= _data_ref,				// These have the actual pixel data in them, and scene metadata.
		dEyes				= _data_eyes,
		dStars				= [];

	// Configuration - engine
	var cw					= canvas.width				// Viewport pixel resolution horizontal
		ch					= canvas.height,			// Viewport pixel resolution vertical

		sceneWidth			= 1420,						// Total width of scene from left ro right edges
		perspective			= 4,						// Index to exponentially scale successive layer offsets
		targetFramerate 	= 30;						// Framerate to aim for with setTimeout frame loop

	// Configuration - lighting
	var lightFlickerSpeed	= 70;						// Lantern flickering rate in ms
	
	// Configuration - water
	var waterLevel			= Math.round(0.67 * ch),	// vertical starting point for filter region
		waterWidth			= 600,						// horizontal bounding of filter region
		waterHeight			= ch - waterLevel,			// vertical bounding of filter region
		d_th				= 0.6,						// delta-theta, rate of change of water wave phase

		squiggle_amp	 	= 4,						// max excursion of squiggles in pixels
		squiggle_freq		= 5,						// frequency (wavelength) of squiggles
		wave_amp			= 1.4,						// amplitude of reflective waves
		wave_freq			= 33.75;					// frequency (wavelength) of reflected waves

	// Configuration - stars
	var numStars			= 400,						// Number of stars in the twinkling stars effect
		starSize			= 2;						// Size of stars in pixels	

	// Internal globals
	var toggleWater			= true,						// Switch water pixel effect on and off
		toggleStars			= true,						// Switch extra stars with twinkling animation on and off
	
		totalLayers			= 0,						// Saves checking length, set later
		totalReflects		= 0,
		totalEyes			= 0;

	// Cache math functions
	var	pow					= Math.pow,					// cache functions we're using from Math library - this actually helps quite a bit! object member searching is heavy apparently
		sin					= Math.sin,
		cos					= Math.cos,
		floor				= Math.floor,
		rand				= Math.random,
		pi					= Math.PI;




	/*
	 * Twinkling stars
	 *
	 * Per-star value from 1-100 represents brightness. If brightness % 10 is zero (even number),
	 * decrease value. At the bottom, add one so that % 10 fails and increase value instead. 
	 * Adding one switches the mode (increaing/decreasing) without requiring extra vairable or flag
	 * but the value is not far from required value (ie: brightness == 51 -> opacity 0.51 (~= 0.5)).
	 *
	 * createStars	generates random arrangement of stars, opacity decreases the further they are from the top of the canvas
	 * twinkle		handles fade animations for a given star
	 *
	 */

	function createStars (_num) {

		var x = 0, y = 0;

		for (; _num-- > 0;) {

			x = ~~(rand() * cw);
			y = ~~(rand() * 100);

			dStars.push([x, y, Math.random() * (100 - y) / 100, 100]);

		}

	}


	function twinkle () {

		var these = this,
			value = these[3];

		if (value % 10 === 0) {

			these[3] = (value < 50)  ?  11 : (value - 10);

		} else {

			these[3] = (value > 100) ? 100 : (value + 10);

		}
	
		setTimeout((value > 100) ? function () {} : function () { twinkle.apply(these); }, 20);

	}




	/*
	 * Blinking eyes
	 *
	 *
	 * Interger value on the eyes properties array represents which 'stage' of the 
	 * animation we're at. This changes the delay (delay between blinks is longer 
	 * than delay between closing and opening eyes) and also is use to see if the eyes
	 * are open or not when draw (render.drawEyes);
	 *
	 * blinkEyes	operates on one sprite for it's duration
	 * randomBlink	sets random interval of time between blink animations 
	 *
	 */

	// Blink this pair of eyes
	function blinkEyes () {

		var these = this,
			value = these[2];
	   
		if (value > 3) {
		
			these[2] = 0;
			return;

		}
		
		these[2] += 1;

		setTimeout(function () { blinkEyes.apply(these); }, (value % 2 + 1) * (value % 2 + 1) * 100);

	}


	// Pick random set of eyes to blink every so often
	function randomBlink () {
		
		var delayNextBlink	= rand() * 5000,
			randomEyes		= dEyes[floor(rand() * dEyes.length)][1];

		randomEyes[2] = 1;

		setTimeout(function () { blinkEyes.apply(randomEyes); }, 100);
		setTimeout(randomBlink, delayNextBlink);

	}


	/*
	 * Flickering lighting
	 *
	 * After each lightFlickerSpeed, set light to the average of it's current value 
	 * and a new random value. This helps smooth the flickering to be more flame-like.
	 *
	 */

	function setLightLevel () {

		r_lightlevel = (r_lightlevel + r_seed) / 2;

		setTimeout(setLightLevel, lightFlickerSpeed);

	}




	/*
	 * Render loop and associated functions
	 *
	 */
	
	var render = function render () {

		// Preallocate variables
		var cwHalf      	= cw/2,					// half width of canvas
			chHalf  	    = ch/2,					// half height of canvas
			offsetX 	    = 0,					// mouse offset horizontal (no vertical offset in this scene, removed for speed)

		// Layer paging
			thisImage		= null,					// cache this whole layer array
			thisProp		= null,					// cache properties array
			thisStar		= null,

		// Canvas postprocessing
			pixelData		= null,					// canvasPixelArray for image manipulation
			newPixelData 	= null,					// canvasPixelArray for upcoming frame
			th			 	= 0,					// water rippling phase
			oldTime			= Date.now(),			// wave phase control is based on ms, not frames
			newTime			= 0,					// difference in time from last frame
			i_wave		 	= 0,					// wave pixel offset per row
			i_squiggle	 	= 0,					// squiggle pixel offset per row
			i_diff			= 0,					// precalc cache
			d_sq			= 0,					// precalc cache
			d_wave			= 0,					// precalc cache
			f_row		 	= waterHeight - 2,		// precalculate number of rows to use (height - 2: leaves 2 rows of pixels to harvest data from)	
			f_subpx		 	= waterWidth * 4,		// max subpixels per row
			
			newPixels	 	= c.createImageData(waterWidth, waterHeight),
			newPixelData	= newPixels.data;		// Make new ImageData, and cache direct reference to it's .data property which is the pixel array itself
			
		// Iterators
			i_image		 	= 0,					// this layer
			i_stars		 	= 0,					// this layer out of max layer
			i_row		 	= 0,					// this row of pixels
			i_subpx		 	= 0,					// this subpixel (ie: colour channel)
			i_sqOffset	 	= 0,					// subpixel offset of current row
			i_waveOffset 	= 0,					// subpixel offset of target pixel data, including wave modifier

		// Random values
			r_seed			= 0,					// this frame's random value
			r_star			= 0,					// random selection of stars based on r_seed
			r_lightlevel	= 0;					// current light brightness, also based on r_seed for speed	(Math.random is quite slow)

	
		// update view position
		function readMouse (_event) {

			if (_event.offsetX) {

				offsetX = (sceneWidth - cw) * (_event.offsetX / cw);

			} else {

				offsetX = (sceneWidth - cw) * (_event.layerX / cw);		// Gecko events
	
			}
			
		}


		// pixel shader
		function drawWater () {

			if (!toggleWater) { return; }

			// The water effect is easily the most expensive part of the whole redraw, 
			// so restricting the area to minimum size helps slower computers keep up.

			// Get pixel data
			pixelData	 = c.getImageData(0, waterLevel, waterWidth, waterHeight).data;	// <- this little object cache is important too

			// Process it - starting at horizon level
			for (i_row = 0; i_row < f_row; i_row++) {

				// Precalc these
				i_diff		= (i_row-f_row);
				d_sq		= i_diff/squiggle_freq;
				d_wave		= i_diff/wave_freq;

				// calculate this row's distortion offset - bitrounding is faster than floor()
				i_squiggle	= (0.5 + (sin(th + (d_sq * d_sq * d_sq * d_sq)) * pow(i_row/f_row, 0.5) * squiggle_amp) << 0 ) * 4;	// The four is for skipping subpixel channels
				i_wave		= (0.5 + (cos(th + (d_wave * d_wave * d_wave)						   ) * wave_amp	  ) << 0);		// Manual exponents are faster than pow()

				// set subpixel offset values, skew the next one with the distortion value
				i_waveOffset	= (i_row+1) * f_subpx + i_squiggle;
				i_sqOffset		=  i_row    * f_subpx + i_wave * f_subpx;

				for (i_subpx = 0; i_subpx < f_subpx; i_subpx++) {
		
					newPixelData[i_waveOffset + i_subpx] = pixelData[i_sqOffset + i_subpx];

				}
			
			}

			// Put it back again
			c.putImageData(newPixels, 0, waterLevel);

		}


		// draw stars
		function drawStars () {

			if(!toggleStars) { return; }

			// Twinkle some stars - doing it this way only requires one call 
			// to Math.random (you need a few to make the effect visible)
			twinkle.apply(dStars[r_star]);

			// Draw ALL the stars
			for (i_stars = 0; i_stars < numStars; i_stars++) {

				thisStar = dStars[i_stars];

				// If twinkle value is not normal, opacity is star's opacity times twinkle multiplier (tiwnkle value / 100), otherwise, just star's opacity
				c.fillStyle="rgba(220,220,190," + ( (thisStar[3] < 100) ? (thisStar[2] * thisStar[3] / 100) : (thisStar[2]) ) + ")";

				c.fillRect(thisStar[0], thisStar[1], starSize, starSize);

			}

		}

		// draw blinking eyes
		function drawEyes () {

			// !! Magic - Make the glowing eyes a bit less intense than they were drawn.
			c.globalAlpha = 0.6;

			for (i_image = 0; i_image < totalEyes; i_image++) {
			
				// Get these eyes from array and cache them
				thisImage		= dEyes[i_image];
				thisProp		= thisImage[1];

				if (!(thisProp[2] % 2)) {

					c.drawImage(thisImage[0], thisProp[0] - offsetX, thisProp[1]);

				}

			}

			c.globalAlpha = 1;
			
		}





		/*
		 * Master redraw function
		 *
		 */
		
		function drawFrame () {

			// Seed this frame's random values
			r_seed		= rand();
			r_star		= ~~(r_seed * numStars);

			// Step 1 : Render backdrop
			c.drawImage(dLayers[0][0], 0, 0);

			// Step 2 : Render stars
			drawStars();
	
			// Step 3 : Rander underwater layers
			for (i_image = 0; i_image < totalReflects; i_image++) {

				thisData	= dRef[i_image];
				thisProp	= thisData[1];

				c.drawImage(thisData[0], thisProp[0] - offsetX * pow(thisProp[2], perspective), thisProp[1]);

			}

			// Step 4 : Render water
			drawWater();

			// Step 5 : Render above-water layers (starting after base layer)- if layer[x][1][3] == 1 (layer[i]->properties->overlay is true) - render as lighting
			for (i_image = 1; i_image < totalLayers - 1; i_image++) {

				thisData	= dLayers[i_image];
				thisProp	= thisData[1];

				if (thisProp[3] === 1) {	// if mode flag is 1 (lighting layer)

					c.globalCompositeOperation	= 'lighter';
					c.globalAlpha				= r_lightlevel * 0.3;

					c.drawImage(thisData[0], thisProp[0] - offsetX * pow(thisProp[2], perspective), thisProp[1]);

					c.globalAlpha				= 1;
					c.globalCompositeOperation	= 'source-over';

				} else {

					c.drawImage(thisData[0], thisProp[0] - offsetX * pow(thisProp[2], perspective), thisProp[1]);

				}

			}
	
			// Step 6 : Render blinky eyes
			drawEyes();

			// Step 7 : Render white border
			c.drawImage(dLayers[totalLayers-1][0], 0, 0);

		}

		
		
		
		
		/*
		 * Frame timer
		 *
		 */

		function frameTimer () {

			// Count time passed since last frame
			newTime	 = Date.now();
			th		+= (newTime - oldTime) / 100 * d_th;
			oldTime	 = newTime;

			// Trigger draw frame
			drawFrame();

			// Tick
			requestAnimFrame(frameTimer, canvas);
			
		};




		/*
		 * Initialisation
		 *
		 */

		// Set late values
		totalLayers		= dLayers.length;
		totalReflects	= dRef.length;
		totalEyes		= dEyes.length;

		// Bind mouse listener
		canvas.onmousemove = readMouse;

		// Double click to toggle water effect
		canvas.ondblclick = function (_event) { toggleWater = !toggleWater; _event.preventDefault(); };


		// Begin!
		createStars(numStars);
		setLightLevel();
		randomBlink();
		frameTimer();


	}	// end render()




	/*
	 * Expose trigger
	 *
	 */
	
	return { render : render };


}


