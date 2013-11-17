/**
* This function returns the Minimum and Maximum Values of all year-values from the given dataframe
*/
function getMinMax(dataframe){
    var min = 99999999999;
    var max = -99999999999;
    for (var i = dataframe.length - 1; i >= 0; i--) {
        if (dataframe[i].Name != "Jahre"){
            for (var j = 0; j <= dataframe[i].Data.length; j++) {
                if (min > dataframe[i].Data[j]) {min = dataframe[i].Data[j]};
                if (max < dataframe[i].Data[j]) {max = dataframe[i].Data[j]};
            };
        }
    }
    return [min, max];
}

/**
* This function returns an Array with the Country-names and Values of the given year from the given dataframe (from lwldatajson.js)
*/

function getLayerData(dataframe, yearIndex){
    var dataArray = defaultClassification;
    var helpIndex = 0;
    for (var i = dataframe.length - 1; i >= 0; i--) {
        if (dataframe[i].Name != "Jahre"){
            dataArray[helpIndex][0] = dataframe[i].Name;
            dataArray[helpIndex][1] = dataframe[i].Data[yearIndex];
            helpIndex++;
        }
    }
    return dataArray;
}


function getYearIndex(dataframe, year){
    var yearIndex = 0;
    for (var i = dataframe.length - 1; i >= 0; i--) {
        if (dataframe[i].Name == "Jahre"){
            for (var j = 0; j <= dataframe[i].Data.length; j++) {
                if (dataframe[i].Data[j] == year){
                    yearIndex = j;
                }
            }
        }
    }
    return yearIndex;
}

function getYearsArray(dataframe){
    for (var i = dataframe.length - 1; i >= 0; i--) {
        if (dataframe[i].Name == "Jahre"){
            return dataframe[i].Data;
        }
    }
}