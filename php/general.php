<?php
//This script handles: general functions needed for almost all scripts

//start timer
list($micro, $sec) = explode(" ",microtime());
$starttime = (float)$sec + (float)$micro;

//add back when database is secured: include 'vars.php';  - assigns variables for DB & other sensitive info (not put on github)

//connect to mongoDB
$m = new Mongo();
$db = $m->selectDB("csd");

function globalVar($name, $update = null){//consider adding ability to set var here too
	global $db;

	if(!isset($update)){
		$return = $db->globalVar->findOne(
			array(
				'_id' => $name
			)
		);
	} else {
		$return = $db->globalVar->update(
			array(
				'_id' => $name
			),
			array(
				'$set' => array(
					'value' => $update
				)
			),
			true
		);
	}
	return $return['value'];
}

function globalVarAppend($name, $newData){
	if(count($newData) != 0){
		$newData = array_merge(globalVar($name), $newData);
		globalVar($name, $newData);
	}
}

//check if dev mode is set (dev mode disables obfuscation / minification & caching)
if (isset($_GET['dev'])) {
	$vars['devMode'] = true;
} else {//check for global devMode
	$vars['devMode'] = globalVar('devMode');
	logger(globalVar('devMode'));
}

require 'php/path.php';

if(globalVar('devMode')){
	require 'firephp/fb.php';
	ob_start();

	error_reporting( E_ALL );
	ini_set( 'display_errors', 1 );
}

//get basic variables
$vars['ip'] = $_SERVER['REMOTE_ADDR'] or send_error("cannot get ip");

//The User Object (full example) -- referenced used in login script, and maybe others too later
$userObject = array(
	"_id"=> "SeanLang-2062",
	"permission"=> 9,
	"token"=> "4f1c860728df71.38499022",

	"info"=> array(//send
		"fName"=> "Sean",
		"lName"=> "Lang",
		"team"=> 2062
	),

	"prefs"=> array(//send, optional info
		"fade"=> true,
		"verbose"=> true
	),

	"account"=> array(//not sent, required info
		"pword"=> "superpass",
		"email"=> "slang800@gmail.com"
	),

	"stats"=> array(//not sent, created by server side
		"ip"=> "127.0.0.1",
		"logintime"=> 1327269383.167
	),
	
	"opt"=> array(//not sent, optional info
		"zip"=> 53072,
		"browser"=> "Firefox",
		"gender"=> "m"
	)
);

//logging function
$log = []; //start log - used for general logging (any messages that are not recorded by anything else)

function logger($message, $fbDisplay = false){
	global $log;
	global $starttime;
	global $vars;

	list($micro, $sec) = explode(" ",microtime());
	$duration = (float)$sec + (float)$micro - $starttime;

	$log[] = array($message, $duration);

	if($fbDisplay == true && $vars['devMode'] == true){
		fb($message);
	}

	error_log($message . ", at " . $duration . "\n", 3, "tmp/log");
}

//global return functions
function send_error($error_text, $error = '', $script = ''){
	global $db;
	global $starttime;
	global $log;
	global $input;
	global $vars;
	global $user;
	global $place;
	
	if($script != ''){//if a script is defined, record it
		$log[] = 'script defined: ' . $script;
	}

	if ($error == ""){$error = $error_text;}

	logger("script ended, output buffer=" . ob_get_contents());

	$db->log->insert(
		array(
			'type' => 'error',
			'errorcode' => $error,
			'place' => $place,
			'time' => $starttime,
			'input' => $input,
			'log' => $log,
			'vars' => $vars,
			'user' => $user
		)
	);

	ob_clean (); //empty output buffer, stuff below is only thing sent
	
	if($script == ''){
		die("{'error':'$error_text'}");
	} else {
		die("{'error':'$error_text', 'script':'$script'}");
	}
}

function send_reg($return = '',$enableEncode = true, $logReturn = true){
	global $db;
	global $starttime;
	global $log;
	global $input;
	global $vars;
	global $user;
	global $type;
	global $place;

	logger("script ended, output buffer=" . ob_get_contents());

	/*$db->log->insert(
		array(
			'type' => $type,
			'return' => $logReturn ? $return : "",
			'place' => $place,
			'time' => $starttime,
			'input' => $input,
			'log' => $log,
			'vars' => $vars,
			'user' => $user
		)
	);*/

	if($enableEncode == true){//option required for index.php (sends entire page as return)
		$return = json_encode($return);
	}
	
	ob_clean(); //empty output buffer, stuff below is only thing sent
	die($return);
}

//general functions
function array_add($arrays){//parameter (arrays) is a array of the arrays to be added (must all have same keys)
	//TODO: make this recursive
	$numOfArrays = count($arrays);
	$keys = array_keys($arrays[0]);
	$numOfKeys = count($keys);
	for($i=0; $i < $numOfKeys; $i++){
		$sum[$keys[$i]] = 0;
		for($e=0; $e < $numOfArrays; $e++){ 
			$sum[$keys[$i]] = $sum[$keys[$i]] + $arrays[$e][$keys[$i]];
		}
	}
	return $sum;
}
?>