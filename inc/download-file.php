<?php
$today = getdate();
$hours = $today['hours'];
$minutes = $today['minutes'];
$seconds = $today['seconds'];

	header('Content-Type: application/x-generated-xml-backup');
	header('Content-disposition: Attachment; filename=paint-board-image(' . date('Y-m-d') . '_' . $hours . '.' . $minutes . '.' . $seconds . ').png');
	// Get the data
	$imageData=$_POST['dataurl'];
	
	// Remove the headers (data:,) part.  
	// A real application should use them according to needs such as to check image type
	$filteredData=substr($imageData, strpos($imageData, ",")+1);

	// Need to decode before saving since the data we received is already base64 encoded
	$unencodedData=base64_decode($filteredData);
	echo $unencodedData;

	// Save file.  This example uses a hard coded filename for testing, 
	// but a real application can specify filename in POST variable
	// $fp = fopen( 'to-download/test.png', 'wb' );
	// fwrite( $fp, $unencodedData);
	// fclose( $fp );

?>
