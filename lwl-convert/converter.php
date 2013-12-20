<?php
include('conf.php');

if(isset($_POST["svg"]) && isset($_POST["overlay"])) {
	try {
		$uid = uniqid(); // uniqe id für die Dateinamen
		$result = array();
		$svg = $_POST["svg"];
		$overlay = $_POST["overlay"];

		// der mittels dem ESRI Framework generierte SVG Code kommt direkt aus dem HTML und hat daher
		// keinen XML Header, diesen hinzufügen damit ImageMagick nicht meckert
		$svg_header = '<?xml version="1.0" encoding="UTF-8" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
		if(!simplexml_load_string($svg_header.$_POST["svg"])) {
			throw new Exception("SVG file invalid");
		}

		// SVG und Kreisnamen-Overlay in temporären Ordner ablegen
		$overlay_saved = file_put_contents($folder_in.$uid.".png", file_get_contents($overlay));
		$svg_saved = file_put_contents($folder_in.$uid.".svg", $svg_header.$svg);

		// mit ImageMagick aus SVG und Overlay PNG ein Bild machen
		$cmd = 'convert.exe -page 2526x1785 -density 296 "'.$folder_in.$uid.'.svg" -resize 2526x1785 -page 2526x1785 "'.$folder_in.$uid.'.png" -resize 2526x1785 -composite -trim "'.$folder_out.$uid.'.png"';
		passthru($cmd);

		// prüfen, ob ImageMagick erfolgreich war:
		$new_image_created = is_file($folder_out.$uid.'.png');

		if($overlay_saved && $svg_saved && $new_image_created) {
			echo json_encode(array("status" => "success", "message" => $uid));
		} else {
			throw new Exception(json_encode(array("overlay saved" => $overlay_saved, "svg saved" => $svg_saved, "output created" => $new_image_created)));
		}
	} catch (Exception $e) {
		echo $e;
		file_put_contents($temp_folder.'errorlog-'.$uid.'.txt', print_r($e,true));
	}
} else {
	echo json_encode(array("status" => "error", "message" => "Invalid Parameters"));
}
?>