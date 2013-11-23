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
dojo.require("esri.symbol");

dojo.require("dojox.widget.TitleGroup");
dojo.require("dojox.charting.themes.Julie");

dojo.require("dojo.parser");

dojo.require("dijit.form.DropDownButton");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.Textarea");
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
var printCounter = 0; //counter for the printer widget

var map, queryTask, query, template, initExtent, maxExtent, operationalLayer, featureLayer, currentYearLabel, year, colorArray;
var currentDataframe = datenEinwohner;
var yearIndex = 0;
var autoClassesStartColor = 'FFF880';
var autoClassesEndColor = 'EA3313';
var autoClassesBreaks = 3;
var legendArray = [];
var layerAttributes = ["", "Webgis Westfalen"];

//the MapServer for the whole app:
var mapServer = "http://giv-learn2.uni-muenster.de/ArcGIS/rest/services/LWL/Legende/MapServer";
//the Server for the feature Layer:
var featureLayerServer = "https://services1.arcgis.com/W47q82gM5Y2xNen1/arcgis/rest/services/westfalen_kreise/FeatureServer";

//LayerIDs:
var fIDkreisnamen = 0;
var fIDeinwohner = 2;
var fIDeinwohner_entwicklung = 3;
var fIDbevoelkerungsdichte = 4;
var fIDaltersgruppen = 5;
var fIDaltersgruppen_diagramme_2011 = 6;
var fIDgeburtenrate = 7;
var fIDsterberate = 8;
var fIDmigrationen_gesamt = 9;
var fIDmigrationen_nichtdeutsch = 10;
var fIDpflegebeduerftige = 12;
var fIDpflegeeinrichtungen = 13;
var fIDhaushaltsgroessen = 14;
var fIDsingle_haushalte = 15;
var fIDnichtdeutsche = 16;
var fIDmigrationshintergrund = 17;
var fIDeinkommen = 18;
var fIDkonfessionen = 19;
var fIDkonfessionen_diagramme_20082010 = 20;

var activeLayer = 1; // which layer is active at the beginning
var currentLayer = 1;

var currentYear = years[currentLayer][initYearValues[currentLayer]]; //Aktuell angezeigtes Jahr
var activeDiagramLayer = 0; //Aktuell angezeigter Diagrammlayer, 0=keiner
var labelVisibility = true; //zum überprüfen, ob die Label angezeigt sind
var equalBreaksOptions = [3, "FF0000", "00FF00"]; // Standard-Klassifikation
var activeClassification = 0; // Gibt die zuletzt durchgeführte Klassifikation an. 0=keine, 1=manuell, 2=automatisch

var legend;
/**
 * at this point the min and max values have to be entered manually for each layer.
 * this is not a good approach, they should be obtained directly from the data on the server
 * please change this! 
 */ 
var minValues = [0, 0, 107124, -15,  121, 12, 0, 7,  8, -6, 0, 0, 18, 3844, 1.86, 29,  4,  8, 15905,  9, 0];
var maxValues = [0, 0, 651588,  21, 3187, 50, 0, 9, 13, 13, 3, 0, 39, 7375, 2.38, 49, 16, 34, 24771,  72, 0]; 


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
        
    //various map events
    dojo.connect(map, "onExtentChange", reLocate);
    dojo.connect(map, "onZoomEnd", syncZoom);


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
            return {
                layer:layer.layer,
                title:layer.layer.name,
                hideLayers:[0]
                };
          });
          if(layerInfo.length > 0){
            legend = new esri.dijit.Legend({
              map:map,
              layerInfos: layerInfo
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
    osmLayer = new esri.layers.OpenStreetMapLayer({
	    id: "osmLayer"
    });
    
    map.addLayer(osmLayer);
    map.removeLayer(osmLayer);
        
    //Check if split-screen is active:
    onLoadCheck();
	
	initLayers();
    createTimeslider();
    updateTimeslider();
    fullExtent();
}

/**
* Diese Funktion initialisiert den operationalLayer, welcher die gesamten Layer vom Server enthält.
* Zusätzlich wird beim ausführen der Funktion der operationalLayer zur map hinzugefügt und der Layer mit den Kreisnamen auf sichtbar gestellt.
*/
function initLayers(){    
    //Set labels visible on load:
    featureLayer = new esri.layers.FeatureLayer(featureLayerServer + "/0", {
            infoTemplate: new esri.InfoTemplate("&nbsp;", "${Kreisname}"),
            mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
            outFields: ["Kreisname"]
          });
    map.addLayer(featureLayer, 0);
    colorArray = addEqualBreaksNew(0, autoClassesBreaks, autoClassesStartColor, autoClassesEndColor); //new
    colorizeLayer(colorArray); //new
    operationalLayer = new esri.layers.ArcGISDynamicMapServiceLayer(mapServer, { "id": "collection" });
    //document.getElementById("labelChk").checked = true;
    dojo.connect(featureLayer, "onUpdateStart", showLoadingIcon);
    dojo.connect(featureLayer, "onUpdateEnd", hideLoadingIcon);
    map.addLayer(operationalLayer, 1);
    operationalLayer.setVisibleLayers([fIDkreisnamen]);
    //window.setTimeout("addEqualBreaks(equalBreaksOptions[0], equalBreaksOptions[1], equalBreaksOptions[2])", 1000);
}

/**
 * This function zooms back to the maximum Extent
 */
function fullExtent(){
    map.setExtent(maxExtent);
    //reLocate(maxExtent);
    //syncZoom(maxExtent);
}

/**
 * function to set the printer, incl. title and author of the map and export it
 */        
function initPrinter(){
    if (currentYearLabel == "" || currentYearLabel == null){
        exportTitle = document.getElementById("mapExportTitle").value;
    }
    else {
        exportTitle = document.getElementById("mapExportTitle").value + " (" + currentYearLabel + ")";
    }
    exportAuthor = document.getElementById("mapExportAuthor").value;
    var legendLayer = new esri.tasks.LegendLayer();
    legendLayer.layerId = "collection"; // "layerCollection" is the id of the operationalLayer
    
    //printer
    if(printer != undefined){
    	printer.destroy();
        printCounter++;
    }
    printer = new esri.dijit.Print({
          map: map,
          templates: [{
                label: "PNG Hochformat",
                format: "PNG32",
                layout: "A4 Portrait",
                layoutOptions: {
                  titleText: document.getElementById("mapExportTitle").value,
                  authorText: document.getElementById("mapExportAuthor").value,
                  scalebarUnit: 'Kilometer',
                  //legendLayers: [],
                  copyrightText: "© Landschaftsverband Westfalen-Lippe (LWL), 48133 Münster"
                }
              },{
                label: "PNG Querformat",
                format: "PNG32",
                layout: "A4 Landscape",
                layoutOptions: {
                  titleText: document.getElementById("mapExportTitle").value,
                  authorText: document.getElementById("mapExportAuthor").value,
                  scalebarUnit: 'Kilometer',
                  //legendLayers: [],
                  copyrightText: "© Landschaftsverband Westfalen-Lippe (LWL), 48133 Münster"
                }
              }],
         url: "http://giv-learn2.uni-muenster.de/arcgis/rest/services/ExportWebMap/GPServer/Export%20Web%20Map/"
         }, dojo.byId("printButton"));
    printer.startup();
    
    dojo.connect(printer,'onPrintStart',function(){
    	console.log('The print operation has started');
        document.getElementById("exportWarning").innerHTML = '<img src="images/loading_small.gif" id="loadingImage" alt="loading" />';
    });
    
    dojo.connect(printer,'onPrintComplete',function(value){
    	console.log('The url to the print image is : ' + value.url);
    	document.getElementById("loadingImage").style.visibility = "hidden";
        var resultWindow = open(value.url, "Ausdruck");
        resultWindow.focus();
        document.getElementById("exportWarning").innerHTML = '<a href="' + value.url + '" target="_blank">Link zum Dokument</a>';
    });
    document.getElementById("dijit_form_ComboButton_" + printCounter + "_button").click();
}


/**
 * opacity for OperationalLayer
*/
function setFeatureLayerOpacity(opacity) {
    featureLayer.setOpacity(opacity);
    $(".legendColorfield").css({ opacity: opacity });
} 

/**
 * this function expects an array of colors for the features of the main layer
 * 
*/
function colorizeLayer(colorArray){
    var defaultSymbol = new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([255,255,255,0.5]))
    
    var renderer = new esri.renderer.UniqueValueRenderer(defaultSymbol, "Kreisname");
    for (var i = colorArray.length - 1; i >= 0; i--) {
        renderer.addValue(colorArray[i][0], new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color(colorArray[i][1])));
        //console.log(renderer);
    };

    featureLayer.setRenderer(renderer);
    featureLayer.redraw();

    var minmax = getMinMax(datenEinwohner);

    addLegendItems(legendArray); //update the Legend
    console.log(map.getLayersVisibleAtScale());

    //console.log(minmax);
    //console.log(getLayerData(datenEinwohner, 2012));
}

/**
 * Method for changing the active overlay layer
 */
function layerChange(layerNr) {
	//disconnect and connect click handlers for diagrams based on checkboxes
    if (layerNr == fIDaltersgruppen_diagramme_2011 && !(document.getElementById("altersgruppenDiagramme2011Check").checked)) {
        diagramLayer = null;
        activeDiagramLayer = 0;
        updateLayerVisibility();
    } else if (layerNr == fIDaltersgruppen_diagramme_2011 && document.getElementById("altersgruppenDiagramme2011Check").checked) {
        document.getElementById("konfessionenDiagramme2008Check").checked = false;
        if (diagramLayer != null) {
            map.removeLayer(diagramLayer);
            diagramLayer = null;
        }
        activeDiagramLayer = layerNr;
        updateLayerVisibility();
    } else if (layerNr == fIDkonfessionen_diagramme_20082010 && !(document.getElementById("konfessionenDiagramme2008Check").checked)) {
        diagramLayer = null;
        activeDiagramLayer = 0;
        updateLayerVisibility();
    } else if (layerNr == fIDkonfessionen_diagramme_20082010 && document.getElementById("konfessionenDiagramme2008Check").checked) {
        document.getElementById("altersgruppenDiagramme2011Check").checked = false;
        if (diagramLayer != null) {
            map.removeLayer(diagramLayer);
            diagramLayer = null;
        }
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
        currentDataframe = layerNr; //new
        getLayerAttributes(); //new
        colorArray = addEqualBreaksNew(0, autoClassesBreaks, autoClassesStartColor, autoClassesEndColor); //new
        colorizeLayer(colorArray); //new
        //currentYear = years[currentLayer][initYearValues[currentLayer]];
        //activeClassification = 0;
        //window.setTimeout("addEqualBreaks(equalBreaksOptions[0], equalBreaksOptions[1], equalBreaksOptions[2])", 1000);
        //activeLayer = layerNr; //setting the new layer
        //updateLayerVisibility();
        updateTimeslider();
    }
}

function yearChange(value){
    yearIndex = value;
    currentYearLabel = getYearsArray(currentDataframe)[value];
    console.log("aktuell: " + currentLayer);
    document.getElementById("timesliderValue").innerHTML = layerAttributes[1] + ": " + currentYearLabel;
    currentYear = currentYearLabel;
    if (activeClassification == 1){
        colorizeLayer(createColorArrayByLegendArray(legendArray));
    }
    else {
        colorArray = addEqualBreaksNew(value, autoClassesBreaks, autoClassesStartColor, autoClassesEndColor); //new
        colorizeLayer(colorArray);
    }
}

/**
 * function to update the visibility of the Layers
 * should be called everytime, when "labelVisibility", "activeDiagramLayer" or "activeLayer" changes
 */
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

function getLayerAttributes(){
    for (var i = allLayerAttributes.length - 1; i >= 0; i--) {
        if (allLayerAttributes[i][0] == currentDataframe){
            layerAttributes = allLayerAttributes[i];
        }
    };
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
        document.getElementById("welcome").style.display = 'block';
        document.getElementById("welcomeBackground").style.display = 'block';
	}
    if (self.name == "frame2") {
        document.getElementById("splitDiv").removeChild(document.getElementById("slideAwayButton_split"));
        if(map != null){
          map.setLevel(parent.frames[0].map.getLevel());
        }
    }

}

dojo.addOnLoad(init);
