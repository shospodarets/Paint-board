<?php

	// Get the data
	$imageData=$_POST['dataurl'];
	
	// Remove the headers (data:,) part.  
	// A real application should use them according to needs such as to check image type
	$filteredData=substr($imageData, strpos($imageData, ",")+1);

	// Need to decode before saving since the data we received is already base64 encoded
	$unencodedData=base64_decode($filteredData);
	
	// $data is file data
	$pvars   = array('image' => base64_encode($unencodedData), 'key' => '6528448c258cff474ca9701c5bab6927');
	$timeout = 30;
	$curl    = curl_init();
	
	curl_setopt($curl, CURLOPT_URL, 'http://imgur.com/api/upload.xml');
	curl_setopt($curl, CURLOPT_TIMEOUT, $timeout);
	curl_setopt($curl, CURLOPT_POST, 1);
	curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($curl, CURLOPT_POSTFIELDS, $pvars);
	
	$xml = curl_exec($curl);
	echo $xml;
	
	curl_close ($curl);

?>