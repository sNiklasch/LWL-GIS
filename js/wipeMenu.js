dojo.require("dojo.fx");

var breite = window.innerWidth - 450;



dojo.ready(function () {
        
        slideAwayButton_split = dojo.byId("slideAwayButton_split");
    
    var dualView = false;
    dojo.connect(slideAwayButton_split, "onclick", function (evt) {
        if (dualView) {
            var fs = parent.document.getElementById("frameset");
            fs.removeChild(parent.document.getElementById("frame2"));
            var fs = parent.document.getElementById("frameset");
            fs.cols = "100%";
            dualView = false;
        } else {
            var fs = parent.document.getElementById("frameset"),
                f2 = top.document.createElement('frame');
            fs.cols = "50%,50%";
            f2.name = "frame2";
            f2.id = "frame2";
            f2.src = "map.html";
            fs.appendChild(f2);
            dualView = true;
        }
    });

});
