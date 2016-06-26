<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Documento sin título</title>
</head>

<body>
<h1>Prueba token</h1>
<?php
	require_once("Rest.inc.php");
	require_once("jwt.php");
	
		$key = "354sasd";
	
	function createToken(){
		$JWT = new JWT();
		$token = array(
			"iss" => "http:/asda/example.org",
			"aud" => "http://example.com",
			"iat" => 1356999524,
			"nbf" => 1357000000
		);
		return $JWT->encode($token, $key);
	}

	function validateToken($token){
		$JWT = new JWT();
		$validate = $JWT->decode($token, $key, array('HS256'));
		return $validate;
	}
	function getToken(){
		if (!function_exists('getallheaders')){ 
			function getallheaders(){ 
			   $headers = array(); 
			   foreach ($_SERVER as $name => $value){ 
				   if (substr($name, 0, 5) == 'HTTP_'){ 
					   $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value; 
				   } 
			   } 
			   return $headers; 
			} 
		}
		$response = getallheaders();
		return $response['Token'];
	}

	$token = createToken();
	echo '<p>'.$token.'</p>';
	//$token = 'eyJ0eXAiOiJKV1QihgjGciOiJIUzI1NiJ9.eyJpc3MiOiJib2xvIiwiYXVkIjoiZWQ1YWZlZjRkNDhmNzZiMGEyYTY5YzVhZDkyOTZkMWQiLCJleHAiOjE0MjgwODg3ODh9.5wKZevDGilndKbFATMqVUGAny1FOAXEfIhUZMr8idcI';
	$val = validateToken($token);
	var_dump($val);
	//echo time();
	//echo $tokenKey;
?>
</body>
</html>

