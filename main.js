dojo.require("esri.map");
dojo.require("esri.layers.FeatureLayer");
dojo.require("esri.layers.osm");
dojo.require("esri.layers.agsdynamic");
dojo.require("esri.toolbars.draw");
dojo.require("esri.dijit.Print");
dojo.require("esri.dijit.Scalebar");
dojo.require("esri.dijit.Legend");
dojo.require("esri.dijit.Popup");
dojo.require("esri.dijit.BasemapGallery");
dojo.require("esri.tasks.query");
dojo.require("esri.tasks.geometry");
dojo.require("esri.virtualearth.VETiledLayer");
dojo.require("esri.arcgis.utils");
dojo.require("esri.renderer");

dojo.require("dojox.widget.TitleGroup");
dojo.require("dojox.charting.themes.Julie");

dojo.require("dojo.parser");

dojo.require("dijit.form.DropDownButton");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.Textarea");
dojo.require("dijit.form.DropDownButton");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.form.Slider");
dojo.require("dijit.TitlePane");
dojo.require("dijit.TooltipDialog");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.AccordionContainer");
dojo.require("dijit.dijit");
dojo.require("dijit.Tooltip");


var breakCount = 0; // keep track of how many individual breaks have been created, used to fetch the correct field values
var diagramLayer; // the active clickable diagram layer

var map, queryTask, query, template, disconHandler, initExtent, maxExtent, operationalLayer, year;

//the MapServer for the whole app:
var mapServer = "http://giv-learn2.uni-muenster.de/ArcGIS/rest/services/LWL/Atlas/MapServer";
var fIDkreisnamen = 0;
var fIDgeburten = 1;
var fIDsterberate = 2;
var fIDdemographie = 3;
var fIDreligion = 4;
var fIDleistungsempfaenger = 5;

var attributeFields = ["Kreisname", "geburten_.geb", "gestorbene_.gest", "demographie_.dem", "Katholisch", "Leistungsempfaenger_2005.Leistungsempfänger_Pflegeversicherung_I"]; // used fields from the raw data 

var diagramFields = new Array(attributeFields.length);

var years = [2009, 2010, 2011];
var initYear = 2010;
var currentYear = initYear;

var activeLayer = fIDgeburten; // which layer is active at the beginning
var activeDiagramLayer = 0;
var labelVisibility = true;
var equalBreaksOptions = [  [2, "FFFFFF", "FFFFFF"],
                            [3, "FF0000", "00FF00"],
                            [3, "00FF00", "FF0000"],
                            [3, "00FF00", "FF0000"]];
var activeClassification = 0;

var legend;
/**
 * at this point the min and max values have to be entered manually for each layer.
 * this is not a good approach, they should be obtained directly from the data on the server
 * please change this! 
 */ 
var minValues = [0, 832, 1000, 3432];
var maxValues = [0, 5306, 8000, 23860]; 
/**
 * due to a bug in ArcGIS where invoking any method that re-centers the map a onPan() event is fired,
 * this counter is used to prevent an infinite loop of re-centering between the two maps in split-mode.
 */
var counter = 0;

/**
 *variables for the map export
 */
var exportTitle = "kein Titel";
var exportAuthor = "kein Autor";
var printer;

function init() {
    //$("#menuPane-classes").show(); kann geloescht werden
    addTooltips(); //the mouse-over tooltips are created programmatically
    var popup = new esri.dijit.Popup(null, dojo.create("div")); //ini popups for diagrams

    esri.config.defaults.io.proxyUrl = "/arcgisserver/apis/javascript/proxy/proxy.ashx";

    
    initExtent = new esri.geometry.Extent(518012, 6573584, 1286052, 6898288, new esri.SpatialReference({
        wkid: 102100
    })); //initial map extent
    
    maxExtent = initExtent;
    
    for (var i = 0; i < parent.frames.length; i++) {
        if (parent.frames[i].name != self.name) {
            initExtent = parent.frames[i].map.extent; //in split-mode get extent from other map
        }
    }
    
    map = new esri.Map("map", {
        minZoom: 8,
    	extent: initExtent,
    	infoWindow: popup,
      	sliderStyle: "large"
    });
    
    //createBasemapGallery();
        
    //various map events
    //dojo.connect(map, "onZoom", reLocate);
    dojo.connect(map, "onExtentChange", reLocate);

    dojo.connect(map, "onMouseDown", function () {
        for (var i = 0; i < parent.frames.length; i++) {
            parent.frames[i].counter = 0; //the counter is used if any pan related events occured onMouseDown
        }

    });
    
    dojo.connect(map, "onMouseWheel", function () {
        for (var i = 0; i < parent.frames.length; i++) {
            parent.frames[i].counter = 0;
        }
    });
    
    //Initialize the Legend:
        dojo.connect(map,'onLayersAddResult',function(results){
          var layerInfo = dojo.map(results, function(layer,index){
            return {layer:layer.layer,title:layer.layer.name};
          });
          if(layerInfo.length > 0){
            legend = new esri.dijit.Legend({
              map:map,
              layerInfos:layerInfo
            },"legend");
            legend.startup();
          }
        });



    //resize the map when the browser resizes
    dojo.connect(dijit.byId('map'), 'resize', map, map.resize);
    
    //Scalebar
    dojo.connect(map, 'onLoad', function (theMap) {
        var scalebar = new esri.dijit.Scalebar({
            map: map,
            scalebarUnit: "metric",
            attachTo: "bottom-left"
        });
        dojo.connect(dijit.byId('map'), 'resize', map, map.resize);
    });
        
    
    //Baselayer
    //tiledMapServiceLayer = new esri.layers.ArcGISTiledMapServiceLayer("http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer");
    osmLayer = new esri.layers.OpenStreetMapLayer({
	    id: "osmLayer"
    });
    
    map.addLayer(osmLayer);
    map.removeLayer(osmLayer);
    
    //dojo.connect(map, "onZoomEnd", function() { 
    //						operationalLayer.setMaxAllowableOffset(maxOffset(map,10));
    //										});
    // The offset is calculated as approximately 1 vertex per pixel: 
    //var maxOffset = function maxOffset(map, pixelTolerance) { return Math.floor(map.extent.getWidth() / map.width) * pixelTolerance; };
    
    //Check if split-screen is active:
    onLoadCheck();
	
    initDiagramFields(); //initialize which fields should be used for which diagram layer
	initLabels();
}

function initLabels(){    
    //Set labels visible on load:
    operationalLayer = new esri.layers.ArcGISDynamicMapServiceLayer(mapServer, { "id": "collection" });
    //document.getElementById("labelChk").checked = true;
    map.addLayers([operationalLayer]);
    operationalLayer.setVisibleLayers([fIDkreisnamen, activeLayer]);
    window.setTimeout("addEqualBreaks(equalBreaksOptions[activeLayer][0], equalBreaksOptions[activeLayer][1], equalBreaksOptions[activeLayer][2])", 1000);
}


function showExtent(extent, delta, levelChange, lod) {
	
		//In javascript, object passes byref. so it's not correct to difine new extent using
		//"var adjustedEx = extent;"
		var adjustedEx = new esri.geometry.Extent(extent.xmin, extent.ymin, extent.xmax, extent.ymax, extent.spatialReference);
		if (self.name == "frame1"){
		var flag = false;	
		//set a buffer to make the max extent a slightly bigger to void minor differences
		//the map unit for this case is meter. 
				console.log(extent.ymin - maxExtent.ymin);
		    if(extent.xmin < maxExtent.xmin-500) {
				adjustedEx.xmin = maxExtent.xmin;
				adjustedEx.xmax = Math.abs(extent.xmin - maxExtent.xmin) + extent.xmax;
				
                flag = true;
            }
			if(extent.ymin < maxExtent.ymin-500) {
			    adjustedEx.ymin = maxExtent.ymin;
			    adjustedEx.ymax = Math.abs(extent.ymin - maxExtent.ymin) + extent.ymax;
			    
                flag = true;
            }
			if(extent.xmax > maxExtent.xmax+500) {
			    adjustedEx.xmax = maxExtent.xmax;
			    adjustedEx.xmin =extent.xmin - Math.abs(extent.xmax - maxExtent.xmax);
			    
                flag = true;            }
			if(extent.ymax > maxExtent.ymax+500) {
			    adjustedEx.ymax = maxExtent.ymax;
			    adjustedEx.ymin =extent.ymin - Math.abs(extent.ymax - maxExtent.ymax);
			    
                flag = true;
            }
			if (flag === true) {
				map.setExtent(adjustedEx);
			}
			flag = false;}
			reLocate(adjustedEx);
}

function fullExtent(){
    map.setExtent(maxExtent);
}

/**
 * function to set title and author of the map and export it
 */        
function exportChangeValues(){
    exportTitle = document.getElementById("mapExportTitle").value;
    exportAuthor = document.getElementById("mapExportAuthor").value;
    
    //printer
    if(printer != undefined){
    	printer.destroy();
    }
    printer = new esri.dijit.Print({
          map: map,
          templates: [{
			    label: "PDF",
			    format: "PNG32",
			    layout: "A4 Portrait",
			    layoutOptions: {
			      titleText: exportTitle,
			      authorText: exportAuthor,
			      copyrightText: "© Landschaftsverband Westfalen-Lippe (LWL), 48133 Münster",
			      scalebarUnit: "Kilometers"
			    }
			  }],
         url: "http://giv-learn2.uni-muenster.de/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task/"
         }, dojo.byId("printButton"));
    document.getElementById("exportWarning").innerHTML = "Achtung: Das exportieren der Karte kann einige Sekunden in Anspruch nehmen.";
    printer.startup();
    
    dojo.connect(printer,'onPrintStart',function(){
    	console.log('The print operation has started');
    	document.getElementById("loadingImage").style.visibility = "visible";
    });
    
    dojo.connect(printer,'onPrintComplete',function(value){
    	console.log('The url to the print image is : ' + value.url);
    	document.getElementById("loadingImage").style.visibility = "hidden";
    });
}


/**
 * opacity for OperationalLayer
*/
function setFeatureLayerOpacity(opacity) {
    operationalLayer.setOpacity(opacity);
} 


function initDiagramFields() {
    diagramFields[4] = new Array(4);
    diagramFields[4][1] = "Katholisch";
    diagramFields[4][2] = "Evangelisc";
    diagramFields[4][3] = "Andere";
    diagramFields[4][4] = "Keine";
    diagramFields[5] = new Array(3);
    diagramFields[5][1] = "'2005$'.Leistungsempfänger Pflegeversicherung I";
    diagramFields[5][2] = "'2005$'.Leistungsempfänger Pflegeversicherung II";
    diagramFields[5][3] = "'2005$'.Leistungsempfänger Pflegeversicherung III";
}



/**
 * additionally to the standard overlay, this can add an invisible,
 * but clickable diagram layer
 */
function initDiagramLayer() {
    diagramLayer = new esri.layers.FeatureLayer("http://giv-learn2.uni-muenster.de/ArcGIS/rest/services/LWL/lwl_collection/MapServer/" + activeLayer, {
        mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
        outFields: ["*"],
        opacity: .0
    });
    diagramLayer.setSelectionSymbol(new esri.symbol.SimpleFillSymbol());
    map.addLayers([diagramLayer]);    
}

/**
 * Creates a QueryTask to show diagrams on certain layers onClick
 */
function connectDiagramFunc(layerNr) {
    disconHandler = dojo.connect(map, "onClick", executeQueryTask);

    queryTask = new esri.tasks.QueryTask("http://giv-learn.uni-muenster.de/ArcGIS/rest/services/LWL/lwl_collection/MapServer/" + layerNr);

    query = new esri.tasks.Query();
    query.returnGeometry = true;
    query.outFields = ["*"];
    query.outSpatialReference = map.spatialReference;
    query.spatialRelationship = esri.tasks.Query.SPATIAL_REL_INTERSECTS;

    var diagramF = new Array(diagramFields[layerNr].length - 1);
    for (i = 0; i < diagramFields[layerNr].length - 1; i++) {
        diagramF[i] = diagramFields[layerNr][i + 1];

    }

    //Reference the chart theme here too
    template = new esri.dijit.PopupTemplate({
        title: "Verteilung in {Kreisname}",
        mediaInfos: [{
            type: "piechart",
            value: {
                fields: diagramF,
                theme: "Julie"
            }
        }]
    });
}


/**
 * This method can assign a new color scheme to a layer
 * as used for individual breaks
 */
function colorChange() {
    activeClassification = 1;
	//Set the default symbol, which is used for unmatched values
    symbol = new esri.symbol.SimpleFillSymbol();
    symbol.setColor(new dojo.Color([150, 150, 150, 0.75]));
    
    var renderer = new esri.renderer.ClassBreaksRenderer(symbol, attributeFields[activeLayer] + currentYear);
    for (var i = 1; i <= breakCount; i++) {
        var element = document.getElementById("breakFrom" + i);
        if (element) {
            renderer.addBreak({
                minValue: document.getElementById("breakFrom" + i).value,
            	maxValue: document.getElementById("breakTo" + i).value,
            	symbol: new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color("#" + document.getElementById("myValue" + i).value)),
                label: document.getElementById("breakFrom" + i).value + " - " + document.getElementById("breakTo" + i).value
            });
        }
    }
    
    var optionsArray = [];
    var drawingOptions = new esri.layers.LayerDrawingOptions();
    drawingOptions.renderer = renderer;
    optionsArray[activeLayer] = drawingOptions;
    operationalLayer.setLayerDrawingOptions(optionsArray);

    legend.refresh();
}



/**
 * Method for changing the active overlay layer
 */
function layerChange(layerNr) {
	//disconnect and connect click handlers for diagrams based on checkboxes
    if (layerNr == fIDreligion && !(document.getElementById("religionChk").checked)) {
        console.log("entferne religion");
        dojo.disconnect(disconHandler);
        map.removeLayer(diagramLayer);
        diagramLayer = null;
        activeDiagramLayer = 0;
        updateLayerVisibility();
    } else if (layerNr == fIDreligion && document.getElementById("religionChk").checked) {
        console.log("aktiviere religion");
        dojo.disconnect(disconHandler);
        connectDiagramFunc(layerNr);
        document.getElementById("pflegehilfeChk").checked = false;
        if (diagramLayer != null) {
            map.removeLayer(diagramLayer);
            diagramLayer = null;
        }
        initDiagramLayer();
        activeDiagramLayer = layerNr;
        updateLayerVisibility();
    } else if (layerNr == fIDleistungsempfaenger && !(document.getElementById("pflegehilfeChk").checked)) {
        console.log("entferne leistungsempf");
        dojo.disconnect(disconHandler);
        map.removeLayer(diagramLayer);
        diagramLayer = null;
        activeDiagramLayer = 0;
        updateLayerVisibility();
    } else if (layerNr == fIDleistungsempfaenger && document.getElementById("pflegehilfeChk").checked) {
        console.log("aktiviere leistungsempf");
        dojo.disconnect(disconHandler);
        connectDiagramFunc(layerNr);
        document.getElementById("religionChk").checked = false;
        if (diagramLayer != null) {
            map.removeLayer(diagramLayer);
            diagramLayer = null;
        }
        initDiagramLayer();
        activeDiagramLayer = layerNr;
        updateLayerVisibility();
        //handling checkbox for the basemap
    } else if (layerNr == 50 && !(document.getElementById("baseMapChk").checked)) {
    	map.removeLayer(osmLayer);
    } else if (layerNr == 50 && (document.getElementById("baseMapChk").checked)) {
    	map.addLayer(osmLayer, 0);
        //handling checkbox for the operationalLayer
    } else if (layerNr == 60 && (document.getElementById("labelChk").checked)) {
    	labelVisibility = true;
        updateLayerVisibility();
    } else if (layerNr == 60 && !(document.getElementById("labelChk").checked)) {
    	labelVisibility = false;
        updateLayerVisibility();
    } else {
        activeClassification = 0;
        window.setTimeout("addEqualBreaks(equalBreaksOptions[activeLayer][0], equalBreaksOptions[activeLayer][1], equalBreaksOptions[activeLayer][2])", 1000);
		//following applies if only a 'normal' layer change happens
        activeLayer = layerNr; //setting the new layer
        var d = document.getElementById("breaksTable");
        var olddiv = document.getElementById("Breaks");
        d.removeChild(olddiv); //remove previously made class breaks
        var addBreaksTable = document.createElement("table");
        addBreaksTable.setAttribute("id", "Breaks");
        d.appendChild(addBreaksTable);
        breakCount = 0;
        var legendDiv = document.getElementById("legendDiv");
        var leg = document.createElement("div");
        leg.setAttribute("id", "legend");
        legendDiv.appendChild(leg);
        updateLayerVisibility();
    }
}

function yearChange(year){
    if (activeClassification == 1){
        document.getElementById("timesliderValue").innerHTML = year;
        currentYear = year;
        colorChange();
    }
    else {
        document.getElementById("timesliderValue").innerHTML = year;
        currentYear = year;
        console.log(equalBreaksOptions[activeLayer][0]);
        console.log(equalBreaksOptions[activeLayer][1]);
        console.log(equalBreaksOptions[activeLayer][2]);
        addEqualBreaks(equalBreaksOptions[activeLayer][0], equalBreaksOptions[activeLayer][1], equalBreaksOptions[activeLayer][2]);
    }
}

/**
 * method for automatic (equal) breaks
 */
function addEqualBreaks(number, colorStart, colorEnd) {
    equalBreaksOptions[activeLayer][0] = number;
    equalBreaksOptions[activeLayer][1] = colorStart;
    equalBreaksOptions[activeLayer][2] = colorEnd;
    activeClassification = 2;

	if (number > 11){
		number = 11;
		document.getElementById("equalBreaksText").value = 12;
	}

    var breakStep = (maxValues[activeLayer] - minValues[activeLayer]) / (number + 1);
    var colorArray = generateColor(colorStart, colorEnd, number);

    symbol = new esri.symbol.SimpleFillSymbol();
    symbol.setColor(new dojo.Color([150, 150, 150, 0.75]));
    var renderer = new esri.renderer.ClassBreaksRenderer(symbol, attributeFields[activeLayer] + currentYear);
    
    for (var i = 0; i <= number; i++) {
        var min = Math.round((minValues[activeLayer] + i * breakStep) / 10) * 10 + 1;
        var max = Math.round((minValues[activeLayer] + (i + 1) * breakStep) / 10) * 10;
        renderer.addBreak({
            minValue: min,
            maxValue: max,
            symbol: new esri.symbol.SimpleFillSymbol().setColor(dojo.colorFromHex('#' + colorArray[i])),
            label: min + " - " + max
        });
    }

	var breaksList = document.getElementById("Breaks");
	breaksList.innerHTML = '';
	breakCount = 0;
    
    var optionsArray = [];
    var drawingOptions = new esri.layers.LayerDrawingOptions();
    drawingOptions.renderer = renderer;
    optionsArray[activeLayer] = drawingOptions;
    operationalLayer.setLayerDrawingOptions(optionsArray);

    legend.refresh();
}

function updateLayerVisibility(){
	if (labelVisibility == true) {
		if (activeDiagramLayer == 0){
			operationalLayer.setVisibleLayers([fIDkreisnamen, activeLayer]);
		}
		else {
			operationalLayer.setVisibleLayers([fIDkreisnamen, activeLayer, activeDiagramLayer]);
		}
		
	}
	else {
		if (activeDiagramLayer == 0){
			operationalLayer.setVisibleLayers([activeLayer]);
		}
		else {
			operationalLayer.setVisibleLayers([activeLayer, activeDiagramLayer]);
		}
	}
	legend.refresh();
}


/** 
 * executed onClick on a diagram layer
 */
function executeQueryTask(evt) {
    query.geometry = evt.mapPoint;

    var deferred = queryTask.execute(query);

    deferred.addCallback(function (response) {
        // response is a FeatureSet
        // Let's return an array of features.
        return dojo.map(response.features, function (feature) {
            feature.setInfoTemplate(template);
            return feature;
        });
    });

    // InfoWindow expects an array of features from each deferred
    // object that you pass. If the response from the task execution 
    // above is not an array of features, then you need to add a callback
    // like the one above to post-process the response and return an
    // array of features.
    map.infoWindow.setFeatures([deferred]);
    map.infoWindow.show(evt.mapPoint);
}

/**
 * called if in split mode one map is panned
 */
function reLocate(extent) {
	for (var i = 0; i < parent.frames.length; i++) { //go through all frames and re-center
		if (parent.frames[i].name != self.name) {
			parent.frames[i].reCenterAndZoom(extent.getCenter(), map.getLevel(), extent, i);
		}
	}
}

/**
 * in split mode, synchronize zoom levels between both frames
 */
function syncZoom(extent, zoomFactor, anchor, level) {
    console.log("zoom");
    for (var i = 0; i < parent.frames.length; i++) {
        if (parent.frames[i].name != self.name) { 
            try {
                parent.frames[i].counter = 0;
                console.log(level + "/" + zoomFactor);
                parent.frames[i].map.setLevel(level);
            } catch (err) {
                console.log("zoom failed");
            }
        }
    }
}

/**
 * sync both maps in split mode
 * check counter (check if the pan happened through actual mouse input) and
 * if the centers of both maps aren't identical
 */
function reCenterAndZoom(center, zoom, extent, frameNr) {
	if (counter < 1 && map.extent.getCenter().x != center.x && map.extent.getCenter().y != center.y) {
        map.centerAndZoom(center, zoom);
    }
    counter++; //is only reset to zero on onMouseDown()
}

/**
 * this method check on page creation if this is in split mode
 * if it is then the split-button is removed on the newly created frame
 */
function onLoadCheck() {
	if (self.name == "frame1") {
        document.getElementById("welcome").style.visibility = 'visible';
	}
    if (self.name == "frame2") {
        document.getElementById("splitDiv").removeChild(document.getElementById("slideAwayButton_split"));
        if(map != null){
          map.setLevel(parent.frames[0].map.getLevel());
        }
    }

}

/**
 * programmatically add onMouseOver-tooltips
 */
function addTooltips() {
    //GeburtenRate Layer
    new dijit.Tooltip({
        connectId: ["geburtenrateInfo"],
        label: "Diese Ebene zeit an wieviele <br>Geburten es im Jahr 2010 gab.<br><b>Einheit: </b>Anzahl der geborenen Babys",
        showDelay: 0
    });
    //Demographie Layer
    new dijit.Tooltip({
        connectId: ["demographieInfo"],
        label: "Diese Ebene zeigt an wieviele <br>Menschen aus den Bezirken im Jahr <br>2010 weggezogen sind.<br><b>Einheit: </b>Anzahl der Forgezogenen",
        showDelay: 0
    });
    //Sterberate Layer
    new dijit.Tooltip({
        connectId: ["sterberateInfo"],
        label: "Diese Ebene zeigt an wieviele <br>Verstorbene es im Jahr 2010 gab.<br><b>Einheit: </b>Anzahl der Verstorbenen",
        showDelay: 0
    });
    //Religion Layer
    new dijit.Tooltip({
        connectId: ["religionInfo"],
        label: "Diese Ebene zeigt die Religionszugehörigkeit an.<br><br><b>Diese Ebene kann nicht eingefärbt <br>(klassifiziert) werden, durch Klicken auf die <br>Bezirke können Diagramme angezeigt werden.</b>",
        showDelay: 0
    });
    //Pflegehilfe Layer	
    new dijit.Tooltip({
        connectId: ["pflegehilfeInfo"],
        label: "Diese Ebene zeigt an wieviele Leistungsempfänger <br>es in den Pflegestufen 1, 2 oder 3 gibt.<br><br><b>Diese Ebene kann nicht eingefärbt <br>(klassifiziert) werden, durch Klicken auf die <br>Bezirke können Diagramme angezeigt werden.</b>",
        showDelay: 0
    });
    //Themenauswahl Menü
    new dijit.Tooltip({
        connectId: ["themenauswahlInfo"],
        label: "In diesem Untermenü kannst du aussuchen,<br>welche Daten als Ebene über die Karte <br>gelegt werden können.",
        showDelay: 0
    });
    //Klasseneinteilung Menü
    new dijit.Tooltip({
        connectId: ["klasseneinteilungInfo"],
        label: "In diesem Untermenü kannst du <br>die Farbgebung der Karte anpassen.",
        showDelay: 0
    });
}

dojo.addOnLoad(init);
