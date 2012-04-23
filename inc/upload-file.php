<?php
$errorcode = 0;
$pathtofile = '';
$dataurl = '';
print_r($_POST);
if($_FILES["file"]["size"] > 0){
	if(
		($_FILES["file"]["type"] == "image/gif")
		|| ($_FILES["file"]["type"] == "image/png")
		|| ($_FILES["file"]["type"] == "image/jpeg")
		|| ($_FILES["file"]["type"] == "image/pjpeg")
	){
		if($_FILES["file"]["size"] < 5242880){
			if ($_FILES["file"]["error"] > 0){
				echo "Shit happens. Code is: " . $_FILES["file"]["error"];
				$result = 3;
				$errorcode = $_FILES["file"]["error"];
			}else{
				/* ECHO FILE INFO */
				echo "Upload: " . $_FILES["file"]["name"] . "<br />";
				echo "Type: " . $_FILES["file"]["type"] . "<br />";
				echo "Size: " . ($_FILES["file"]["size"] / 1024) . " Kb<br />";
				echo "Temp file: " . $_FILES["file"]["tmp_name"] . "<br />";
		
				/* MOVE UPLOADED FILE */
				// move_uploaded_file($_FILES["file"]["tmp_name"],
				// "upload/" . $_FILES["file"]["name"]);
				// echo "Stored in: " . "upload/" . $_FILES["file"]["name"];
				// $pathtofile = "upload/" . $_FILES["file"]["name"];
				
				$imagedata = file_get_contents($_FILES["file"]["tmp_name"]);
				$dataurl = "data:image/png;base64," . base64_encode($imagedata);
				$result = 4;
			}
		}else{
			echo "File size is more than 5MB.";
			$result = 2;
		}
	}else{
		echo "Not supported file format.";
		$result = 1;
	}
}else{
	echo "File size is null.";
	$result = 0;
}

sleep(1);

?>

<script language="javascript" type="text/javascript">window.top.window.uploadFileCallback(<?php echo $result . "," . $errorcode . ",'" . $dataurl . "'" ; ?>);</script>