/*    ____      _____    ______
 *  _[░░░░]_   [░░░░░]  [░░░░░░]
 * [░]````[░] [░]_`_`   [░]```[░]
 * [░]     _   `[░░░]_  [░]    [░]
 * [░]____[░]   _`_`[░] [░]___[░]
 *  `[░░░░]`   [░░░░░]  [░░░░░░]
 *    ````      `````    ``````
 * --- CORE Scouting Database ---
*/

/*       ________           ___________    _____________
 *     _[░░░░░░░░]_       _[░░░░░░░░░░░]  [░░░░░░░░░░░░░]_
 *   _[░░░]````[░░░]_    [░░░░░]```````   [░░░]``````[░░░░]
 *  [░░░]`      `[░░░]  [░░░░]`           [░░░]       `[░░░]
 * [░░░]          ```    [░░░░░]___       [░░░]         [░░░]
 * [░░░]                  ```[░░░░░]__    [░░░]         [░░░]
 * [░░░]          ___         ``[░░░░░]   [░░░]         [░░░]
 *  [░░░]_      _[░░░]           _[░░░░]  [░░░]       _[░░░]
 *   `[░░░]____[░░░]`    _______[░░░░░]   [░░░]______[░░░░]
 *     `[░░░░░░░░]`  0  [░░░░░░░░░░░]` 0  [░░░░░░░░░░░░░]`  0
 *       ````````        ```````````       `````````````
 *               --- CORE Scouting Database ---
*/

// Designer: Sean Lang
console.log('Hello and welcome to the CSD, a intuitive scouting database and analysis program created by Sean Lang of CORE 2062.');

// Google +1 Button
/*
(function () {
	var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
	po.src = 'https://apis.google.com/js/plusone.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
})();
*/

//TODO: float google +1 button left w/out 4px overhang
//TODO: make startup script to warn bad browsers
//TODO: add stuff to prefetch subpages???


//UI Event Handlers
	//set fieldset class on focus
	$("input, textarea").focus(function () {
		$(this).parentsUntil($("form"), "fieldset").addClass('focus');
	});

	$("input, textarea").focusout(function () {
		$(this).parentsUntil($("form"), "fieldset").removeClass('focus');
	});


	//script for clear input icon
	$(".clearIcon span").click(function () {
		var input = this.previousSibling;
		input.value = '';
		input.focus();
	});


	// Accordion
	//TODO: finish Accordion for nav modal
	$('.accordion > p').click(function() {
		console.log('bitches');
		console.log($(this).next());
	});


// global vars
	var current = {
		"index": "",
		"type": "",
		"lastSub": "",
		"subpage": ""
	};
	var prev = {
		"index": "",
		"type": "",
		"lastSub": "",
		"subpage": ""
	};

	var cache = {
		"subpages": [],
		"modals": [],
		"nav": []
	};

	var defaultUser = {//default user object for user who isn't logged in (no cookie is stored for this user)
		"_id": "Guest",
		"permission": 1,
		"token": "",
		"info":{
			"fName": "Guest",
			"lName": "",
			"team": 0
		},
		"prefs": {
			"fade": true,
			"verbose": true
		}
	};

function fixFavicon() { //fixes favicon bug in firefox -- remove in future
	$('#favicon').remove();
	$('<link href="favicon.ico" rel="shortcut icon" id="favicon"/>').appendTo('head');
}

$(document).ready(function() {
	
	$('a[title], label[title], button[title], textarea[title]').tipsy();
	$('input[title]').tipsy({
		trigger: 'focus',
		gravity: 'w'
	});
	$('.toggle-container[title]').tipsy({
		trigger: 'hover',
		gravity: 'w'
	});

	if (eatCookie('user') !== '') {
		window.user = eval('(' + eatCookie('user') + ')');
		updateUserBar();//userbar is setup for guest by default
	} else {
		window.user = defaultUser;
	}

	buildCache();
	nav();
	
	//add error message for old browsers
});

function buildCache() {
	var len = pages.length;

	for (var i = 0; i < len; i++) {
		cache.nav.push(pages[i].name);
		for (var e in pages[i].subpages) {
			cache.subpages.push(e);
		}
		for (e in pages[i].modals) {
			cache.modals.push(e);
		}
	}
	cache.subpages = '.' + cache.subpages.join("-c, .") + '-c';
	cache.modals = '.' + cache.modals.join("-c, .") + '-c';
	cache.nav = '.' + cache.nav.join("-n, .") + '-n';
}


//rewrite this to use HTML5 pushState()
window.onpopstate = function(event) {
	// if nav() is failing, check browser support for this
	console.log(event);
	fixFavicon(); //remove this in future
	nav();
};

function nav() {
	/*
	Navigation Function:
		this function handles all page transitions and applies all page specific options
		page specific options and data needed for displaying pages is stored in the JSON object 'pages'
		open login modal if needed for page
	*/

	if (location.hash.substring(1) === "") {
		location.hash = '#front-page';//default page
		return;
	}

	prev.index = current.index;
	prev.type = current.type;
	prev.lastSub = current.lastSub;
	prev.subpage = current.subpage;

	if (current.subpage == location.hash.substring(1) && current.subpage !== "") {
		return;
	}

	current.subpage = location.hash.substring(1).toLowerCase();

	current.index = '';

	var len = pages.length;
	for (var i = 0; i < len; i++) { //TODO: add catching?
		if (typeof pages[i].subpages[current.subpage] !== 'undefined') {
			current.index = i;
			current.type = 'subpages';
			current.lastSub = current.subpage;
			break;
		}
	}

	if (current.index === '') { // TODO: merge with subpage search ?
		for (i = 0; i < len; i++) {
			if (typeof pages[i].modals[current.subpage] !== 'undefined') {
				current.index = i;
				current.type = 'modals';
				break;
			}
		}
	}

	if (current.index === '') { //page cannot be found, select default page
		window.location = '#front-page';//default page
		return;
	}
	
	//check if page has been downloaded yet (add functionality later)
	//download if it hasn't been

	var fadetime = 500;

	if (prev.subpage === "") { // if this is the first page
		if (current.type == 'modals') {
			//fade in page
			$('.front-page-c').fadeIn(fadetime / 4);
			
			//show navbar
			//$(cache.nav).css('display','none'); - nothing is shown in the beginning
			$('.home-n').css('display','inline');
			$('#front-page-r').attr('checked', true);
			
			//set variables
			current.lastSub = 'front-page';
			prev.index = 2;
			prev.subpage = 'front-page';
		}
		prev.type = "subpages";
	}

	document.title = pages[current.index]['full-name'].replace(/\-/,' ').titleCase() + ' - ' + current['subpage'].replace(/\-/g,' ').titleCase();
	document.getElementById('body').style.minWidth = pages[current.index].minWidth;
	document.getElementById('progressbar').style.display = pages[current.index].progressbar;


	//start page changers
	if (current.type == "subpages"){ //sub-pages
		
		//change navbar (no fade)
		$(cache.nav).css('display','none');
		$('.' + pages[current.index].name + '-n').css('display','inline');
		$('#' + current.subpage + '-r').attr('checked', true);

		if (prev.type == 'subpages') { //sub-pages
			if(user.prefs.fade === true){
				$(cache.subpages).fadeOut(fadetime).promise().done(function() {
					$('.' + current.subpage + '-c').fadeIn(fadetime);
				});
			} else {
				$(cache.subpages).css('display','none');
				$('.' + current.subpage + '-c').css('display','inline');
			}
		} else { //modals
			if (prev.lastSub == current.subpage) { //don't fade out sub-page if is is already under the modal
				if(user.prefs.fade === true){
					$('#overlay, #modal-container, ' + cache.modals).fadeOut(fadetime);
				} else {
					$('#overlay, #modal-container, ' + cache.modals).css('display','none');
				}
			} else {
				if(user.prefs.fade === true){
					$('#overlay, #modal-container, ' + cache.subpages + ', ' + cache.modals).fadeOut(fadetime).promise().done(function() {
						$('.' + current.subpage + '-c').fadeIn(fadetime);
					});
				} else {
					$('#overlay, #modal-container, ' + cache.subpages + ', ' + cache.modals).css('display','none');
					$('.' + current.subpage + '-c').css('display','inline');
				}
			}
		}
	} else { //modal
		document.getElementById('modal-title').innerHTML = pages[current.index]['modals'][current.subpage]['full-name'].replace(/\-/,' ').titleCase();

		if (prev.type == 'subpages'){ //subpages
			if(user.prefs.fade === true){
				$(cache['modals']).hide().promise().done(function() {
					$('#overlay').fadeIn(40);
					$('.' + current.subpage + '-c, #modal-container').fadeIn(fadetime);
				});
			} else {
				$(cache['modals']).css('display','none');
				$('#overlay, .' + current.subpage + '-c, #modal-container').css('display','block');
			}
		} else { //modals
			if(user.prefs.fade === true){
				$(cache.modals).fadeOut(fadetime).promise().done(function() {
					$('.' + current.subpage + '-c, #modal-container').fadeIn(fadetime);
				});
			} else {
				$(cache.modals).css('display','none');
				$('.' + current.subpage + '-c, #modal-container').css('display','inline');
			}
		}
	}
	
	if(pages[current.index][current.type][current.subpage]['login-required'] === true && eatCookie('user') === ''){
		//TODO: figure out a way to do this without a timeout & without screwing up the page below
		setTimeout("window.location = '#login'", fadetime*2);
		return;
	}
	/*
	else:
		assume logged in, if token is wrong error will be returned by process later
		other wise there would be too many login checks
		on error returned from process.php, token is removed
	*/
	
	if(typeof pages[current.index][current.type][current.subpage]['onOpen'] !== undefined){
		eval(pages[current.index][current.type][current.subpage]['onOpen']);
	}
}

//site functions
function modalClose(runScript) {//if runScript is defined then the script won't be run (define as false)
	//TODO: expanding the bottom code to work on all page types
	if(typeof pages[current.index]['modals'][current.subpage]['onClose'] !== 'undefined' && typeof(runScript) === 'undefined'){
		eval(pages[current.index]['modals'][current.subpage]['onClose']);
	}

	window.location = '#' + current.lastSub;
}

//Cookie Handling Functions
	function bakeCookie(name, value) {
		var expires = new Date();
		expires.setTime(expires.getTime() + (15552000000));
		document.cookie = name + "=" + value + "; expires=" + expires.toGMTString() + "; path=/";
	}

	function eatCookie(name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		var cookieValue = "";
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') c = c.substring(1);
			if (c.indexOf(nameEQ) === 0) {
				cookieValue = c.substring(nameEQ.length);
				break;
			}
		}
		return cookieValue;
	}

function getToken(password) {
	/*
	this function handles:
		getting token & user object from login
		calling login.php
		
	must be separate from other functions so it can be called directly from login modal
	*/
	scoutidInput = document.getElementById('scoutid');
	pwordInput = document.getElementById('pword');

	user._id = scoutidInput.value; //put in user object (scoutid in user object != logged in)
	pword = pwordInput.value; //limited to this function (can't be recovered after being typed in)

	scoutidInput.value = ''; //remove them from inputs
	pwordInput.value = '';

	if (user._id === '') {
		$('#jGrowl-container').jGrowl('scoutID is blank', {
			theme: 'error'
		});
	} else if (pword === '') {
		$('#jGrowl-container').jGrowl('password is blank', {
			theme: 'error'
		});
	} else {
		var json = post('login.php', '{"_id":"' + user._id + '","pword":"' + pword + '"}');

		if (json.token) {
			//store stuff in temporary user object
			user = json;

			bakeCookie('user', $.toJSON(user)); //store user object in cookie

			updateUserBar();
			
			modalClose();
			
			return;
		} else if (json !== false) {
			$('#jGrowl-container').jGrowl('server did not respond properly', {
				theme: 'error'
			});
		}
	}
	window.location = '#login';//will only be run at error due to above return
}

function callLogout(){//tells server to logout & runs logout function
	post('process.php','{"request":"logout"}');
	//recheck current page in navbar, radio button hasn't been set yet so timeout is needed
	setTimeout("$('#' + current.subpage + '-r').attr('checked', true)",1);
	logout();
}

function logout() {	//just removes the cookie & user object
	//must be separate from other functions so it can be called from script returned by post() or manually by user

	window.user = defaultUser;//reset to generic user object

	bakeCookie('user', '');//remove user object cookie
	
	updateUserBar();
	
	if(pages[current.index][current.type][current.subpage]['login-required'] === true){
		window.location = '#login';
	}
}

function updateUserBar(){//also updates account modal
	var loginLabel = document.getElementById('login-r-label');

	if(eatCookie('user') !== ''){//logged in
		$('#login').css('display','none');
		$('#logout').css('display','inline');
		loginLabel.setAttribute('original-title','Logout');
		loginLabel.setAttribute('onclick',"callLogout()");
	} else {//not logged in
		$('#logout').css('display','none');
		$('#login').css('display','inline');
		loginLabel.setAttribute('original-title','Login');
		loginLabel.setAttribute('onclick',"window.location = '#login'");
	}

	document.getElementById('scoutName').innerHTML = $.trim(user.info.fName + ' ' + user.info.lName);

	//account modal
	$('#fadeEffects').toggleSwitch("toggle", user.prefs.fade);
	$('#verboseMode').toggleSwitch("toggle", user.prefs.verbose);
}

function updateUser(key, value){//newObject does not need to be a full user object
	//user = jQuery.extend(true, user, userUpdates);//CONSIDER using this in login so only non-default stuff needs to be sent
	user.prefs[key] = value;
	if(eatCookie('user') !== ''){
		bakeCookie('user', $.toJSON(user));
	}
}

function postUserUpdates(){
	if(eatCookie('user') !== ''){//only run if logged in
		post('process.php', '{"request": "updateUser"}');//PHP gets user object from cookie
	}
	modalClose(false);
	//TODO: add checking in postUserUpdates() to see if user object is different
}

//general functions
String.prototype.titleCase = function () {
	return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

Array.prototype.has = function(checkObj){
	return (this.indexOf(checkObj) != -1);
};

Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

function limitInput(e, limit) { //used for limiting form input
	var unicode = e.charCode ? e.charCode : e.keyCode;
	if (unicode != 8 && unicode != 9 && unicode != 37 && unicode != 39) { //if the key isn't the backspace key or tab or l/r arrow
		if ((unicode < 48 || unicode > 57) && limit == 'number') { //if not a number
			return false; //disable key press
		}

		if ((unicode < 65 || unicode > 90) && (unicode < 97 || unicode > 122) && limit == 'letter') { //if not a letter
			return false; //disable key press
		}
	}
}

function json2table (json) {
	var table = '<thead><tr>';
	var len = json.length;
	var len2 = json[0].length;

	for (e=0; e<len2; e++){
		table += '<td>' + json[0][e] + '</td>';
	}

	table += '</tr></thead><tbody>';

	len = json.length;
	for (i=1; i<len; i++){
		table += '<tr>';
		len2 = json[i].length;
		for (e=0; e<len2; e++){
			table += '<td>' + json[i][e] + '</td>';
		}
		table += '</tr>';
	}
	table += '</tbody>';
	return table;
}

function post(filename, json, async){
	async = (typeof async == "undefined")? false :async;//TODO finish??????????????
	/*
	this function handles:
		all interfacing w/ server via AJAX

	TODO: add reattempt code
		
	json.globalError: holds type of globalError (which determines action), error text is still in json.error
	*/
	function success(data){
		json = eval("(" + data + ")");
		console.log(json);//TODO: remove before production
		
		if(json.script){//script must be run before error returns (like for logout function)
			eval(json.script);
		}
		
		if(json.error){
			$('#jGrowl-container').jGrowl('error: ' + json.error, {
				theme: 'error'
			});
			return false; //this means error
		}
		
		if(json.message && user.prefs.verbose === true){
			$('#jGrowl-container').jGrowl('success: ' + json.message, {
				theme: 'message'
			});
			delete json.message;
		}
		
		return json;//if nothing is returned assume error
	}

	var ajax = $.ajax({
		type: "POST",
		url: filename,
		data: 'data=' + json,
		async: async,
		success: function(data){
			if(async) success(data);
		},
		error: function() {
			$('#jGrowl-container').jGrowl('AJAX Error Code: ' + xmlhttp.status + '<br />Request was not successful.', {
				sticky: true,
				theme: 'error'
			});
		}
	});

	if(!async) return success(ajax.responseText);
}


//TODO: replace with something better, like downloadify or just a modal
/*
function WriteToWindow() {
	top.consoleRef = window.open('', 'myconsole', 'width=350,height=250,menubar=0,toolbar=1,status=0,scrollbars=1,resizable=1');
	//TODO: fix link to style sheet, or replace completely
	top.consoleRef.document.write('<html><head><title>Scouting Data</title></head><body bgcolor=white onLoad="self.focus()"><textarea style="width:100%; height:100%;">' + writetext + '</textarea></body></html>')
	top.consoleRef.document.close()
}
*/

function colorBackground(){
	var i = Math.round(new Date() - startTime2)/(5000/seizureMode) ;
	var phase = 0.75;
	center = 128;
	width = 127;
	frequency = Math.PI*2;
	red = Math.floor(Math.sin(frequency*i+2+phase) * width + center);
	green = Math.floor(Math.sin(frequency*i+0+phase) * width + center);
	blue = Math.floor(Math.sin(frequency*i+4+phase) * width + center);
	bodyElement.style.backgroundColor = 'rgb(' + red + ',' + green + ',' + blue + ')';
}

function rainbow(seizureMode){
	if(! seizureMode){
		window.seizureMode = 1;
	} else {
		window.seizureMode = 10;
	}
	console.log(seizureMode);

	window.bodyElement = document.getElementById('body');
	window.startTime2 = new Date();
	setInterval("colorBackground()",150);
}