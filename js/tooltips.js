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