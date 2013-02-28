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
var featureLayer; // the active data overlay
var diagramLayer; // the active clickable diagram layer
var activeDiagramLayer = null;

var map, queryTask, query, template, disconHandler, initExtent, maxExtent, labelLayer;

var attributeFields = ["Sterberate_2010.Gestorbene", "Kreisname", "Geburtenrate_2010.Lebendgeborene", "Demographie.Fortgezogene", "Katholisch", "Leistungsempfaenger_2005.Leistungsempfänger_Pflegeversicherung_I"]; // used fields from the raw data 

var diagramFields = new Array(attributeFields.length);

var activeLayer = 2; // which layer is active at the beginning
var legend;
/**
 * at this point the min and max values have to be entered manually for each layer.
 * this is not a good approach, they should be obtained directly from the data on the server
 * please change this! 
 */
var maxValues = [7560, 0, 5107, 23860];  
var minValues = [1382, 0, 1031, 3432];
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
    addTooltips(); //the mouse-over tooltips are created programmatically
    var popup = new esri.dijit.Popup(null, dojo.create("div")); //ini popups for diagrams

    esri.config.defaults.io.proxyUrl = "/arcgisserver/apis/javascript/proxy/proxy.ashx";

    /* mit 3.3 kaputt */
    initExtent = new esri.geometry.Extent(413447, 6487669, 1269542, 7099165, new esri.SpatialReference({
        wkid: 102100
    })); //initial map extent
    
    maxExtent = initExtent;/**/
    
    for (var i = 0; i < parent.frames.length; i++) {
        if (parent.frames[i].name != self.name) {
            initExtent = parent.frames[i].map.extent; //in split-mode get extent from other map
        }
    }
    
    var lods = [ {level: 8, scale: 2311162.217155, resolution: 611.49622628138},
 		   		 {level: 9, scale: 1155581.108577, resolution: 305.748113140558},
 		   		 {level: 10, scale: 577790.554289, resolution: 152.874056570411},
 		   		 {level: 11, scale: 288895.277144, resolution: 76.4370282850732},
 		   		 {level: 12, scale: 144447.638572, resolution: 38.2185141425366},
 		   		 {level: 13, scale: 72223.819286, resolution: 19.1092570712683},
 		   		 {level: 14, scale: 36111.909643, resolution: 9.55462853563415},
 		   		 {level: 15, scale: 18055.954822, resolution: 4.77731426794937},
 		   		 {level: 16, scale: 9027.977411, resolution: 2.38865713397468}];
    
    map = new esri.Map("map", {
    	lods: lods,
    	extent: initExtent,
    	infoWindow: popup,
      	sliderStyle: "large"
    });
    
    //createBasemapGallery();

    //add Layer overlay
    dojo.connect(map, "onLoad", initOperationalLayer);
        
    //various map events
    //dojo.connect(map, "onExtentChange", reLocate);
    dojo.connect(map, "onPanEnd", reLocate);
    dojo.connect(map, "onZoomEnd", reLocate); 

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
    
    //Preparing the Legend:
    dojo.connect(map, 'onLayersAddResult', function (results) {
        var layerInfo = dojo.map(results, function (layer, index) {
            return {
                layer: layer.layer,
                title: layer.layer.name
            };
        });

        //add the legend 
        legend = new esri.dijit.Legend({
            map: map
            //layerInfos: layerInfo
        }, "legend");
        legend.startup();
    });



    //resize the map when the browser resizes
    dojo.connect(dijit.byId('map'), 'resize', map, map.resize);
    
    //Scalebar
    dojo.connect(map, 'onLoad', function (theMap) {
        var scalebar = new esri.dijit.Scalebar({
            map: map,
            scalebarUnit: 'metric',
            attachTo: "bottom-left"
        });
        dojo.connect(dijit.byId('map'), 'resize', map, map.resize);
    });
        
    
    //Baselayer
    //tiledMapServiceLayer = new esri.layers.ArcGISTiledMapServiceLayer("http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer");
    osmLayer = new esri.layers.OpenStreetMapLayer({
	    id: "osmLayer",
    });
    
    map.addLayer(osmLayer);
    map.removeLayer(osmLayer);
    
    dojo.connect(map, "onZoomEnd", function() { 
    						featureLayer.setMaxAllowableOffset(maxOffset(map,10));
    										});
    // The offset is calculated as approximately 1 vertex per pixel: 
    var maxOffset = function maxOffset(map, pixelTolerance) { return Math.floor(map.extent.getWidth() / map.width) * pixelTolerance; };
    
    //Check if split-screen is active:
    onLoadCheck();

	//set Colorizationfor the startup-Layer
	initialColorization();
	
    initDiagramFields(); //initialize which fields should be used for which diagram layer
	
	dojo.connect(featureLayer, "onUpdateEnd", initLabels());
	
	map.reorderLayer(labelLayer, 5);
}

function initLegend(layer){
    //Preparing the Legend:
        var layerInfo = [{layer: layer.layer, title: layer.layer.name}];
        

        //add the legend 
        legend = new esri.dijit.Legend({
            map: map,
            layerInfos: layerInfo
        }, "legend");
        legend.startup();
}

function logText(text){
	console.log(text);
}

function initLabels(){    
    //Set labels visible on load:
    labelLayer = new esri.layers.ArcGISDynamicMapServiceLayer("http://giv-learn2.uni-muenster.de/ArcGIS/rest/services/LWL/kreisnamen/MapServer");
    document.getElementById("labelChk").checked = true;
    map.addLayer(labelLayer);
    logText("labels");
}

/*
function showExtent(extent, delta, levelChange, lod) {
		//In javascript, object passes byref. so it's not correct to difine new extent using
		//"var adjustedEx = extent;"
		var adjustedEx = new esri.geometry.Extent(extent.xmin, extent.ymin, extent.xmax, extent.ymax);
		var flag = false;	
		//set a buffer to make the max extent a slightly bigger to void minor differences
		//the map unit for this case is meter. 
		var buffer = 10;
		console.log(extent.xmin + "," + maxExtent.xmin);
		    if(extent.xmin < maxExtent.xmin-buffer) {
				adjustedEx.xmin = maxExtent.xmin;
				adjustedEx.xmax = Math.abs(extent.xmin - maxExtent.xmin) + extent.xmax;
                flag = true;
            }
			if(extent.ymin < maxExtent.ymin-buffer) {
			    adjustedEx.ymin = maxExtent.ymin;
			    adjustedEx.ymax = Math.abs(extent.ymin - maxExtent.ymin) + extent.ymax;
                flag = true;
            }
			if(extent.xmax-buffer > maxExtent.xmax) {
			    adjustedEx.xmax = maxExtent.xmax;
			    adjustedEx.xmin =extent.xmin - Math.abs(extent.xmax - maxExtent.xmax);
                flag = true;
            }
			if(extent.ymax-buffer > maxExtent.ymax) {
			    adjustedEx.ymax = maxExtent.ymax;
			    adjustedEx.ymin =extent.ymin - Math.abs(extent.ymax - maxExtent.ymax);
                flag = true;
            }
			if (flag === true) {
				map.setExtent(adjustedEx);				
			}
			flag = false;
			
      }
*/

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
			    format: "PDF",
			    layout: "A4 Portrait",
			    layoutOptions: {
			      titleText: exportTitle,
			      authorText: exportAuthor,
			      copyrightText: "",
			      scalebarUnit: "Kilometers",
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


/*
function createBasemapGallery() {
    //add the basemap gallery, in this case we'll display maps from ArcGIS.com including bing maps
    var basemapGallery = new esri.dijit.BasemapGallery({
        showArcGISBasemaps: true,
        bingMapsKey: 'Enter Bing Maps Key',
        map: map
    }, "basemapGallery");

    basemapGallery.startup();

    dojo.connect(basemapGallery, "onError", function (msg) {
        console.log(msg)
    });
}
*/

/**
 * opacity für FeatureLayer
 */
function setFeatureLayerOpacity(opacity) {
    featureLayer.setOpacity(opacity);
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
 * FeatureLayer Overlay
 */
function initOperationalLayer() {


    featureLayer = new esri.layers.FeatureLayer("http://giv-learn2.uni-muenster.de/ArcGIS/rest/services/LWL/lwl_collection/MapServer/" + activeLayer, {
        mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
        outFields: ["*"], //use all available fields in the data
        opacity: .50
    });
    featureLayer.setSelectionSymbol(new esri.symbol.SimpleFillSymbol());
    map.addLayers([featureLayer]);
    console.log("layerIds:" + map.graphicsLayerIds);    
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

function addDiagramLayer(layerNr){
	if (layerNr == 4){
		activeDiagramLayer = new esri.layers.ArcGISDynamicMapServiceLayer("http://giv-learn2.uni-muenster.de/ArcGIS/rest/services/LWL/diagramme_religion/MapServer");
	}
	if (layerNr == 5){
		activeDiagramLayer = new esri.layers.ArcGISDynamicMapServiceLayer("http://giv-learn2.uni-muenster.de/ArcGIS/rest/services/LWL/diagramme_pflegehilfe/MapServer");
	}
	
	map.addLayers([activeDiagramLayer]);
	initLegend(activeDiagramLayer);
}

/**
 * This method can assign a new color scheme to a layer
 * as used for individual breaks
 */
function colorChange() {

    symbol = new esri.symbol.SimpleFillSymbol();
    symbol.setColor(new dojo.Color([150, 150, 150, 0.75]));
    var renderer = new esri.renderer.ClassBreaksRenderer(symbol, attributeFields[activeLayer]);
    for (var i = 1; i <= breakCount; i++) {
        var element = document.getElementById("breakFrom" + i);
        if (element) {
            renderer.addBreak(document.getElementById("breakFrom" + i).value,
            document.getElementById("breakTo" + i).value,
            new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color("#" + document.getElementById("myValue" + i).value)));
        }
    }


    featureLayer.setRenderer(renderer);
    featureLayer.refresh();

    legend.refresh();
}


/**
 * This method is used to initially set classes - only used at startup! 
 */
function initialColorization(){
	symbol = new esri.symbol.SimpleFillSymbol();
    symbol.setColor(new dojo.Color([150, 150, 150, 0.75]));
    var renderer = new esri.renderer.ClassBreaksRenderer(symbol, attributeFields[activeLayer]);
    
    //the values are layer dependent, so if another initial layer is chosen, these values MUST be changed
    renderer.addBreak(0,1702,new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color("#FF0000")));
            
    renderer.addBreak(1703,3404,new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color("#FFFF00")));
            
    renderer.addBreak(3405,5107,new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color("#00FF00")));
            
    featureLayer.setRenderer(renderer);
    //featureLayer.refresh();

    //legend.refresh();
	logText("color");
}

/**
 * Method for changing the active overlay layer
 */
function layerChange(layerNr) {
	//disconnect and connect click handlers for diagrams based on checkboxes
    if (layerNr == 4 && !(document.getElementById("religionChk").checked)) {
        dojo.disconnect(disconHandler);
        map.removeLayer(diagramLayer);
        diagramLayer = null;
        map.removeLayer(activeDiagramLayer);
        activeDiagramLayer = null;
    } else if (layerNr == 4 && document.getElementById("religionChk").checked) {
        dojo.disconnect(disconHandler);
        connectDiagramFunc(layerNr);
        document.getElementById("pflegehilfeChk").checked = false;
        if (diagramLayer != null) {
            map.removeLayer(diagramLayer);
            diagramLayer = null;
        }
        if (activeDiagramLayer != null) {
            map.removeLayer(activeDiagramLayer);
            activeDiagramLayer = null;
        }
        initDiagramLayer();
        addDiagramLayer(layerNr);
    } else if (layerNr == 5 && !(document.getElementById("pflegehilfeChk").checked)) {
        dojo.disconnect(disconHandler);
        map.removeLayer(diagramLayer);
        diagramLayer = null;
        map.removeLayer(activeDiagramLayer);
        activeDiagramLayer = null;
    } else if (layerNr == 5 && document.getElementById("pflegehilfeChk").checked) {
        dojo.disconnect(disconHandler);
        connectDiagramFunc(layerNr);
        document.getElementById("religionChk").checked = false;
        if (diagramLayer != null) {
            map.removeLayer(diagramLayer);
            diagramLayer = null;
        }
        if (activeDiagramLayer != null) {
            map.removeLayer(activeDiagramLayer);
            activeDiagramLayer = null;
        }
        initDiagramLayer();
        addDiagramLayer(layerNr);
        //handling checkbox for the basemap
    } else if (layerNr == 50 && !(document.getElementById("baseMapChk").checked)) {
    	map.removeLayer(osmLayer);
    } else if (layerNr == 50 && (document.getElementById("baseMapChk").checked)) {
    	map.addLayer(osmLayer);
        //handling checkbox for the labelLayer
    } else if (layerNr == 60 && (document.getElementById("labelChk").checked)) {
    	map.addLayer(labelLayer);
    } else if (layerNr == 60 && !(document.getElementById("labelChk").checked)) {
    	map.removeLayer(labelLayer);
    } else {
		//following applies if only a 'normal' layer change happens
        activeLayer = layerNr; //setting the new layer
        var d = document.getElementById("breaksTable");
        var olddiv = document.getElementById("Breaks");
        d.removeChild(olddiv); //remove previously made class breaks
        var addBreaksTable = document.createElement("table");
        addBreaksTable.setAttribute("id", "Breaks");
        d.appendChild(addBreaksTable);
        breakCount = 0;
        legend.destroy();
        var legendDiv = document.getElementById("legendDiv");
        var leg = document.createElement("div");
        leg.setAttribute("id", "legend");
        legendDiv.appendChild(leg);

        map.removeLayer(featureLayer);
        featureLayer = null;
        initOperationalLayer();
    }
}

/**
 * method for automatic (equal) breaks
 */
function addEqualBreaks(number, colorStart, colorEnd) {

    var breakStep = (maxValues[activeLayer] - minValues[activeLayer]) / (number + 1);
    var colorArray = generateColor(colorStart, colorEnd, number);

    symbol = new esri.symbol.SimpleFillSymbol();
    symbol.setColor(new dojo.Color([150, 150, 150, 0.75]));
    var renderer = new esri.renderer.ClassBreaksRenderer(symbol, attributeFields[activeLayer]);
    
    for (var i = 0; i <= number; i++) {
        renderer.addBreak((Math.round((minValues[activeLayer] + i * breakStep) / 10) * 10 + 1),
        Math.round((minValues[activeLayer] + (i + 1) * breakStep) / 10) * 10,
        new esri.symbol.SimpleFillSymbol().setColor(dojo.colorFromHex('#' + colorArray[i])));
    }

	var breaksList = document.getElementById("Breaks");
	breaksList.innerHTML = '';
	breakCount = 0;
    featureLayer.setRenderer(renderer);
    featureLayer.refresh();

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
function reLocate() {
	for (var i = 0; i < parent.frames.length; i++) { //go through all frames and re-center
		if (parent.frames[i].name != self.name) {
			parent.frames[i].reCenterAndZoom(map.extent.getCenter(), map.getLevel(), map.extent, i);
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
