
/*
 * Exocomics Asset Manager
 *
 * Delays initialisation until all images are accounted for.
 * Takes a canvas element to report it's progress as little coloured boxes.
 *
 */

var AssetManager = function AssetManager (_canvas) {

  // Configuration
  var c         = _canvas.getContext('2d'),
      boxSize   = 15,               // Size of progess boxes in pixels
      boxMargin = 10,               // Margin between progress boxes
      cw        = _canvas.width,    // Viewport width
      ch        = _canvas.height,   // Viewport height
      boxColor  = "#e2ddd7",        // Colour for boxes with result still pending
      loadColor = "#c3d8a9",        // Colour for 'success' boxes
      failColor = "#d8b0ae";        // Colour for 'failure' boxes

  // Styling
  c.font    = '12px sans-serif';      // For text readout at the bottom of the box display

  // Master collection of collections.
  var collectionMonitor = [];


  /*
   * loadCollection()
   *
   * Load a given collection of strings into given destination list
   *
   */

  this.loadCollection = function loadCollection (_name, _src, _dest) {

    var thisIndex = collectionMonitor.length;

    // lodge process with monitor
    collectionMonitor[thisIndex] = [0, _src.length, _dest];

    // Load items
    for (var i = 0; i < _src.length; i++) {

      (function () {

        // Capture a snapshot of the iterator or it'll be wrong by the time we use it
        var thisI     = i,
            thisImage = new Image();

        thisImage.failed = false;
        thisImage.loaded = false;

        // Image successfully retreived - set success flasg and load into dest
        thisImage.onload = function () {

          this.loaded   = true;
          _dest[thisI]  = [ this, _src[thisI][1] ];

          // Add one to counter for this collection
          collectionMonitor[thisIndex][0] += 1;

        };

        // Image can't be found - set failure flag and load into dest anyway
        thisImage.onerror = function (_event) {

          this.fail   = true;
          _dest[thisI]  = [ this, _src[thisI][1] ];

        }

        // Begin loading
        thisImage.src = _src[thisI][0];

      }())  // <- self executing closure

    }

  }


  /*
   * drawBox
   *
   * Draws a box. Are you surprised?
   *
   */

  function drawBox (_x, _y, _color) {

    c.fillStyle = _color;
    c.fillRect(_x, _y, boxSize, boxSize);

  }


  /*
   * displayProgress()
   *
   * Show loading progress on canvas
   *
   */

  function displayProgress () {

    // Precache some variables
    var thisCollection  = null,
        fullwidth       = 0,    // total width of [whatever number of items] and the margin between them
        fullHeight      = 0,    // total height of [whatever number of collections] and the margin between them
        xValue          = 0,    // x offset
        yValue          = 0,    // y offset
        yCounter        = 0,    // can't enumerate over object properties
        thisColor       = "",   // red if not loaded, green if loaded
        totalAssets     = 0,    // how many individual images, total
        totalLoaded     = 0,    // how many out of those are finished
        thisLayer       = null;

    // Clear canvas
    c.clearRect(0, 0, cw, ch);

    // Calculate max height of all rows in the box output (for positioning)
    fullHeight = (boxSize + boxMargin) * collectionMonitor.length - boxMargin;

    for (var i_coll in collectionMonitor) {

      // Get collection, and find max width for centering
      thisCollection = collectionMonitor[i_coll];
      fullWidth      = (boxSize + boxMargin) * thisCollection[1] - boxMargin;
      yValue         = ch / 2 - fullHeight / 2 + (boxSize + boxMargin) * yCounter++;

      yValue += 140;

      for (var i_item = 0; i_item < thisCollection[1]; i_item++) {

        // Find x position. As we go, count the individual items for the text readout at the end
        totalAssets++;
        xValue = cw / 2 - fullWidth / 2 + (boxSize + boxMargin) * i_item;

        thisLayer = thisCollection[2][i_item] || [{}];

        // Loaded - turn this box green, add to total count for text readout
        if (thisLayer[0].loaded) {

          totalLoaded++;
          thisColor = loadColor;

        // Failed - turn this one red
        } else if (thisLayer[0].fail) {

            thisColor = failColor;

        // Otherwise, grey
        } else {

            thisColor = boxColor;

        }

        // Draw it at the co-ordinates
        drawBox(xValue, yValue, thisColor);

      }

    }

    // Print total as text at the bottom
    c.fillStyle = "#000";
    c.fillText(totalLoaded + " / " + totalAssets, cw / 2 - 15, yValue + boxSize + boxMargin * 2);

  }


  /*
   * monitorProgress()
   *
   * Keep track of loading progress on a timer, drawing the result each time.
   *
   */

  this.onComplete = function monitorProgress (_callback) {

    displayProgress();

    // Failure?
    for (var i_coll in collectionMonitor) {

      // If total matches expected amount, proceed, otherwise, check again in a hundred milliseconds
      if (collectionMonitor[i_coll][0] !== collectionMonitor[i_coll][1]) {

        setTimeout(function () { monitorProgress(_callback); }, 100);

        return false;

      }

    }

    // Success
    _callback();

  }

}

