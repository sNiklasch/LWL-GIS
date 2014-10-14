/**
 * method for automatic (equal) breaks
 */

function addEqualBreaksNew(yearInd, number, colorStart, colorEnd) { //jshint ignore:line

    var autoClassesStartColor = colorStart;
    var autoClassesEndColor = colorEnd;
    var autoClassesBreaks = number;
    var yearIndex = yearInd;

    console.log('classification');
    var activeClassification = 2; // 2 = automatic
    var classificationArray = getLayerData(currentDataframe, yearIndex); // jshint ignore:line

    //maximum of 12 classes:
    if (number > 11){
        number = 11;
        document.getElementById('equalBreaksText').value = 12;
    }
    var minmax = getMinMax(currentDataframe); // jshint ignore:line
    var breakStep = (minmax[1] - minmax[0]) / (number + 1); //size of one class
    var colorArray = generateColor(colorStart, colorEnd, number);   // jshint ignore:line
                                                                    //generates an array of an color gradient

    var legendArray = new Array(number+1);
    for (var i = 0; i < legendArray.length; i++) {
        legendArray[i] = new Array(3);
        legendArray[i][0] = colorArray[i];
        legendArray[i][1] = minmax[0] + (breakStep * i);
        legendArray[i][2] = minmax[0] + (breakStep * (i + 1));
    }

    console.log(legendArray);

    var colorIndex;
    for (var j = classificationArray.length - 1; j >= 0; j--) {
        if (classificationArray[j][1] === minmax[1]){
            colorIndex = number;
        }
        else if (classificationArray[j][1] === minmax[0]){
            colorIndex = 0;
        }
        else{
            colorIndex = Math.floor((classificationArray[j][1] - minmax[0]) / breakStep);
        }
        classificationArray[j][1] = [dojo.colorFromHex('#' + colorArray[colorIndex]).r,dojo.colorFromHex('#' + colorArray[colorIndex]).g,dojo.colorFromHex('#' + colorArray[colorIndex]).b,dojo.colorFromHex('#' + colorArray[colorIndex]).a];
    }

    console.log(classificationArray);
    return classificationArray;
}

function createColorArrayByLegendArray(legendArray){
    var classificationArray = getLayerData(currentDataframe, yearIndex); // jshint ignore:line

    for (var i = classificationArray.length - 1; i >= 0; i--) {
        var found = false;
        for (var j = legendArray.length - 1; j >= 0; j--) {
            if (j !== 0) {
                if (classificationArray[i][1] > legendArray[j][1] && classificationArray[i][1] <= legendArray[j][2] && found !== true){
                    console.log(legendArray[j][1] + ' / ' + classificationArray[i][1] + ' / ' + legendArray[j][2]);
                    classificationArray[i][1] = [dojo.colorFromHex('#' + legendArray[j][0]).r,dojo.colorFromHex('#' + legendArray[j][0]).g,dojo.colorFromHex('#' + legendArray[j][0]).b,dojo.colorFromHex('#' + legendArray[j][0]).a];
                    found = true;
                }
            }
            else {
                if (classificationArray[i][1] >= legendArray[j][1] && classificationArray[i][1] <= legendArray[j][2] && found !== true){
                    console.log(legendArray[j][1] + ' / ' + classificationArray[i][1] + ' / ' + legendArray[j][2]);
                    classificationArray[i][1] = [dojo.colorFromHex('#' + legendArray[j][0]).r, dojo.colorFromHex('#' + legendArray[j][0]).g, dojo.colorFromHex('#' + legendArray[j][0]).b, dojo.colorFromHex('#' + legendArray[j][0]).a];
                    found = true;
                }
            }
        }
    }

    console.log(classificationArray);

    return classificationArray;
}

function addIndividualBreaks(){ //jshint ignore:line

    var activeClassification = 1;

    //hex, min, max
    var legendArray = new Array(breakCount); // jshint ignore:line

    for (var i = 1; i <= breakCount; i++) { // jshint ignore:line
        legendArray[i-1] = new Array(3);
        var element = document.getElementById('breakFrom' + i);
        if (element) {
            legendArray[i-1][0] = document.getElementById('myValue' + i).value;
            console.log(legendArray[i-1][0]);
            legendArray[i-1][1] = document.getElementById('breakFrom' + i).value;
            legendArray[i-1][2] = document.getElementById('breakTo' + i).value;
        }
    }
    colorizeLayer(createColorArrayByLegendArray(legendArray)); //jshint ignore:line
}