<?php
    // remove this section before production
    require_once('FirePHP/fb.php');
    ob_start();

    error_reporting( E_ALL );
    ini_set( 'display_errors', 1 );
?>


<?php
/*
TODO add openid based sign-up (perhaps a accordian to hold different sign-up methods)

This script handles:
	signup (because process.php requires token)
*/




//start timer
list($micro, $sec) = explode(" ",microtime());
$starttime = (float)$sec + (float)$micro;

//add back when database is secured: include 'vars.php'; //assigns variables for DB & other sensitive info

$log = array(); //start log


//connect to mongoDB
$m = new Mongo();
$db = $m->selectDB("CSD");


//get & validate input variables
$input = $_POST['data'];
$input = json_decode($input, true);

$vars['ip'] = $_SERVER['REMOTE_ADDR'] or send_error("cannot get ip","");

//check for same username
//check for same email
//check for invalid team, email, name... (also on client side)

$permission = 1;

$db->execute("
    db.user.insert({
        _id: '" . $scoutid . "',
        name:'" . $name . "',
        email: '" . $email . "',
        permission:" . $permission . ",
        pword:'" . $pword . "',
        team:" . $team . "
        stats:{
                gender:'',
                //other stuff
        }
    });
");

//send confirmation email + instructions for training

function send_error($error_text, $error) {
    global $db;
    global $starttime;
    global $log;
    global $input;
    global $vars;
    global $user;

    if ($error == "") {$error = $error_text;}

    list($micro, $sec) = explode(" ",microtime());
    $endtime = (float)$sec + (float)$micro;
    $total_time = ($endtime - $starttime);

    $log_input = json_encode($input);
    $log_vars = json_encode($vars);
    $log_log = json_encode($log);
    $log_user = json_encode($user);

    $insert = "{
        type:'error',
        errorcode:'$error',
        place:'signup.php',
        time:'$starttime',
        duration:'$total_time',
        input:$log_input,
        log:$log_log,
        vars:$log_vars
        user:$log_user
    }";
    $db->execute("db.log.insert($insert)");

    ob_clean (); //empty output buffer, error_text is only thing sent
    die("{'error':'$error_text'}");
}

function send_reg() {
    global $db;
    global $starttime;
    global $log;
    global $input;
    global $vars;
    global $user;
    global $return;

    list($micro, $sec) = explode(" ",microtime());
    $endtime = (float)$sec + (float)$micro;
    $total_time = ($endtime - $starttime);

    $log_input = json_encode($input);
    $log_vars = json_encode($vars);
    $log_log = json_encode($log);
    $log_user = json_encode($user);

    $insert = "{
        type:'signup',
        return:'$return',
        place:'signup.php',
        time:'$starttime',
        duration:'$total_time',
        input:$log_input,
        log:$log_log,
        vars:$log_vars
        user:$log_user
    }";
    $db->execute("db.log.insert($insert)");

    $return = json_encode($return);
    ob_clean (); //empty output buffer, return is only thing sent
    die($return);
}
?>