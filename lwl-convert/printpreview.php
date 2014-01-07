<?php
include('conf.php');

// Standardwerte setzen
$name = "Anonym";
$title = "Meine Karte";
$legend = array();
$map = "img/default-map.png";

// Standardwerte überschreiben, wenn vom Nutzer andere gesetzt sind
if(isset($_GET["name"]) && $_GET["name"] != "")  $name = htmlspecialchars($_GET["name"]);
if(isset($_GET["title"]) && $_GET["title"] != "") $title = htmlspecialchars($_GET["title"]);
if(isset($_GET["legend"]) && $_GET["legend"] != "") $legend = json_decode($_GET["legend"], true);

// Kartennamen auf gültigkeit prüfen, sonst Beispielkarte einbinden
if(isset($_GET["map"]) && ctype_alnum($_GET["map"])) {
	if(file_exists($folder_out.$_GET["map"].'.png')) {
		$map = $folder_out_rel.$_GET["map"].'.png';
	}
}
?>
<!DOCTYPE HTML>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		<title>Druckansicht</title>
		<link rel="stylesheet" href="print.css" type="text/css">
	</head>
	<body>
		<div id="container">
			<div id="info">Nutzen Sie die Druckvorschau Ihres Browsers, um zu sehen, wie die gedruckte Fassung aussehen wird. 
			Sie können dort außerdem die Orientierung des Blattes vor dem Drucken wechseln sowie die Ausgabe skalieren.</div>
			
			<img src="img/lwl-logo-reddot.png" style="float:left;">
			<img src="img/lwl-claim.png" style="float:right;padding-top:5px;padding-bottom:5px;">
			
			<div style="clear:both"></div>
			
			<h1><?php echo $title; ?></h1>
			<?php echo $name; ?> <br>
				
			<img id="map" src="<?php echo $map; ?>">

			<div>
			
			<div id="bottom">
			<div id="legend" style="text-align:left;">
				<?php
				// Legende parsen
				if(count($legend) > 0) {
					echo '<span style="font-weight:bold;line-height:150%;">Legende</span><br>';
					echo '<div id="legendinner">';
				
					foreach($legend as $entry) {
						if(preg_match('/rgb\((?<r>[0-9]{1,3}), (?<g>[0-9]{1,3}), (?<b>[0-9]{1,3})\)/', $entry["bg"], $pregmatchresults)) {
							echo '<img src="color.php?r='.$pregmatchresults["r"].'&g='.$pregmatchresults["g"].'&b='.$pregmatchresults["b"].'" style="width:20px;height:20px;">&nbsp;';
						}
						echo htmlspecialchars($entry["min"]);
						echo " - ";
						if($entry["l"] != "") echo "<";
						echo htmlspecialchars($entry["max"]);
						echo "<br>";
					}

					echo '</div>';
				}
				?>
			</div>
			
			<div id="spacer"></div>
			
			<div id="logos">
				<img id="ifgilogo" src="img/logo-rgb-ifgi-text-de.jpg">
				<img id="lwllogo" src="img/logo-giatschool.png">
			</div>
			</div>

			</div>
		</div>
	</body>
</html>