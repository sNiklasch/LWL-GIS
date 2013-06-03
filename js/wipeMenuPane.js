/***
 *  this functions animate the menupanes in the webapp
 *
 */


function hidePane(layer){
	$(layer).hide('slow');
}

function showPane(layer){
	if (document.getElementById(layer).style.display == 'block'){
		hidePane("#"+layer);
	}
	else if (layer == 'menuPane-classes'){
		hidePane('#menuPane-layer');
		hidePane('#menuPane-export');
		$("#"+layer).show('slow');
	}
	else if (layer == 'menuPane-layer'){
		hidePane('#menuPane-classes');
		hidePane('#menuPane-export');
		$("#"+layer).show('slow');
	}
	else if (layer == 'menuPane-export'){
		hidePane('#menuPane-classes');
		hidePane('#menuPane-layer');
		$("#"+layer).show('slow');
	}
	else {
		$("#"+layer).show('slow');
	}
}

function switchClassificationPane(toClassPane){
	if (toClassPane == 'automatic'){
		$("#automaticClassesPane").slideDown('slow');
		$("#individualClassesPane").slideUp('slow');

	}
	if (toClassPane == 'manual'){
		$("#individualClassesPane").slideDown('slow');
		$("#automaticClassesPane").slideUp('slow');
	}
	rotateArrow(toClassPane);
}

function switchLayerPane(toClassPane){
	if (toClassPane == 'demographisch'){
		$("#demographischPane").slideDown('slow');
		$("#soziographischPane").slideUp('slow');

	}
	if (toClassPane == 'soziographisch'){
		$("#soziographischPane").slideDown('slow');
		$("#demographischPane").slideUp('slow');
	}
	rotateArrow(toClassPane);
}

function rotateArrow(openDiv){
	if (openDiv == "demographisch"){
		document.getElementById("arrowDemographisch").style.MozTransform = "rotate(90deg)"; /* Firefox 3.6 Firefox 4 */
		document.getElementById("arrowDemographisch").style.webkitTransform = "rotate(90deg)"; /* Safari */
		document.getElementById("arrowDemographisch").style.oTransform = "rotate(90deg)"; /* Opera */
		document.getElementById("arrowDemographisch").style.msTransform = "rotate(90deg)"; /* IE9 */
		document.getElementById("arrowDemographisch").style.transform = "rotate(90deg)"; /* W3C */
		document.getElementById("arrowSoziographisch").style.MozTransform = "rotate(0deg)"; /* Firefox 3.6 Firefox 4 */
		document.getElementById("arrowSoziographisch").style.webkitTransform = "rotate(0deg)"; /* Safari */
		document.getElementById("arrowSoziographisch").style.oTransform = "rotate(0deg)"; /* Opera */
		document.getElementById("arrowSoziographisch").style.msTransform = "rotate(0deg)"; /* IE9 */
		document.getElementById("arrowSoziographisch").style.transform = "rotate(0deg)"; /* W3C */
	}
	if (openDiv == "soziographisch"){
		document.getElementById("arrowSoziographisch").style.MozTransform = "rotate(90deg)"; /* Firefox 3.6 Firefox 4 */
		document.getElementById("arrowSoziographisch").style.webkitTransform = "rotate(90deg)"; /* Safari */
		document.getElementById("arrowSoziographisch").style.oTransform = "rotate(90deg)"; /* Opera */
		document.getElementById("arrowSoziographisch").style.msTransform = "rotate(90deg)"; /* IE9 */
		document.getElementById("arrowSoziographisch").style.transform = "rotate(90deg)"; /* W3C */
		document.getElementById("arrowDemographisch").style.MozTransform = "rotate(0deg)"; /* Firefox 3.6 Firefox 4 */
		document.getElementById("arrowDemographisch").style.webkitTransform = "rotate(0deg)"; /* Safari */
		document.getElementById("arrowDemographisch").style.oTransform = "rotate(0deg)"; /* Opera */
		document.getElementById("arrowDemographisch").style.msTransform = "rotate(0deg)"; /* IE9 */
		document.getElementById("arrowDemographisch").style.transform = "rotate(0deg)"; /* W3C */
	}
	if (openDiv == "automatic"){
		document.getElementById("arrowAutomatic").style.MozTransform = "rotate(90deg)"; /* Firefox 3.6 Firefox 4 */
		document.getElementById("arrowAutomatic").style.webkitTransform = "rotate(90deg)"; /* Safari */
		document.getElementById("arrowAutomatic").style.oTransform = "rotate(90deg)"; /* Opera */
		document.getElementById("arrowAutomatic").style.msTransform = "rotate(90deg)"; /* IE9 */
		document.getElementById("arrowAutomatic").style.transform = "rotate(90deg)"; /* W3C */
		document.getElementById("arrowManual").style.MozTransform = "rotate(0deg)"; /* Firefox 3.6 Firefox 4 */
		document.getElementById("arrowManual").style.webkitTransform = "rotate(0deg)"; /* Safari */
		document.getElementById("arrowManual").style.oTransform = "rotate(0deg)"; /* Opera */
		document.getElementById("arrowManual").style.msTransform = "rotate(0deg)"; /* IE9 */
		document.getElementById("arrowManual").style.transform = "rotate(0deg)"; /* W3C */
	}
	if (openDiv == "manual"){
		document.getElementById("arrowAutomatic").style.MozTransform = "rotate(0deg)"; /* Firefox 3.6 Firefox 4 */
		document.getElementById("arrowAutomatic").style.webkitTransform = "rotate(0deg)"; /* Safari */
		document.getElementById("arrowAutomatic").style.oTransform = "rotate(0deg)"; /* Opera */
		document.getElementById("arrowAutomatic").style.msTransform = "rotate(0deg)"; /* IE9 */
		document.getElementById("arrowAutomatic").style.transform = "rotate(0deg)"; /* W3C */
		document.getElementById("arrowManual").style.MozTransform = "rotate(90deg)"; /* Firefox 3.6 Firefox 4 */
		document.getElementById("arrowManual").style.webkitTransform = "rotate(90deg)"; /* Safari */
		document.getElementById("arrowManual").style.oTransform = "rotate(90deg)"; /* Opera */
		document.getElementById("arrowManual").style.msTransform = "rotate(90deg)"; /* IE9 */
		document.getElementById("arrowManual").style.transform = "rotate(90deg)"; /* W3C */

	}
}