function addLegendItems(classesArray){
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
		minField.innerHTML = classesArray[i][1];
		listItem.appendChild(minField);

		var dash = document.createElement("td");
		dash.innerHTML = "&ndash;";
		listItem.appendChild(dash);

		var maxField = document.createElement("td");
		maxField.innerHTML = classesArray[i][2];
		listItem.appendChild(maxField);

		var unit = document.createElement("td");
		unit.innerHTML = "Einheit";
		listItem.appendChild(unit);

		legendList.appendChild(listItem);
	}

	legendDiv.appendChild(legendList);
}