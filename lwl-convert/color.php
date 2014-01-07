<?php
/*
	Generiert 1x1px farbiges Bild
*/

$r = 0;
if(isset($_GET["r"]) && is_numeric($_GET["r"])) $r = $_GET["r"];
$g = 0;
if(isset($_GET["g"]) && is_numeric($_GET["g"])) $g = $_GET["g"];
$b = 0;
if(isset($_GET["b"]) && is_numeric($_GET["b"])) $b = $_GET["b"];

header("Content-type: image/png");
$im = ImageCreate (10, 10);
$background_color = ImageColorAllocate ($im, $r, $g, $b);
imagefill($im, 0, 0, $background_color);
ImagePNG($im);
?>