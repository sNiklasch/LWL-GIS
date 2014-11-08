/* jshint ignore:start */
var breakCount = 0; // keep track of how many individual breaks have been created, used to fetch the correct field values
var diagramLayer = null; // the active clickable diagram layer
var printCounter = 0; //counter for the printer widget

var map, initExtent, osmLayer, featureLayerGemeinde, featureLayer, operationalLayer;
var currentDataframe = datenEinwohner;
var autoClassesStartColor = 'FFF880';
var autoClassesEndColor = 'EA3313';
var autoClassesBreaks = 3;
var legendArray = [];
var activeLayer = 1; // which layer is active at the beginning
var currentLayer = 1;
var layerAttributes = ['', 'Webgis Westfalen'];
var activeClassification = 0; // Gibt die zuletzt durchgeführte Klassifikation an. 0=keine, 1=manuell, 2=automatisch
var currentYear = years[currentLayer][initYearValues[currentLayer]]; //Aktuell angezeigtes Jahr
var activeDiagramLayer = 0; //Aktuell angezeigter Diagrammlayer, 0=keiner
var labelVisibility = true; //zum überprüfen, ob die Label angezeigt sind

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

//LayerIDs:
var fIDkreisnamen = 0;
var fIDeinwohner = 2;
var fIDeinwohnerEntwicklung = 3;
var fIDbevoelkerungsdichte = 4;
var fIDaltersgruppen = 5;
var fIDaltersgruppenDiagramme2011 = 1;
var fIDgeburtenrate = 7;
var fIDsterberate = 8;
var fIDmigrationenGesamt = 9;
var fIDmigrationenNichtdeutsch = 10;
var fIDpflegebeduerftige = 12;
var fIDpflegeeinrichtungen = 13;
var fIDhaushaltsgroessen = 14;
var fIDsingleHaushalte = 15;
var fIDnichtdeutsche = 16;
var fIDmigrationshintergrund = 17;
var fIDeinkommen = 18;
var fIDkonfessionen = 19;
var fIDkonfessionenDiagramme20082010 = 2;

//the MapServer for the whole app:
var mapServer = 'http://giv-learn2.uni-muenster.de/ArcGIS/rest/services/LWL/lwl_service/MapServer';
//the Server for the feature Layer:
var featureLayerServer = 'https://services1.arcgis.com/W47q82gM5Y2xNen1/arcgis/rest/services/westfalen_kreise/FeatureServer';
var fLGemeinde = 'https://services1.arcgis.com/W47q82gM5Y2xNen1/arcgis/rest/services/westfalen_kreise/FeatureServer';

/**
 * in split mode, synchronize zoom levels between both frames
 */
function syncZoom(extent) {
  for (var i = 0; i < parent.frames.length; i++) {
    if (parent.frames[i].name !== self.name) {
      try {
        parent.frames[i].counter = 0;
        parent.frames[i].map.setLevel(extent.level);
      } catch (err) {
        console.log('zoom failed');
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
  if (counter < 1 && map.extent.getCenter().x !== center.x && map.extent.getCenter().y !== center.y) {
    map.centerAndZoom(center, zoom);
  }
  counter++; //is only reset to zero on onMouseDown()
}

/**
 * called if in split mode one map is panned
 */
function reLocate(extent) {
  for (var i = 0; i < parent.frames.length; i++) { //go through all frames and re-center
    if (parent.frames[i].name !== self.name) {
      parent.frames[i].reCenterAndZoom(extent.extent.getCenter(), map.getLevel(), extent, i);
    }
  }
}

require(['esri/map',
  'esri/dijit/Popup',
  'esri/geometry/Extent',
  'esri/SpatialReference',
  'esri/layers/OpenStreetMapLayer',
  'dojo/dom-construct',
  'dojo/domReady!'], function(Map, Popup, Extent, SpatialReference, OpenStreetMapLayer, domConstruct) {

  addTooltips(); //the mouse-over tooltips are created programmatically

  var popup = new Popup(null, domConstruct.create('div')); //ini popups for diagrams

  initExtent = new Extent(518012, 6573584, 1286052, 6898288, new SpatialReference({
    wkid: 102100
  })); //initial map extent

  maxExtent = initExtent;

  for (var i = 0; i < parent.frames.length; i++) {
    if (parent.frames[i].name !== self.name) {
      initExtent = parent.frames[i].map.extent; //in split-mode get extent from other map
    }
  }

  map = new Map('map', {
    minZoom: 8,
    extent: initExtent,
    sliderStyle: 'large',
    infoWindow: popup
  });

  map.on('extent-change', reLocate);
  map.on('zoom-end', syncZoom);

  map.on('mouse-down', function() {
    for (var i = 0; i < parent.frames.length; i++) {
      parent.frames[i].counter = 0; //the counter is used if any pan related events occured onMouseDown
    }
  });

  //Initialize the Legend:
  map.on('layers-add-result', function(results) {
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
      },'legend');
      legend.startup();
    }
  });

  // resize the map when the browser resizes
  map.on('resize', function() {
    map.resize();
  });

  //Scalebar
  map.on('load', function(theMap) {
    require(['esri/dijit/Scalebar'], function(Scalebar) {
      var scalebar = new Scalebar({
        map: map,
        scalebarUnit: 'metric',
        attachTo: 'bottom-left'
      });
    });
  });

  // Baselayer
  osmLayer = new OpenStreetMapLayer();

  map.addLayer(osmLayer);
  map.removeLayer(osmLayer);

  //Check if split-screen is active:
  onLoadCheck();

  initLayers();

  //setup the timeslider:
  createTimeslider();
  yearChange(1); //set the init-year to 2012

  fullExtent();
});

/**
 * This function zooms back to the maximum Extent
 */
function fullExtent(){
  map.setExtent(maxExtent);
  //reLocate(maxExtent);
  //syncZoom(maxExtent);
}

/**
* Diese Funktion initialisiert den operationalLayer, welcher die gesamten Layer vom Server enthält.
* Zusätzlich wird beim ausführen der Funktion der operationalLayer zur map hinzugefügt und der Layer mit den Kreisnamen auf sichtbar gestellt.
*/
function initLayers(){
  //Set labels visible on load:
  require(['esri/layers/FeatureLayer',
           'esri/layers/ArcGISDynamicMapServiceLayer',
           'esri/InfoTemplate'], function(FeatureLayer, ArcGISDynamicMapServiceLayer, InfoTemplate) {
    featureLayer = new FeatureLayer(featureLayerServer + '/0', {
      infoTemplate: new InfoTemplate('&nbsp;', '${Kreisname}'),
      mode: FeatureLayer.MODE_ONDEMAND,
      outFields: ['Kreisname']
    });
    // featureLayerGemeinde = new FeatureLayer(fLGemeinde + '/0', {
    //   infoTemplate: new InfoTemplate('&nbsp;', '${Kreisname}'),
    //   mode: FeatureLayer.MODE_ONDEMAND,
    //   outFields: ['Kreisname']
    // });
    map.addLayer(featureLayer, 0);
    classify('equalInterval', 0, autoClassesBreaks, autoClassesStartColor, autoClassesEndColor);

    operationalLayer = new ArcGISDynamicMapServiceLayer(mapServer, { 'id': 'collection' });
    featureLayer.on('update-start', showLoadingIcon);
    featureLayer.on('update-end', hideLoadingIcon);
    operationalLayer.setVisibleLayers([fIDkreisnamen],true);
    map.addLayer(operationalLayer, 1);
    getLayerAttributes();
  });
}

/**
 * this function expects an array of colors for the features of the main layer
 *
*/
function colorizeLayer(colorArray){
  require(['esri/symbols/SimpleFillSymbol',
           'esri/renderers/UniqueValueRenderer',
           'esri/Color'], function(SimpleFillSymbol, UniqueValueRenderer, Color) {
    var defaultSymbol = new SimpleFillSymbol().setColor(new Color([255,255,255,0.5]));

    var renderer = new UniqueValueRenderer(defaultSymbol, 'Kreisname');
    for (var i = colorArray.length - 1; i >= 0; i--) {
      renderer.addValue(colorArray[i][0], new SimpleFillSymbol().setColor(new Color(colorArray[i][1])));
    }

    featureLayer.setRenderer(renderer);
    featureLayer.redraw();

    var minmax = getMinMax(datenEinwohner);

    addLegendItems(legendArray); //update the Legend
    console.log(map.getLayersVisibleAtScale());
  });
}

/**
 * this method check on page creation if this is in split mode
 * if it is then the split-button is removed on the newly created frame
 */
function onLoadCheck() {
  if (self.name === 'frame1') {
    // document.getElementById('welcome').style.display = 'block';
    // document.getElementById('welcomeBackground').style.display = 'block';
  }
  if (self.name === 'frame2') {
    document.getElementById('splitDiv').removeChild(document.getElementById('slideAwayButton_split'));
    if(map !== null){
      map.setLevel(parent.frames[0].map.getLevel());
    }
  }
}

/**
 * Method for changing the active overlay layer
 */
function layerChange(layerNr,removeLayer) {
  //disconnect and connect click handlers for diagrams based on checkboxes
  if (layerNr === fIDaltersgruppenDiagramme2011 && !(document.getElementById('altersgruppenDiagramme2011Check').checked)) {
    diagramLayer = null;
    activeDiagramLayer = 0;
    document.getElementById('legendDiagrams').innerHTML = '';
    updateLayerVisibility();
  } else if (layerNr === fIDaltersgruppenDiagramme2011 && document.getElementById('altersgruppenDiagramme2011Check').checked) {

    //change Layer to Altersgruppen
    if (document.getElementById('altersgruppenCheck').checked !== true) {
      document.getElementById('altersgruppenCheck').checked = true;
      layerChange(datenAltersgruppen,false);
    }

    document.getElementById('konfessionenDiagramme2008Check').checked = false;
    if (diagramLayer !== null) {
      map.removeLayer(diagramLayer);
      diagramLayer = null;
    }
    activeDiagramLayer = layerNr;
    document.getElementById('legendDiagrams').innerHTML = '<table style="margin-left:2px;" cellspacing="0" cellpadding="0"><tr><td><img src="images/legend_altersklassen_diagramm.png" /></td><td style="font-size:13px;">Altersklassen</td></tr><tr><td><img src="images/legend_altersklassen_feld1.png" /></td><td>0 - 18</td></tr><tr><td><img src="images/legend_altersklassen_feld2.png" /></td><td>18 - 30</td></tr><tr><td><img src="images/legend_altersklassen_feld3.png" /></td><td>30 - 65</td></tr><tr><td><img src="images/legend_altersklassen_feld4.png" /></td><td>>65</td></tr></table>';
    updateLayerVisibility();
  } else if (layerNr === fIDkonfessionenDiagramme20082010 && !(document.getElementById('konfessionenDiagramme2008Check').checked)) {
    diagramLayer = null;
    activeDiagramLayer = 0;
    document.getElementById('legendDiagrams').innerHTML = '';
    updateLayerVisibility();
  } else if (layerNr === fIDkonfessionenDiagramme20082010 && document.getElementById('konfessionenDiagramme2008Check').checked) {

    //change Layer to Konfessionen
    if (document.getElementById('konfessionenCheck').checked !== true) {
      document.getElementById('konfessionenCheck').checked = true;
      layerChange(datenKonfessionen,false);
    }

    document.getElementById('altersgruppenDiagramme2011Check').checked = false;
    if (diagramLayer !== null) {
      map.removeLayer(diagramLayer);
      diagramLayer = null;
    }
    activeDiagramLayer = layerNr;
    document.getElementById('legendDiagrams').innerHTML = '<table style="margin-left:2px;" cellspacing="0" cellpadding="0"><tr><td><img src="images/legend_konfessionen_diagramm.png" /></td><td style="font-size:13px;">Konfessionen</td></tr><tr><td><img src="images/legend_konfessionen_feld1rk.png" /></td><td>katholisch</td></tr><tr><td><img src="images/legend_konfessionen_feld2ev.png" /></td><td>evangelisch</td></tr><tr><td><img src="images/legend_konfessionen_feld3andere.png" /></td><td>andere</td></tr></table>';
    updateLayerVisibility();
    //handling checkbox for the basemap
  } else if (layerNr === 50 && !(document.getElementById('baseMapChk').checked)) {
    map.removeLayer(osmLayer);
    document.getElementById('copyrightLwl').innerHTML = '&copy; Landschaftsverband Westfalen-Lippe (LWL), 48133 M&uuml;nster';
  } else if (layerNr === 50 && (document.getElementById('baseMapChk').checked)) {
    map.addLayer(osmLayer, 0);
    document.getElementById('copyrightLwl').innerHTML = '&copy; Landschaftsverband Westfalen-Lippe (LWL), 48133 M&uuml;nster, <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende';
    //handling checkbox for the operationalLayer
  } else if (layerNr === 60 && (document.getElementById('labelChk').checked)) {
    labelVisibility = true;
    console.log('Labels einblenden' + labelVisibility);
    updateLayerVisibility();
  } else if (layerNr === 60 && !(document.getElementById('labelChk').checked)) {
    labelVisibility = false;
    console.log('Labels ausblenden' + labelVisibility);
    updateLayerVisibility();
  } else if (layerNr === 70 && (document.getElementById('gemeindeLayerChk').checked)) {
    map.addLayer(featureLayerGemeinde);
  } else if (layerNr === 70 && !(document.getElementById('gemeindeLayerChk').checked)) {
    map.removeLayer(featureLayerGemeinde);
  } else {
    //remove diagramLayer
    if (removeLayer === undefined) {
      if (layerNr !== fIDaltersgruppenDiagramme2011 && layerNr !== fIDkonfessionenDiagramme20082010) {
        if (diagramLayer !== null) {
          map.removeLayer(diagramLayer);
          diagramLayer = null;
        };
        activeDiagramLayer = 0;
        document.getElementById('legendDiagrams').innerHTML = '';
        document.getElementById('altersgruppenDiagramme2011Check').checked = false;
        document.getElementById('konfessionenDiagramme2008Check').checked = false;
        updateLayerVisibility();
      }
    }
    currentDataframe = layerNr; //new
    getLayerAttributes(); //new
    var colorArray = addEqualBreaksNew(0, autoClassesBreaks, autoClassesStartColor, autoClassesEndColor); //new
    colorizeLayer(colorArray); //new
    //currentYear = years[currentLayer][initYearValues[currentLayer]];
    //activeClassification = 0;
    //window.setTimeout('addEqualBreaks(equalBreaksOptions[0], equalBreaksOptions[1], equalBreaksOptions[2])', 1000);
    //activeLayer = layerNr; //setting the new layer
    //updateLayerVisibility();
    updateTimeslider();
  }
}

function yearChange(value){
  yearIndex = value;
  currentYearLabel = getYearsArray(currentDataframe)[value];
  console.log('aktuell: ' + currentLayer);
  var appendix = '';
  var lineBreak = '';
  if (layerAttributes[1].indexOf('Altersgruppen') !== -1) { appendix = ' J.'};
  if (layerAttributes[1].indexOf('Einwohner-Entwicklung') !== -1) { lineBreak = '<br>' };
  document.getElementById('timesliderValue').innerHTML = layerAttributes[1] + ': ' + currentYearLabel + appendix;
  document.getElementById('legendTheme').innerHTML = '<span>'+layerAttributes[1] + ': </span>' + lineBreak + '<span>' + currentYearLabel + appendix + '</span>';
  currentYear = currentYearLabel;
  switch(activeClassification) {
    case 1:
      colorizeLayer(createColorArrayByLegendArray(legendArray));
      break;
    case 2:
      classify('equalInterval', value, autoClassesBreaks, autoClassesStartColor, autoClassesEndColor);
      break;
    case 3:
      classify('quantile', value, autoClassesBreaks, autoClassesStartColor, autoClassesEndColor);
      break;
    case 4:
      classify('jenks', value, autoClassesBreaks, autoClassesStartColor, autoClassesEndColor);
      break;
    case 5:
      classify('standardDeviation', value, autoClassesBreaks, autoClassesStartColor, autoClassesEndColor);
      break;
    case 6:
      classify('pretty', value, autoClassesBreaks, autoClassesStartColor, autoClassesEndColor);
      break;
    default:
      break;
  }
  /*if (activeClassification === 1){
    colorizeLayer(createColorArrayByLegendArray(legendArray));
  }
  else {
    colorArray = addEqualBreaksNew(value, autoClassesBreaks, autoClassesStartColor, autoClassesEndColor); //new
    colorizeLayer(colorArray);
  }*/
}

function getLayerAttributes(){
  for (var i = allLayerAttributes.length - 1; i >= 0; i--) {
    if (allLayerAttributes[i][0] === currentDataframe){
      layerAttributes = allLayerAttributes[i];
    }
  }
}

/**
 * function to update the visibility of the Layers
 * should be called everytime, when 'labelVisibility', 'activeDiagramLayer' or 'activeLayer' changes
 */
function updateLayerVisibility(){
  if (labelVisibility) {
    if (activeDiagramLayer === 0){
      operationalLayer.setVisibleLayers([fIDkreisnamen]);
    }
    else {
      operationalLayer.setVisibleLayers([fIDkreisnamen, activeDiagramLayer]);
    }
    operationalLayer.setVisibility(true);
  }
  else {
    operationalLayer.setVisibility(true);
    if (activeDiagramLayer === 0){
      operationalLayer.setVisibility(false);
    }
    else {
      operationalLayer.setVisibleLayers([activeDiagramLayer]);
    }
  }
}

/**
 * converts the legend to JSON to transmit it to the print preview
 */
function legendToJSON() {
  var i = 0;

  var legend = {};
  legend.values = [];
  legend.diagram = [];

  $('div#myLegend table tr').each( function () {
    legend.values.push(
      {
        'bg' : $(this).children('td:nth-of-type(1)').children('.legendColorfield').css('background-color'),
        'min' : $(this).children('td:nth-of-type(2)').text(),
        'l' : $(this).children('td:nth-of-type(4)').text(),
        'max' : $(this).children('td:nth-of-type(5)').text()
      }
    );
  });

  if($('div#legendDiagrams').length > 0) {
    $('div#legendDiagrams table tbody tr').each( function () {
      legend.diagram.push(
        {
          'icon' : $(this).children('td:nth-of-type(1)').children('img').attr('src'),
          'text' : $(this).children('td:nth-of-type(2)').text()
        }
      );
    });
  }

  return legend;
}

/**
 * function to set the printer, incl. title and author of the map and export it
 */
function initPrinter(){
  console.log('initPrinter called');

  var svgElement = $('#map_gc')[0];
  var xmlSerializer = new XMLSerializer();
  var str = xmlSerializer.serializeToString(svgElement);
  var overlayUrl = $('#map_collection img').attr('src');

  var mapTitle = $('#mapExportTitle').val();
  var mapAuthor = $('#mapExportAuthor').val();
  var jsonLegend = legendToJSON();

  $('#exportWarning').html('<img src="images/loading_small.gif" id="loadingImage" alt="loading" />');

  $.ajax({
      type: 'POST',
      url: './lwl-convert/converter.php',
      data: {
        'svg': str,
        'overlay': overlayUrl,
        'legend': JSON.stringify(jsonLegend)
       },
      success: function(data) {
        response = $.parseJSON(data);
        console.log('Map printed, id '+response.message);
        if(response.status==='success') {
          $('#exportWarning').html('<a style="margin:" href="./lwl-convert/printpreview.php?map='+response.message+'&name='+escape(mapAuthor)+'&title='+escape(mapTitle)+'" target="_blank">Link zur Druckansicht</a>');
        } else {
          $('#exportWarning').html('<i>Beim Erstellen der Druckansicht ist ein Fehler aufgetreten.</i>');
        }
      },
      fail: function(data) {
        console.log('Error printing id '+response.message);
        $('#exportWarning').html('<i>Beim Erstellen der Druckansicht ist ein Fehler aufgetreten.</i>');
      }
  });
}

/**
 * opacity for OperationalLayer
*/
function setFeatureLayerOpacity(opacity) {
  featureLayer.setOpacity(opacity);
  $('.legendColorfield').css({ opacity: opacity });
}
/* jshint ignore:end */