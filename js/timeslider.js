var timeslider;

/**
 * function to update the visibility and values of the timeslider if a Layer has changed
 */
function updateTimeslider(){	
	if (years[currentLayer].length > 1){
		document.getElementById("timesliderDiv").style.display = "block";
		timeslider.set({
			name: "timeslider",
	    	minimum:0, 
	    	maximum:years[currentLayer].length-1, 
	    	onChange:function(val){ yearChange(val) }, 
	    	value:initYearValues[currentLayer], 
	    	discreteValues:years[currentLayer].length,
	    	showButtons:true, 
	    	intermediateChanges:true, 
	    	slideDuration:0,
	    	style:{width:"20%", height:"20px"} 
		})
		document.getElementById("timesliderValue").innerHTML = years[currentLayer][initYearValues[currentLayer]];
	}
	else if (years[currentLayer].length == 1){
		document.getElementById("timesliderDiv").style.display = "none";
		document.getElementById("timesliderValue").innerHTML = years[currentLayer][0];
	}
	else {
		document.getElementById("timesliderDiv").style.display = "none";
		document.getElementById("timesliderValue").innerHTML = "";
	}
}

/**
 * function to create the timeslider on startup
 */
function createTimeslider(){
	require(["dijit/form/HorizontalSlider", "dojo/domReady!"], function(HorizontalSlider){
		timeslider = new HorizontalSlider({
			name: "timeslider",
	    	minimum:0, 
	    	maximum:years[currentLayer].length-1, 
	    	onChange:function(val){ yearChange(val) }, 
	    	value:initYearValues[currentLayer], 
	    	discreteValues:years[currentLayer].length,
	    	showButtons:true, 
	    	intermediateChanges:true, 
	    	slideDuration:0,
	    	style:{width:"20%", height:"20px"} 
		}, "timeslider");
	});
	document.getElementById("timesliderValue").innerHTML = years[currentLayer][initYearValues[currentLayer]];
}