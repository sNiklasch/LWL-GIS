var timeslider;

/**
 * function to update the visibility and values of the timeslider if a Layer has changed
 */
function updateTimeslider(){	
	if (getYearsArray(currentDataframe).length > 1){
		document.getElementById("timesliderDiv").style.display = "block";
		timeslider.set({
			name: "timeslider",
	    	minimum:0, 
	    	maximum:getYearsArray(currentDataframe).length-1, 
	    	onChange:function(val){ yearChange(val) }, 
	    	value:0, 
	    	discreteValues:getYearsArray(currentDataframe).length,
	    	showButtons:true, 
	    	intermediateChanges:true, 
	    	slideDuration:0,
	    	style:{width:"20%", height:"20px"} 
		})
		document.getElementById("legendTheme").innerHTML = layerAttributes[1] + ": " + getYearsArray(currentDataframe)[0];
		document.getElementById("timesliderValue").innerHTML = layerAttributes[1] + ": " + getYearsArray(currentDataframe)[0];
		document.getElementById("timesliderMinLabel").innerHTML = getYearsArray(currentDataframe)[0];
		document.getElementById("timesliderMaxLabel").innerHTML = getYearsArray(currentDataframe)[getYearsArray(currentDataframe).length-1];
	}
	else if (getYearsArray(currentDataframe).length == 1){
		document.getElementById("timesliderDiv").style.display = "none";
		if (getYearsArray(currentDataframe)[0] == ""){
			document.getElementById("timesliderValue").innerHTML = layerAttributes[1];
			document.getElementById("legendTheme").innerHTML = layerAttributes[1];
		}
		else {
			document.getElementById("timesliderValue").innerHTML = layerAttributes[1] + ": " + getYearsArray(currentDataframe)[0];
			document.getElementById("legendTheme").innerHTML = layerAttributes[1] + ": " + getYearsArray(currentDataframe)[0];
		}
	}
	else {
		document.getElementById("timesliderDiv").style.display = "none";
		document.getElementById("timesliderValue").innerHTML = layerAttributes[1];
		document.getElementById("legendTheme").innerHTML = layerAttributes[1];
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
	    	maximum:getYearsArray(currentDataframe).length-1, 
	    	onChange:function(val){ yearChange(val) }, 
	    	value:0, 
	    	discreteValues:getYearsArray(currentDataframe).length,
	    	showButtons:true, 
	    	intermediateChanges:true, 
	    	slideDuration:0,
	    	style:{width:"20%", height:"20px"} 
		}, "timeslider");
	});
	document.getElementById("timesliderValue").innerHTML = layerAttributes[1] + ": " + getYearsArray(currentDataframe)[0];
	document.getElementById("legendTheme").innerHTML = layerAttributes[1] + ": " + getYearsArray(currentDataframe)[0];
}