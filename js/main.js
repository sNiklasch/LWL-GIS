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

var map, queryTask, query, template, initExtent, maxExtent, operationalLayer, year, currentYearLabel;

//the MapServer for the whole app:
var mapServer = "http://giv-learn2.uni-muenster.de/ArcGIS/rest/services/LWL/Legende/MapServer";

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
	
	initLabels();
    createTimeslider();
    updateTimeslider();
    fullExtent();
}

/**
* Diese Funktion initialisiert den operationalLayer, welcher die gesamten Layer vom Server enthält.
* Zusätzlich wird beim ausführen der Funktion der operationalLayer zur map hinzugefügt und der Layer mit den Kreisnamen auf sichtbar gestellt.
*/
function initLabels(){    
    //Set labels visible on load:
    operationalLayer = new esri.layers.ArcGISDynamicMapServiceLayer(mapServer, { "id": "collection" });
    //document.getElementById("labelChk").checked = true;
    dojo.connect(operationalLayer, "onUpdateStart", showLoadingIcon);
    dojo.connect(operationalLayer, "onUpdateEnd", hideLoadingIcon);
    map.addLayers([operationalLayer]);
    operationalLayer.setVisibleLayers([fIDkreisnamen]);
    window.setTimeout("addEqualBreaks(equalBreaksOptions[0], equalBreaksOptions[1], equalBreaksOptions[2])", 1000);
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
    operationalLayer.setOpacity(opacity);
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
        currentLayer = layerNr;
        currentYear = years[currentLayer][initYearValues[currentLayer]];
        activeClassification = 0;
        window.setTimeout("addEqualBreaks(equalBreaksOptions[0], equalBreaksOptions[1], equalBreaksOptions[2])", 1000);
        activeLayer = layerNr; //setting the new layer
        updateLayerVisibility();
        updateTimeslider();
    }
}

function yearChange(value){
    currentYearLabel = timesliderLabelValues[currentLayer][value];
    document.getElementById("timesliderValue").innerHTML = currentYearLabel;
    currentYear = years[currentLayer][value];
    if (activeClassification == 1){
        colorChange();
    }
    else {
        addEqualBreaks(equalBreaksOptions[0], equalBreaksOptions[1], equalBreaksOptions[2]);
    }
}

/**
 * method for automatic (equal) breaks
 */
function addEqualBreaks(number, colorStart, colorEnd) {
    equalBreaksOptions[0] = number; //number of breaks
    equalBreaksOptions[1] = colorStart;
    equalBreaksOptions[2] = colorEnd;
    activeClassification = 2; // 2 = automatic

    //maximum of 12 classes:
	if (number > 11){
		number = 11;
		document.getElementById("equalBreaksText").value = 12;
	}

    var breakStep = (maxValues[activeLayer] - minValues[activeLayer]) / (number + 1); //size of one class
    var colorArray = generateColor(colorStart, colorEnd, number); //generates an array of an color gradient

    symbol = new esri.symbol.SimpleFillSymbol();
    symbol.setColor(new dojo.Color([150, 150, 150, 0.75]));
    var renderer = new esri.renderer.ClassBreaksRenderer(symbol, attributeFields[activeLayer] + currentYear);
    
    for (var i = 0; i <= number; i++) {
        var min = minValues[activeLayer] + i * breakStep;
        var max = minValues[activeLayer] + (i + 1) * breakStep;
        renderer.addBreak({
            minValue: min,
            maxValue: max,
            symbol: new esri.symbol.SimpleFillSymbol().setColor(dojo.colorFromHex('#' + colorArray[i])),
            label: min + " - " + max
        });
    }

    //delete the entrys of the manual classification:
	var breaksList = document.getElementById("Breaks");
	breaksList.innerHTML = '';
	breakCount = 0;
    
    //following from the ArcGIS Server JS-API:
    var optionsArray = [];
    var drawingOptions = new esri.layers.LayerDrawingOptions();
    drawingOptions.renderer = renderer;
    optionsArray[activeLayer] = drawingOptions;
    operationalLayer.setLayerDrawingOptions(optionsArray);

    legend.refresh();
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
