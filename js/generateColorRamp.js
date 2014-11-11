function interpolate(pBegin, pEnd, pStep, pMax) {
    if (pBegin < pEnd) {
        return ((pEnd - pBegin) * (pStep / pMax)) + pBegin;
    } else {
        return ((pBegin - pEnd) * (1 - (pStep / pMax))) + pEnd;
    }

}

function generateColor(theColorBegin, theColorEnd, theNumSteps) {
    // var colorArray = new Array();
    var colorArray = [];
    theColorBegin = parseInt(theColorBegin, 16);
    theColorEnd = parseInt(theColorEnd, 16);

    /* jshint ignore:start */
    var theR0 = (theColorBegin & 0xff0000) >> 16;
    var theG0 = (theColorBegin & 0x00ff00) >> 8;
    var theB0 = (theColorBegin & 0x0000ff) >> 0;
    var theR1 = (theColorEnd & 0xff0000) >> 16;
    var theG1 = (theColorEnd & 0x00ff00) >> 8;
    var theB1 = (theColorEnd & 0x0000ff) >> 0;

    for (var i = 0; i <= theNumSteps; i++) {
        var theR = interpolate(theR0, theR1, i, theNumSteps);
        var theG = interpolate(theG0, theG1, i, theNumSteps);
        var theB = interpolate(theB0, theB1, i, theNumSteps);
        var theVal = (((theR << 8) | theG) << 8) | theB;
        colorArray[i] = theVal.toString(16);
    }
    /* jshint ignore:end */

    return colorArray;
}
