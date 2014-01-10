<?php
include('conf.php');

// Set default values
$name = "Anonym";
$title = "Meine Karte";
$legend = array();
$map = "img/default-map.png";

// Overwrite defaults if set by user
if(isset($_GET["name"]) && $_GET["name"] != "")  $name = htmlspecialchars($_GET["name"]);
if(isset($_GET["title"]) && $_GET["title"] != "") $title = htmlspecialchars($_GET["title"]);

// Check map id, else show default
if(isset($_GET["map"]) && ctype_alnum($_GET["map"])) {
	if(file_exists($folder_out.$_GET["map"].'.png')) {
		$map = $folder_out_rel.$_GET["map"].'.png';
		$legend = json_decode(file_get_contents($folder_in.$_GET["map"].'.json'), true);
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
			<div id="info">
			<b>Nutzungshinweise:</b><br>
			<br>
			Nutzen Sie die <b>Druckvorschau</b> Ihres Browsers, um zu sehen, wie die gedruckte Fassung aussehen wird. 
			Sie können die Karte dort vor dem Druck auch drehen und skalieren.<br>
			<br>
			Klicken Sie auf den <b>Kartentitel</b> oder den <b>Autorennamen</b>, um diese nachträglich zu verändern.
			</div>
			
			<img src="img/lwl-logo-reddot.png" style="float:left;">
			<img src="img/lwl-claim.png" style="float:right;padding-top:5px;padding-bottom:5px;">
			
			<div style="clear:both"></div>
			
			<h1 contenteditable="true"><?php echo $title; ?></h1>
			<span contenteditable="true"><?php echo $name; ?></span><br>
				
			<img id="map" src="<?php echo $map; ?>">

			<div>
			
			<div id="bottom">
			<div id="legend" style="text-align:left;">
				<?php
				// Parse JSON legend
				if(count($legend) > 0) {
					echo '<span style="font-weight:bold;line-height:150%;">Legende</span><br>';
					echo '<div id="legendinner">';
				
					foreach($legend as $entry) {
						if(isset($entry["diagram"])) { 
							echo '<br>';
							echo '<img src="../'.$entry["diagram"].'"">';
						} else {
							if(preg_match('/rgb\((?<r>[0-9]{1,3}), (?<g>[0-9]{1,3}), (?<b>[0-9]{1,3})\)/', $entry["bg"], $pregmatchresults)) {
							echo '<img src="color.php?r='.$pregmatchresults["r"].'&g='.$pregmatchresults["g"].'&b='.$pregmatchresults["b"].'" style="width:20px;height:20px;">&nbsp;';
							}
							echo htmlspecialchars($entry["min"]);
							echo " - ";
							if($entry["l"] != "") echo "<";
							echo htmlspecialchars($entry["max"]);
							echo "<br>";
						}
						
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