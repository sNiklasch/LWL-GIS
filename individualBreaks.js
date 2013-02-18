function addIndivBreakField() {
    var initialFrom = minValues[activeLayer];
    var initialTo = maxValues[activeLayer];

    if (breakCount > 0) {
    	//Wenn ein Feld exisitert, wird in die Grenzen des neuen Feldes die obere Grenze eingetragen:
        initialFrom = document.getElementById("breakTo" + (breakCount)).value;
        //initialTo = parseInt(document.getElementById("breakTo" + (breakCount)).value);
    }
    
    breakCount++;
    var breaksList = document.getElementById("Breaks");

    var breakEntry = document.createElement("tr");
    breakEntry.setAttribute("id", "tr" + breakCount);

    var breakFieldFrom = document.createElement("td");
    breakFieldFrom.innerHTML = '<input type="text" class="range" style="width:45px;" id="breakFrom' + breakCount + '" value="' + initialFrom + '"></input>';
    breakEntry.appendChild(breakFieldFrom);

    var breakFieldFromLabel = document.createElement("td");
    breakFieldFromLabel.innerHTML = '(Min.)';
    breakEntry.appendChild(breakFieldFromLabel);

    var breakFieldTo = document.createElement("td");
    breakFieldTo.innerHTML = '<input type="text" class="range" style="width:45px;" id="breakTo' + breakCount + '" value="' + initialTo + '"></input>';
    breakEntry.appendChild(breakFieldTo);

    var breakFieldToLabel = document.createElement("td");
    breakFieldToLabel.innerHTML = '(Max.)';
    breakEntry.appendChild(breakFieldToLabel);

    var breakColor = document.createElement("td");
    var idField = 'cp' + breakCount
    var valueField = 'myValue' + breakCount;
    breakColor.innerHTML = '<input class="color {valueElement:' + valueField + '}" id="' + idField + '" style="width:32px;" value="Farbe">';
    breakEntry.appendChild(breakColor);

    var breakColorUnvis = document.createElement("td");
    breakColorUnvis.innerHTML = '<input id="' + valueField + '" style="width:0px; visibility:hidden;">';
    breakEntry.appendChild(breakColorUnvis);
        
    var rembtn = document.createElement("input");
    rembtn.setAttribute("type", "image");
    rembtn.setAttribute("id", "rembtn" + (breakCount));
    rembtn.setAttribute("onclick", "remIndivBreakField(" + breakCount + ")");
    rembtn.setAttribute("src", "images/close20.png");
    breakEntry.appendChild(rembtn);

    breaksList.appendChild(breakEntry);


    jscolor.init();


}

function remIndivBreakField(count) {
    var d = document.getElementById("Breaks");
    var olddiv = document.getElementById("tr" + count);
    d.removeChild(olddiv);
    breakCount--;

}
