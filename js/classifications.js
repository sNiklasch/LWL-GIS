function range(low, high, step) {
  //  discuss at: http://phpjs.org/functions/range/
  //  original by: Waldo Malqui Silva
  //   example 1: range ( 0, 12 );
  //   returns 1: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  //   example 2: range( 0, 100, 10 );
  //   returns 2: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
  //   example 3: range( 'a', 'i' );
  //   returns 3: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']
  //   example 4: range( 'c', 'a' );
  //   returns 4: ['c', 'b', 'a']

  var matrix = [];
  var inival, endval, plus;
  var walker = step || 1;
  var chars = false;

  if (!isNaN(low) && !isNaN(high)) {
    inival = low;
    endval = high;
  } else if (isNaN(low) && isNaN(high)) {
    chars = true;
    inival = low.charCodeAt(0);
    endval = high.charCodeAt(0);
  } else {
    inival = (isNaN(low) ? 0 : low);
    endval = (isNaN(high) ? 0 : high);
  }

  plus = ((inival > endval) ? false : true);
  if (plus) {
    while (inival <= endval) {
      matrix.push(((chars) ? String.fromCharCode(inival) : inival));
      inival += walker;
    }
  } else {
    while (inival >= endval) {
      matrix.push(((chars) ? String.fromCharCode(inival) : inival));
      inival -= walker;
    }
  }

  return matrix;
}

function quantile(yearInd, number, colorStart, colorEnd) {

  autoClassesStartColor = colorStart;
  autoClassesEndColor = colorEnd;
  autoClassesBreaks = number;
  yearIndex = yearInd;

  console.log('classification: quantile');
  activeClassification = 2; // 2 = automatic
  classificationArray = getLayerData(currentDataframe, yearIndex); // jshint ignore:line
  var colorArray = generateColor(colorStart, colorEnd, number); // jshint ignore:line

  classificationArray.sort(function(a,b){
    return a[1]-b[1];
  });
  var n = classificationArray.length;
  var breaks = [];
  var test = range(0,number);
  test.forEach(function(elem, index, array){
    var q = elem / parseFloat(number+1);
    var a = q * n;
    var aa = parseInt(q * n);
    var r = a - aa;
    var Xq = (1 - r) * classificationArray[aa][1] + r * classificationArray[aa+1][1];
    breaks.push(Xq);
  });
  breaks.push(classificationArray[n-1][1]);

  require(['dojo/_base/Color'],function(Color){
    for(var i = 0; i < classificationArray.length; i++) {
      for(var j = 1; j < breaks.length; j++) {
        if(classificationArray[i][1] <= breaks[j]) {
          var color = Color.fromHex('#'+colorArray[j-1]);
          classificationArray[i][1] = color;
          break;
        }
      }
    }
  });

  return classificationArray;
}

function jenks(yearInd, number, colorStart, colorEnd) {
  autoClassesStartColor = colorStart;
  autoClassesEndColor = colorEnd;
  autoClassesBreaks = number;
  yearIndex = yearInd;

  console.log('classification: quantile');
  activeClassification = 2; // 2 = automatic
  classificationArray = getLayerData(currentDataframe, yearIndex); // jshint ignore:line
  var minmax = getMinMax(currentDataframe,yearIndex); // jshint ignore:line
}

function rpretty(dmin, dmax, n) {
  var resultArray = [];
  var min_n = parseInt(n / 3);
  var shrink_sml = 0.75;
  var high_u_bias = 1.5;
  var u5_bias = 0.5 + 1.5 * high_u_bias;
  var h = high_u_bias;
  var h5 = u5_bias;
  var ndiv = n;

  var dx = dmax - dmin;
  var cell, U, i_small;
  if (dx === 0 && dmax === 0) {
    cell = 1.0;
    i_small = true;
    U = 1;
  } else {
    cell = Math.max(Math.abs(dmin),Math.abs(dmax));
    if (h5 >= 1.5 * h + 0.5) {
      U = 1 + (1.0/(1+h));
    } else {
      U = 1 + (1.5 / (1 + h5));
      i_small = dx < (cell * U * Math.max(1.0, ndiv) * 1e-07 * 3.0);
    }
  }

  if (i_small) {
    if (cell > 10) {
      cell = 9 + cell / 10;
      cell = cell * shrink_sml;
    }
    if (min_n > 1) {
      cell = cell / min_n;
    }
  } else {
    cell = dx;
    if (ndiv > 1) {
      cell = cell / ndiv;
    }
  }

  if (cell < 20 * 1e-07) {
    cell = 20 * 1e-07;
  }

  base = Math.pow(10.0, Math.floor(Math.log10(cell)));
  var unit = base;
  if ((2 * base) - cell < h * (cell - unit)) {
    unit = 2.0 * base;
    if ((5 * base) - cell < h5 * (cell - unit)) {
      unit = 5.0 * base;
      if ((10 * base) - cell < h * (cell - unit)) {
        unit = 10.0 * base;
      }
    }
  }

  var ns = Math.floor(dmin / unit + 1e-07);
  var nu = Math.ceil(dmax / unit - 1e-07);

  while (ns * unit > dmin + (1e-07 * unit)) {
    ns = ns - 1;
  }
  while (nu * unit < dmax - (1e-07 * unit)) {
    nu = nu + 1;
  }

  var k = Math.floor(0.5 + nu-ns);
  if (k < min_n) {
    k = min_n - k;
    if (ns >= 0) {
      nu = nu + k / 2;
      ns = ns - k / 2 + k % 2;
    } else {
      ns = ns - k / 2;
      nu = nu + k / 2 + k % 2 ;
    }
  } else {
    ndiv = k;
  }

  var graphmin = ns * unit;
  var graphmax = nu * unit;

  var count = parseInt(Math.ceil(graphmax - graphmin))/unit;
  for (var i = 0; i < count; i++) {
    tempVal = graphmin + i * unit;
    resultArray.push(tempVal);
  }

  if (resultArray[0] < dmin) {
    resultArray[0] = dmin;
  }
  if (resultArray[resultArray.length-1] > dmax) {
    resultArray[resultArray.length-1] = dmax;
  }
  return resultArray;
}

function standardDeviation(yearInd, number, colorStart, colorEnd) {

  autoClassesStartColor = colorStart;
  autoClassesEndColor = colorEnd;
  autoClassesBreaks = number;
  yearIndex = yearInd;

  console.log('classification: standard deviation');
  activeClassification = 2; // 2 = automatic
  classificationArray = getLayerData(currentDataframe, yearIndex); // jshint ignore:line

  var mean = 0.0;
  var sd2 = 0.0;
  var n = classificationArray.length;
  var minmax = getMinMax(currentDataframe,yearIndex); // jshint ignore:line
  for (var i = 0; i < n; i++) {
    mean = mean + classificationArray[i][1];
  }
  mean = mean / n;
  for (var j = 0; j < n; j++) {
    var sd = classificationArray[j][1] - mean;
    sd2 += sd * sd;
  }

  sd2 = Math.sqrt(sd2 / n);
  var res = rpretty((minmax[0]-mean)/sd2, (minmax[1]-mean)/sd2, number+1);
  var res2 = [];
  res.forEach(function(elem, index, arr){
    tempVal = (elem * sd2) + mean;
    res2.push(tempVal);
  });
  res2.push(minmax[1]);
  var colorArray = generateColor(colorStart, colorEnd, res2.length); // jshint ignore:line

  require(['dojo/_base/Color'],function(Color){
    for(var i = 0; i < classificationArray.length; i++) {
      for(var j = 1; j < res2.length; j++) {
        if(classificationArray[i][1] <= res2[j]) {
          var color = Color.fromHex('#'+colorArray[j-1]);
          classificationArray[i][1] = color;
          break;
        }
      }
    }
  });

  return classificationArray;
}

function pretty(yearInd, number, colorStart, colorEnd) {
  autoClassesStartColor = colorStart;
  autoClassesEndColor = colorEnd;
  autoClassesBreaks = number;
  yearIndex = yearInd;

  console.log('classification: quantile');
  activeClassification = 2; // 2 = automatic
  classificationArray = getLayerData(currentDataframe, yearIndex); // jshint ignore:line
  var minmax = getMinMax(currentDataframe,yearIndex); // jshint ignore:line

  var res = rpretty(minmax[0], minmax[1], number);
  res.push(minmax[1]);

  var colorArray = generateColor(colorStart, colorEnd, res.length); // jshint ignore:line

  require(['dojo/_base/Color'],function(Color){
    for(var i = 0; i < classificationArray.length; i++) {
      for(var j = 1; j < res.length; j++) {
        if(classificationArray[i][1] <= res[j]) {
          var color = Color.fromHex('#'+colorArray[j-1]);
          classificationArray[i][1] = color;
          break;
        }
      }
    }
  });

  return classificationArray;
}

function addEqualBreaksNew(yearInd, number, colorStart, colorEnd) { //jshint ignore:line

    autoClassesStartColor = colorStart;
    autoClassesEndColor = colorEnd;
    autoClassesBreaks = number;
    yearIndex = yearInd;

    console.log('classification equal breaks');
    activeClassification = 2; // 2 = automatic
    classificationArray = getLayerData(currentDataframe, yearIndex); // jshint ignore:line

    //maximum of 12 classes:
    if (number > 11){
        number = 11;
        document.getElementById('equalBreaksText').value = 12;
    }
    var minmax = getMinMax(currentDataframe); // jshint ignore:line
    var breakStep = (minmax[1] - minmax[0]) / (number + 1); //size of one class
    var colorArray = generateColor(colorStart, colorEnd, number);   // jshint ignore:line
                                                                    //generates an array of an color gradient

    legendArray = new Array(number+1);
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


/**
 * method for automatic (equal) breaks
 */
function classify(classification, yearInd, number, colorStart, colorEnd) {

  switch (classification) {
    case 'equalInterval':
      colorizeLayer(addEqualBreaksNew(yearInd,number,colorStart,colorEnd));
      break;
    case 'quantile':
      colorizeLayer(quantile(yearInd,number,colorStart,colorEnd));
      break;
    case 'jenks':
      colorizeLayer(jenks(yearInd,number,colorStart,colorEnd));
      break;
    case 'standardDeviation':
      colorizeLayer(standardDeviation(yearInd,number,colorStart,colorEnd));
      break;
    case 'pretty':
      colorizeLayer(pretty(yearInd,number,colorStart,colorEnd));
      break;
    default:
      break;
  }
}