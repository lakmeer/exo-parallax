function ieVersion () {

    var vers = 20; // Return value assumes failure.

    if (navigator.appName == 'Microsoft Internet Explorer') {
        var regex_ie = /MSIE ([0-9]{1,}[\.0-9]{0,})/; 
	   	if (regex_ie.exec(navigator.userAgent) != null) { vers = parseFloat(RegExp.$1); }
    }

    return vers;

}

function isMobile () {

	if ( navigator.userAgent.match(/Android|iPhone|iPad|iPod/i) ) { return true; } 
	return false;

}

function hasCanvas () {

	var testCanvas	= document.createElement('canvas');
	var result		= (typeof testCanvas.getContext !== 'undefined');
	testCanvas		= null;

	return result;

}
	

// Deploy special comics

function detectSpecial (_comicId) {

	switch (_comicId) { 

		case 693: 

			// Deployment
			document.write(
				'<style> #comic-693 img { display: none; -webkit-transform: translate3d(0,0,0); } </style>' +
				'<canvas id="special-200" class="pad25" style="width: 900px; height: 560px; background: url(loading.gif) center center no-repeat;" width="900" height="560"></canvas>' + 
				'<script src="loader.js"></script>' +
				'<script src="parallax.mob.js"></script>' +
				'<script src="200.mob.js"></script>'
			);
			
			var bgImage = new Image(); bgImage.src = "loading.gif";
		
		break;

	}

}
