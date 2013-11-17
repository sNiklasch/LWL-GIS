/***
 *  this functions animate the menupanes in the webapp
 *
 */


function hidePane(layer){
	if (layer == 'textWindows'){
		$('#infoWindow').hide('slow');
		$('#welcome').hide('slow');
		$('#welcomeBackground').hide('slow');
	}
	else {
		$(layer).hide('slow');
	}
}

function showPane(layer){
	console.log(layer);
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
	else if (layer == 'infoWindow'){
		$("#"+layer).show('slow');
		$("#welcomeBackground").show('slow');
	}
	else {
		$("#"+layer).show('slow');
	}
}

function switchClassificationPane(toClassPane){
	if (toClassPane == 'automatic' && document.getElementById("automaticClassesPane").style.display == 'block') {
		$("#automaticClassesPane").slideUp('slow');
		closeArrow("arrowAutomatic");
	}
	else if (toClassPane == 'automatic'){
		$("#automaticClassesPane").slideDown('slow');
		$("#individualClassesPane").slideUp('slow');
		openArrow("arrowAutomatic");
		closeArrow("arrowManual");
	}
	if (toClassPane == 'manual' && document.getElementById("individualClassesPane").style.display == 'block') {
		$("#individualClassesPane").slideUp('slow');
		closeArrow("arrowManual");
	}
	else if (toClassPane == 'manual'){
		$("#individualClassesPane").slideDown('slow');
		$("#automaticClassesPane").slideUp('slow');
		openArrow("arrowManual");
		closeArrow("arrowAutomatic");
	}
}

function switchLayerPane(toClassPane){
	if (toClassPane == 'demographisch' && document.getElementById("demographischPane").style.display == 'block') {
		$("#demographischPane").slideUp('slow');
		closeArrow("arrowDemographisch");
	}
	else if (toClassPane == 'demographisch'){
		$("#demographischPane").slideDown('slow');
		$("#soziographischPane").slideUp('slow');
		openArrow("arrowDemographisch");
		closeArrow("arrowSoziographisch");
	}
	if (toClassPane == 'soziographisch' && document.getElementById("soziographischPane").style.display == 'block') {
		$("#soziographischPane").slideUp('slow');
		closeArrow("arrowSoziographisch");
	}
	else if (toClassPane == 'soziographisch'){
		$("#soziographischPane").slideDown('slow');
		$("#demographischPane").slideUp('slow');
		openArrow("arrowSoziographisch");
		closeArrow("arrowDemographisch");
	}
}

function closeArrow(div){
	document.getElementById(div).style.MozTransform = "rotate(0deg)"; /* Firefox 3.6 Firefox 4 */
	document.getElementById(div).style.webkitTransform = "rotate(0deg)"; /* Safari */
	document.getElementById(div).style.oTransform = "rotate(0deg)"; /* Opera */
	document.getElementById(div).style.msTransform = "rotate(0deg)"; /* IE9 */
	document.getElementById(div).style.transform = "rotate(0deg)"; /* W3C */
}
function openArrow(div){
	document.getElementById(div).style.MozTransform = "rotate(90deg)"; /* Firefox 3.6 Firefox 4 */
	document.getElementById(div).style.webkitTransform = "rotate(90deg)"; /* Safari */
	document.getElementById(div).style.oTransform = "rotate(90deg)"; /* Opera */
	document.getElementById(div).style.msTransform = "rotate(90deg)"; /* IE9 */
	document.getElementById(div).style.transform = "rotate(90deg)"; /* W3C */
}