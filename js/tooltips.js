/**
 * programmatically add onMouseOver-tooltips
 */
function addTooltips() {
  require(['dijit/Tooltip',
    'dojo/dom',
    'dgrid/OnDemandGrid',
    'dojo/store/Memory',
    'dojo/query',
    'dojo/domReady!'],function(Tooltip, dom, Grid, Memory, query){

    query('.gridview').on('click', function(e){
      //create columns
      var columns = {
        0: {
            label: 'Kreis'
        }
      };

      for (var j = 0; j < currentDataframe[0].Data.length; j++) {
        columns[j+1] = {label: currentDataframe[0].Data[j]};
      }

      store = new Memory();
      grid = new Grid({columns: columns}, 'grid');
      var data = [];
      var column;
      var i;
      for (i = 1; i < currentDataframe.length; i++) {
        data.push({});
        for (column in columns) {
          data[i-1].id = i;
          if (column === '0') {
            data[i-1][column] = currentDataframe[i].Name;
          } else {
            data[i-1][column] = currentDataframe[i].Data[column-1];
          }
        }
      }
      store.data = data;
      grid.set({'store':store});
      query('#menuPane-grid .menuPane-head')[0].innerHTML = layerAttributes[1];
      showPane('menuPane-grid');
    });

    //Layers:
    //Einwohner Layer
    new Tooltip({
      connectId: ['einwohnerInfo'],
      label: 'Einwohner in den Jahren 1990,<br>2012 und 2030 (Prognose)<br><b>Einheit: </b>Absolute Zahlen',
      showDelay: 0
    });

    //Einwohner-Entwicklung Layer
    new Tooltip({
      connectId: ['einwohner_entwicklungInfo'],
      label: 'Entwicklung der Einwohnerzahlen in<br>den Zeiträumen 1990 – 2012 und<br>2012 – 2030 (Prognose)<br><b>Einheit: </b>Zu-/Abnahmen in &#037;',
      showDelay: 0
    });

    //Bevoelkerungsdichte Layer
    new Tooltip({
      connectId: ['bevoelkerungsdichteInfo'],
      label: 'Bevölkerungsdichte im Jahr 2012<br><b>Einheit: </b>Einwohner pro km&sup2;',
      showDelay: 0
    });

    //Altersgruppen Layer
    new Tooltip({
      connectId: ['altersgruppenInfo'],
      label: 'Altersgruppen im Jahr 2011<br><b>Einheit: </b>Anteile in &#037;',
      showDelay: 0
    });

    //Altersgruppen Diagramme 2011 Layer
    new Tooltip({
      connectId: ['altersgruppenDiagramme2011Info'],
      label: 'Diagramme zur Verteilung<br>der Altersgruppen im Jahr<br>2011',
      showDelay: 0
    });

    //Geburtenrate Layer
    new Tooltip({
      connectId: ['geburtenrateInfo'],
      label: 'Geburtenrate der Jahre 2007 - 2011<br>im Durchschnitt<br><b>Einheit: </b>&permil;',
      showDelay: 0
    });

    //Sterberate Layer
    new Tooltip({
      connectId: ['sterberateInfo'],
      label: 'Sterberate der Jahre 2007 - 2011<br>im Durchschnitt<br><b>Einheit: </b>&permil;',
      showDelay: 0
    });

    //Migrationen Layer
    new Tooltip({
      connectId: ['migrationen_gesamtInfo'],
      label: 'Zu-/Fortzüge der gesamten<br>Bevölkerung der Jahre 2007 - 2011<br><b>Einheit: </b>&permil;',
      showDelay: 0
    });

    //Migrationen Nichtdeutsch Layer
    new Tooltip({
      connectId: ['migrationen_nichtdeutschInfo'],
      label: 'Zu-/Fortzüge von Nichtdeutschen<br>der Jahre 2007 - 2011<br><b>Einheit: </b>&permil;',
      showDelay: 0
    });

    //Pflegebeduerftige Layer
    new Tooltip({
      connectId: ['pflegebeduerftigeInfo'],
      label: 'Anteil der Pflegebedürftigen an<br>der Gesamtbevölkerung<br>im Jahr 2011<br><b>Einheit: </b>&permil;',
      showDelay: 0
    });

    //Pflegeeinrichtungen Layer
    new Tooltip({
      connectId: ['pflegeeinrichtungenInfo'],
      label: 'Verfügbare Plätze in stationären<br>Pflegeeinrichtungen im Jahr 2009<br><b>Einheit: </b>verfügbare Plätze je<br>100000 Einwohner ab 65 Jahren',
      showDelay: 0
    });

    //Haushaltsgroessen Layer
    new Tooltip({
      connectId: ['haushaltsgroessenInfo'],
      label: 'Durchschnittliche Haushaltsgrößen<br>der Privathaushalte im Jahr 2010',
      showDelay: 0
    });

    //Single-Haushalte Layer
    new Tooltip({
      connectId: ['single_haushalteInfo'],
      label: 'Single-Haushalte im Jahr<br>2010 (=Ein-Personen-Haushalte)<br><b>Einheit: </b>Anteile an allen<br>Privathaushalten in &#037;',
      showDelay: 0
    });

    //Nichtdeutsche Layer
    new Tooltip({
      connectId: ['nichtdeutscheInfo'],
      label: 'Nichtdeutsche im Jahr 2011<br><b>Einheit: </b>Anteile an der<br>Gesamtbevölkerung in &#037;',
      showDelay: 0
    });

    //Migrationshintergrund Layer
    new Tooltip({
      connectId: ['migrationshintergrundInfo'],
      label: 'Menschen mit Migrations-<br>hintergrund im Jahr 2008<br><b>Einheit: </b>Anteile an der<br>Gesamtbevölkerung in &#037;',
      showDelay: 0
    });

    //Einkommen Layer
    new Tooltip({
      connectId: ['einkommenInfo'],
      label: 'Verfügbares Einkommen der<br>privaten Haushalte im Jahr 2009<br><b>Einheit: </b>&euro; je Einwohner',
      showDelay: 0
    });

    //Konfessionen Layer
    new Tooltip({
      connectId: ['konfessionenInfo'],
      label: 'Konfessionen im Durchschnitt<br>der Jahre 2008 – 2010<br><b>Einheit: </b>Anteile in &#037;',
      showDelay: 0
    });

    //Konfessionen Diagramme 2008-2010 Layer
    new Tooltip({
      connectId: ['konfessionenDiagramme2008Info'],
      label: 'Diagramme zur Verteilung der Konfessionen<br>im Durchschnitt der Jahre 2008 - 2010',
      showDelay: 0
    });

    //Menüs:
    //Themenauswahl Menü
    new Tooltip({
      connectId: ['themenauswahlInfo'],
      label: 'In diesem Untermenü können Sie aussuchen,<br>welche Daten als Ebene über die Karte <br>gelegt werden sollen.',
      showDelay: 0
    });

    //Klasseneinteilung Menü
    new Tooltip({
      connectId: ['klasseneinteilungInfo'],
      label: 'In diesem Untermenü können Sie die Art der Klassifikation angeben,<br>die Farbgebung und die Klassenanzahl verändern<br>und eigene Klassengrenzen bilden.',
      showDelay: 0
    });

    //Klassifikationsmethode
    new Tooltip({
      connectId: ['klassifikationsInfo'],
      showDelay: 0,
      getContent: function() {
        var classifier = dom.byId('classificationMethod').value;
        var tooltipText = '';
        switch(classifier) {
          case 'equalInterval':
            tooltipText = 'Unterteilt die Klassen in gleich große Bereiche.';
            break;
          case 'quantile':
            tooltipText = 'Weist allen Klassen eine möglichst gleiche Anzahl von Objekten zu.';
            break;
          case 'jenks':
            tooltipText = 'Bildet Klassen, deren Objekte nah beieinanderliegende Werte aufweisen.';
            break;
          case 'standardDeviation':
            tooltipText = 'Fasst Objekte, deren Werte eine ähnlich große Abweichung vom Durchschnitt aufweisen, zu Klassen zusammen.';
            break;
          case 'pretty':
            tooltipText = 'Erstellt Klassen, die leicht verständlich<br>und optisch ansprechend sind.';
            break;
          default:
            tooltipText = '';
            break;
        }
        return tooltipText;
      }
    });
  });
}