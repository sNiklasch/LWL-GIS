/**
 * programmatically add onMouseOver-tooltips
 */
function addTooltips() {
  require(['dijit/Tooltip', 'dojo/domReady!'],function(Tooltip){

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
      label: 'Bevölkerungsdichte im Jahr 2012<br><b>Einheit: </b>Einwohner je km&sup2;',
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
      label: 'Geburtenrate der Jahre 2007 - 2011<br>im Durschschnitt<br><b>Einheit: </b>&permil;',
      showDelay: 0
    });

    //Sterberate Layer
    new Tooltip({
      connectId: ['sterberateInfo'],
      label: 'Sterberate der Jahre 2007 - 2011<br>im Durschschnitt<br><b>Einheit: </b>&permil;',
      showDelay: 0
    });

    //Migrationen Layer
    new Tooltip({
      connectId: ['migrationen_gesamtInfo'],
      label: 'Migrationen der gesamten<br>Bevölkerung der Jahre 2007 - 2011<br><b>Einheit: </b>&permil;',
      showDelay: 0
    });

    //Migrationen Nichtdeutsch Layer
    new Tooltip({
      connectId: ['migrationen_nichtdeutschInfo'],
      label: 'Migrationen von Nichtdeutschen<br>der Jahre 2007 - 2011<br><b>Einheit: </b>&permil;',
      showDelay: 0
    });

    //Pflegebeduerftige Layer
    new Tooltip({
      connectId: ['pflegebeduerftigeInfo'],
      label: 'Anteil der Pflegebedürftigen<br>im Jahr 2011<br><b>Einheit: </b>&permil;',
      showDelay: 0
    });

    //Pflegeeinrichtungen Layer
    new Tooltip({
      connectId: ['pflegeeinrichtungenInfo'],
      label: 'Stationäre Pflegeeinrichtungen<br>im Jahr 2009<br><b>Einheit: </b>verfügbare Plätze je<br>100000 Einwohner ab 65 Jahren',
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
      label: 'In diesem Untermenü kannst du aussuchen,<br>welche Daten als Ebene über die Karte <br>gelegt werden sollen.',
      showDelay: 0
    });

    //Klasseneinteilung Menü
    new Tooltip({
      connectId: ['klasseneinteilungInfo'],
      label: 'In diesem Untermenü kannst du <br>die Farbgebung der Karte anpassen.',
      showDelay: 0
    });
  });
}