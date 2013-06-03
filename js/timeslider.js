var timeslider;

function updateTimeslider(){	
	if (years[currentLayer].length > 1){
		document.getElementById("timeslider").innerHTML = "";
		deleteSliderId();
		createTimeslider();
		document.getElementById("timesliderValue").innerHTML = years[currentLayer][initYearValue];
	}
	else if (years[currentLayer].length == 1){
		document.getElementById("timeslider").innerHTML = "";
		document.getElementById("timesliderValue").innerHTML = years[currentLayer][0];
	}
	else {
		document.getElementById("timeslider").innerHTML = "";
		document.getElementById("timesliderValue").innerHTML = "";
	}
}

function createTimeslider(){
	require(["dijit/form/HorizontalSlider", "dojo/domReady!"], function(HorizontalSlider){
	timeslider = new HorizontalSlider({
		name: "timeslider",
    	minimum:0, 
    	maximum:years[currentLayer].length-1, 
    	onChange:function(val){ yearChange(val) }, 
    	value:initYearValue, 
    	discreteValues:years[currentLayer].length,
    	showButtons:true, 
    	intermediateChanges:true, 
    	slideDuration:0,
    	style:{width:"20%", height:"20px"} 
	}, "timeslider");
});
}

function deleteSliderId(){
	var ids = ["timeslider"];

	dijit.registry.forEach(function(w){ 
	   if(dojo.indexOf(ids,1)){ // 1 will be yourid it will get destroy
	        w.destroyRecursive();
	   }
});
	document.getElementById("timesliderDiv").innerHTML = "<div id='timeslider'></div>";
}