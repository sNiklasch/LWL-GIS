function addLegendItems(classesArray){
	document.getElementById("legendTitle").innerHTML = "<div style='font-size:1.5em;'>Legende</div>" + getLegendAttributes(currentDataframe, 3);
	var legendDiv = document.getElementById("myLegend");
	legendDiv.innerHTML = "";
	var legendList = document.createElement("table");

	for (var i = 0; i < classesArray.length; i++) {
		var listItem = document.createElement("tr");
		
		/*var colorField = document.createElement("td");
		colorField.innerHTML = '<div style="background-color:' + classesArray[i][0] + '; height:20px; width:35px;">test</div>'
		listItem.appendChild(colorField);*/

		var colorField = document.createElement("div");
		if (classesArray[i][0] == 0) {
			colorField.style.backgroundColor = "#000000";
		}
		else {
			colorField.style.backgroundColor = "#" + classesArray[i][0];
		}
		colorField.style.height = "20px";
		colorField.style.width = "35px";
		colorField.style.opacity = 1;
		colorField.className = "legendColorfield"
		listItem.appendChild(colorField);

		var minField = document.createElement("td");
		minField.innerHTML = Math.floor(classesArray[i][1]*100)/100;
		listItem.appendChild(minField);

		var dash = document.createElement("td");
		dash.innerHTML = "&ndash;";
		listItem.appendChild(dash);

		var less = document.createElement("td");
		if (i != classesArray.length - 1){less.innerHTML = "<"};
		listItem.appendChild(less);
		
		var maxField = document.createElement("td");
		maxField.innerHTML = Math.floor(classesArray[i][2]*100)/100;
		listItem.appendChild(maxField);

		var unit = document.createElement("td");
		unit.innerHTML = getLegendAttributes(currentDataframe, 2);
		listItem.appendChild(unit);

		legendList.appendChild(listItem);
	}

	legendDiv.appendChild(legendList);
}

function getLegendAttributes(dataframe, attribute){
	for (var i = allLayerAttributes.length - 1; i >= 0; i--) {
		if (allLayerAttributes[i][0] == dataframe){
			return allLayerAttributes[i][attribute];
		}
	};
}