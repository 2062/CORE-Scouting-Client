###
    ____      _____    ______
  _[░░░░]_   [░░░░░]  [░░░░░░]
 [░]````[░] [░]_`_`   [░]```[░]
 [░]     _   `[░░░]_  [░]    [░]
 [░]____[░]   _`_`[░] [░]___[░]
  `[░░░░]`   [░░░░░]  [░░░░░░]
    ````      `````    ``````
 --- CORE Scouting Database ---
###

###
       ________           ___________    _____________
     _[░░░░░░░░]_       _[░░░░░░░░░░░]  [░░░░░░░░░░░░░]_
   _[░░░]````[░░░]_    [░░░░░]```````   [░░░]``````[░░░░]
  [░░░]`      `[░░░]  [░░░░]`           [░░░]       `[░░░]
 [░░░]          ```    [░░░░░]___       [░░░]         [░░░]
 [░░░]                  ```[░░░░░]__    [░░░]         [░░░]
 [░░░]          ___         ``[░░░░░]   [░░░]         [░░░]
  [░░░]_      _[░░░]           _[░░░░]  [░░░]       _[░░░]
   `[░░░]____[░░░]`    _______[░░░░░]   [░░░]______[░░░░]
     `[░░░░░░░░]`  0  [░░░░░░░░░░░]` 0  [░░░░░░░░░░░░░]`  0
       ````````        ```````````       `````````````
               --- CORE Scouting Database ---
###

# Designer: Sean Lang

#jQuery v1.7.1 - Includes Sizzle.js
<?php echo getCoffee('base/jquery.js'); ?>#NOTICE: one line of whitespace is needed after each PHP part 

#Chosen Select Box
<?php echo getCoffee('base/chosen.js'); ?>

$("select").chosen()

#ToggleJS
<?php echo getCoffee('base/toggleJS/toggle.coffee'); ?>

$(":checkbox").toggleSwitch()

#Tipsy
<?php echo getCoffee('base/tipsy.js'); ?>

$("a[title], label[title], button[title], textarea[title]").tipsy()
$("input[title]").tipsy
	trigger: "focus"
	gravity: "w"

$(".toggle-container[title]").tipsy
	trigger: "hover"
	gravity: "w"

#jGrowl
<?php echo getCoffee('base/jgrowl.js'); ?>

#json2js
<?php echo getCoffee('base/json2js.js'); ?>

console.log 'Hello and welcome to the CSD, a intuitive scouting database and analysis program created by Sean Lang of CORE 2062.'

###
# Google +1 Button
`
(function () {
	var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
	po.src = 'https://apis.google.com/js/plusone.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
})();
`
###

#TODO: float google +1 button left w/out 4px overhang
#TODO: make startup script to warn bad browsers
#TODO: add stuff to prefetch subpages

#error logger
window.onerror = (msg, url, line) ->
	$("#jGrowl-container").jGrowl 'errorMsg:' + msg + ' on line ' + line,
		theme: "error"
		sticky: true

	#TODO: post error to server to record

	false #let default error handler continue

#UI Event Handlers
$("input, textarea").focus ->
	$(this).parentsUntil($("form"), 'fieldset').addClass 'focus' #set fieldset class on focus

$("input, textarea").focusout ->
	$(this).parentsUntil($("form"), 'fieldset').removeClass 'focus'

$(".clearIcon span").click -> #clear input icon
	input = @previousSibling
	input.value = ""
	input.focus()

# accordion
allPanels = $("#navAccordion > ul").hide()
$("#navAccordion > p").click ->
	$target = $(this).next()
	unless $target.hasClass("active")
		allPanels.removeClass("active").slideUp()
		$target.addClass("active").slideDown()
	false

#expiriment with default text
###
$('input[data-defaultText]').each (index, value) ->
	console.log 'theheh'
	console.log this
	console.log index
	console.log value
	this.value = this.dataset.defaultText
###
# global vars
current =
	index: ""
	type: ""
	lastSub: ""
	subpage: ""

prev =
	index: ""
	type: ""
	lastSub: ""
	subpage: ""

cache =
	subpages: []
	modals: []
	nav: []

defaultUser = #default user object for user who isn't logged in (no cookie is stored for this user)
	_id: "Guest"
	permission: 1
	token: ""
	info:
		fName: "Guest"
		lName: ""
		team: 0
	prefs:
		fade: true
		verbose: true

user = {} #so coffeescript sees that this is defined (it isn't seeing the window.user)

fixFavicon = -> #fixes favicon bug in firefox -- remove in future
	$("#favicon").remove()
	$('<link href="favicon.ico" rel="shortcut icon" id="favicon"/>').appendTo "head"

getMissedPosts = ->
	i = 0
	missedPosts = []
	loop
		missedPost = eatCookie("missedPost" + i)
		if missedPost isnt ""
			missedPosts[i] = eval('(' + missedPost + ')')
			i++
		else
			return missedPosts

buildCache = ->
	len = pages.length
	i = 0

	while i < len
		cache.nav.push pages[i].name
		for e of pages[i].subpages
			cache.subpages.push e
		for e of pages[i].modals
			cache.modals.push e
		i++
	cache.subpages = "." + cache.subpages.join("-c, .") + "-c"
	cache.modals = "." + cache.modals.join("-c, .") + "-c"
	cache.nav = "." + cache.nav.join("-n, .") + "-n"

$ ->
	userCookie = eatCookie("user")
	if userCookie isnt ""
		window.user = eval("(" + userCookie + ")")
	else
		window.user = defaultUser
	updateUserBar()
	window.missedPosts = getMissedPosts()
	buildCache()
	nav()

	#add error message for old browsers

window.onpopstate = (event) -> #rewrite this to use HTML5 pushState()
	console.log event
	fixFavicon()
	nav()

nav = ->
	###
	Navigation Function:
		this function handles all page transitions and applies all page specific options
		page specific options and data needed for displaying pages is stored in the JSON object 'pages'
		open login modal if needed for page
	###

	#TODO: make nav change the accordion that is open in the nav modal to the current page

	if location.hash.substring(1) is ""
		location.hash = "#front-page" #default page
		return

	prev.index = current.index
	prev.type = current.type
	prev.lastSub = current.lastSub
	prev.subpage = current.subpage

	return if current.subpage is location.hash.substring(1) and current.subpage isnt ""
	current.subpage = location.hash.substring(1).toLowerCase()
	current.index = ""
	len = pages.length
	i = 0

	while i < len #TODO: add catching?
		if typeof pages[i].subpages[current.subpage] isnt "undefined"
			current.index = i
			current.type = "subpages"
			current.lastSub = current.subpage
			break
		i++

	if current.index is "" #TODO: merge with subpage search ?
		i = 0
		while i < len
			if typeof pages[i].modals[current.subpage] isnt "undefined"
				current.index = i
				current.type = "modals"
				break
			i++
	if current.index is "" #page cannot be found, select default page
		window.location = "#front-page" #default page
		return

	#check if page has been downloaded yet (add functionality later)
	#download if it hasn't been

	fadetime = 500
	if prev.subpage is "" #if this is the first page
		if current.type is "modals" #fade in page
			$(".front-page-c").fadeIn fadetime / 4
			$(".home-n").css "display", "inline" #show navbar
			#$(cache.nav).css('display','none'); not needed - nothing is shown in the beginning
			$("#front-page-r").attr "checked", true

			#set variables
			current.lastSub = "front-page"
			prev.index = 2
			prev.subpage = "front-page"

		prev.type = "subpages"

	document.title = pages[current.index].fullName.replace(/\-/, " ").titleCase() + " - " + current["subpage"].replace(/\-/g, " ").titleCase()
	document.getElementById("body").style.minWidth = pages[current.index].minWidth
	document.getElementById("progressbar").style.display = pages[current.index].progressbar

	#start page changers
	if current.type is "subpages" #sub-pages
		#change navbar (no fade)
		$(cache.nav).css "display", "none"
		$("." + pages[current.index].name + "-n").css "display", "inline"
		$("#" + current.subpage + "-r").attr "checked", true
		if prev.type is "subpages" #sub-pages
			if user.prefs.fade is true
				$(cache.subpages).fadeOut(fadetime).promise().done ->
					$("." + current.subpage + "-c").fadeIn fadetime
			else
				$(cache.subpages).css "display", "none"
				$("." + current.subpage + "-c").css "display", "inline"
		else #modals
			if prev.lastSub is current.subpage #don't fade out sub-page if is is already under the modal
				if user.prefs.fade is true
					$("#overlay, #modalContainer, " + cache.modals).fadeOut fadetime
				else
					$("#overlay, #modalContainer, " + cache.modals).css "display", "none"
			else
				if user.prefs.fade is true
					$("#overlay, #modalContainer, " + cache.subpages + ", " + cache.modals).fadeOut(fadetime).promise().done ->
						$("." + current.subpage + "-c").fadeIn fadetime
				else
					$("#overlay, #modalContainer, " + cache.subpages + ", " + cache.modals).css "display", "none"
					$("." + current.subpage + "-c").css "display", "inline"
	else #modal
		document.getElementById("modalTitle").innerHTML = pages[current.index]["modals"][current.subpage].fullName.replace(/\-/, " ").titleCase()
		if prev.type is "subpages"
			if user.prefs.fade is true
				$(cache["modals"]).hide().promise().done ->
					$("#overlay").fadeIn 40
					$("." + current.subpage + "-c, #modalContainer").fadeIn fadetime
			else
				$(cache["modals"]).css "display", "none"
				$("#overlay, ." + current.subpage + "-c, #modalContainer").css "display", "block"
		else
			if user.prefs.fade is true
				$(cache.modals).fadeOut(fadetime).promise().done ->
					$("." + current.subpage + "-c, #modalContainer").fadeIn fadetime
			else
				$(cache.modals).css "display", "none"
				$("." + current.subpage + "-c, #modalContainer").css "display", "inline"
	if pages[current.index][current.type][current.subpage]["login-required"] is true and eatCookie("user") is ""
		#TODO: figure out a way to do this without a timeout & without screwing up the page below
		setTimeout "window.location = '#login'", fadetime * 2
		return
	###
	else:
		assume logged in, if token is wrong error will be returned by process later
		other wise there would be too many login checks
		on error returned from process.php, token is removed
	###
	eval pages[current.index][current.type][current.subpage]["onOpen"] if typeof pages[current.index][current.type][current.subpage]["onOpen"] isnt `undefined`
	unless current.subpage is 'navigation' 
		$("#navAccordion > p:contains(" + pages[current.index].fullName + ")").trigger('click')#open accordian for current page group

#site functions
modalClose = (runScript) -> #if runScript is defined then the script won't be run (define as false)
	eval pages[current.index]["modals"][current.subpage]["onClose"] if typeof pages[current.index]["modals"][current.subpage]["onClose"] isnt "undefined" and typeof (runScript) is "undefined"
	window.location = "#" + current.lastSub

#cookie handling functions
bakeCookie = (name, value) ->
	expires = new Date()
	expires.setTime expires.getTime() + (15552000000)
	if value is "" #set cookie, or if value is blank, set it to be removed
		document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/"
	else
		document.cookie = name + "=" + value + "; expires=" + expires.toGMTString() + "; path=/"

eatCookie = (name) ->
	nameEQ = name + "="
	ca = document.cookie.split(";")
	cookieValue = ""
	i = 0

	while i < ca.length
		c = ca[i]
		c = c.substring(1) while c.charAt(0) is " "
		if c.indexOf(nameEQ) is 0
			cookieValue = c.substring(nameEQ.length)
			break
		i++
	cookieValue

getToken = (password) ->
	###
		this function handles:
		getting token & user object from login
		calling login.php
		
	must be separate from other functions so it can be called directly from login modal
	###
	scoutidInput = document.getElementById "scoutid"
	pwordInput = document.getElementById "pword"
	user._id = scoutidInput.value #put in user object (scoutid in user object != logged in)
	pword = pwordInput.value #limited to this function (can't be recovered after being typed in)
	scoutidInput.value = "" #remove them from inputs
	pwordInput.value = ""
	if user._id is ""
		$("#jGrowl-container").jGrowl "scoutID is blank",
			theme: "error"
	else if pword is ""
		$("#jGrowl-container").jGrowl "password is blank",
			theme: "error"
	else
		json = post("login.php", "{\"_id\":\"" + user._id + "\",\"pword\":\"" + pword + "\"}")
		if json.token
			#store stuff in temporary user object
			user = json
			bakeCookie "user", $.toJSON(user) #store user object in cookie
			updateUserBar()
			modalClose()
			return
		else if json isnt false
			$("#jGrowl-container").jGrowl "server did not respond properly",
				theme: "error"
	window.location = "#login" #will only be run at error due to above return

callLogout = -> #tells server to logout & runs logout function
	post "process.php", '{"request":"logout"}'
	#recheck current page in navbar, radio button hasn't been set yet so timeout is needed
	setTimeout "$('#' + current.subpage + '-r').attr('checked', true)", 1
	logout()

logout = ->	#just removes the cookie & user object
	#must be separate from other functions so it can be called from script returned by post() or manually by user
	window.user = defaultUser #reset to generic user object
	bakeCookie "user", "" #remove user object cookie
	updateUserBar()
	window.location = "#login" if pages[current.index][current.type][current.subpage]["login-required"] is true

updateUserBar = -> #also updates account modal
	loginLabel = document.getElementById("login-r-label")
	if eatCookie("user") isnt "" #logged in
		$("#login").css "display", "none"
		$("#logout").css "display", "inline"
		loginLabel.setAttribute "original-title", "Logout"
		loginLabel.setAttribute "onclick", "callLogout()"
	else #not logged in
		$("#logout").css "display", "none"
		$("#login").css "display", "inline"
		loginLabel.setAttribute "original-title", "Login"
		loginLabel.setAttribute "onclick", "window.location = '#login'"
	document.getElementById("scoutName").innerHTML = $.trim(user.info.fName + " " + user.info.lName)

	#account modal
	$("#fadeEffects").toggleSwitch "toggle", user.prefs.fade
	$("#verboseMode").toggleSwitch "toggle", user.prefs.verbose

updateUser = (key, value) -> #newObject does not need to be a full user object
	#user = jQuery.extend(true, user, userUpdates);#CONSIDER using this in login so only non-default stuff needs to be sent
	user.prefs[key] = value
	bakeCookie "user", $.toJSON(user) if eatCookie("user") isnt ""
postUserUpdates = ->
	post "process.php", "{\"request\": \"updateUser\"}" if eatCookie("user") isnt "" #PHP gets user object from cookie -- only run if logged in
	modalClose false
	#TODO: add checking in postUserUpdates() to see if user object is different

#general functions
String::titleCase = ->
	@replace /\w\S*/g, (txt) ->
		txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()

Array::has = (checkObj) ->
	@indexOf(checkObj) isnt -1

Array::remove = (from, to) ->
	rest = @slice((to or from) + 1 or @length)
	@length = (if from < 0 then @length + from else from)
	@push.apply this, rest

limitInput = (e, limit) -> #used for limiting form input
	unicode = (if e.charCode then e.charCode else e.keyCode)
	if unicode isnt 8 and unicode isnt 9 and unicode isnt 37 and unicode isnt 39 #if the key isn't the backspace key or tab or l/r arrow
		return false if (unicode < 48 or unicode > 57) and limit is "number" #disable key press if not a number
		return false if (unicode < 65 or unicode > 90) and (unicode < 97 or unicode > 122) and limit is "letter" #disable key press if not a letter

json2table = (json) ->
	table = "<thead><tr>"
	len = json.length
	len2 = json[0].length
	e = 0
	while e < len2
		table += "<td>" + json[0][e] + "</td>"
		e++
	table += "</tr></thead><tbody>"
	len = json.length
	i = 1
	while i < len
		table += "<tr>"
		len2 = json[i].length
		e = 0
		while e < len2
			table += "<td>" + json[i][e] + "</td>"
			e++
		table += "</tr>"
		i++
	table += "</tbody>"
	table

post = (filename, json, async, saveRequest) -> #TODO: remove filename param by migrating all requests to one file
	async = (if (typeof async is "undefined") then false else async)
	saveRequest = (if (typeof saveRequest is "undefined") then false else saveRequest)
	###
	this function handles:
		all interfacing w/ server via AJAX
		
	json.globalError: holds type of globalError (which determines action), error text is still in json.error
	###
	ajax = $.ajax(
		type: "POST"
		url: filename
		data: "data=" + json
		async: async
		success: (data) ->
			postSuccess data if async #else, the function below will be called (async posts can't return anything)
		error: (jqXHR) ->
			#will trigger even if verbose is off
			$("#jGrowl-container").jGrowl "AJAX Error: " + jqXHR.status + "<br />" + jqXHR.statusText + ".",
				sticky: true
				theme: "error"

			saveMissedRequest filename, json if saveRequest
	)
	postSuccess ajax.responseText unless async

postSuccess = (data) ->
	if data.charAt(0) is "{" #not a flawless way to detect if it is json
		json = eval("(" + data + ")")
	else
		json = {}
		json.error = "valid json was not returned"
	eval json.script if json.script

	#console.log(json);#TODO: remove before production

	if json.error
		$("#jGrowl-container").jGrowl "error: " + json.error,
			theme: "error"

		return false #this means error
	if json.message and user.prefs.verbose is true
		$("#jGrowl-container").jGrowl "success: " + json.message,
			theme: "message"

		delete json.message

	#try to submit any requests that failed before
	if missedPosts.length isnt 0
		lastMissedPost = missedPosts.length - 1
		post missedPosts[lastMissedPost].filename, missedPosts[lastMissedPost].json, true, true
		missedPosts.remove 0 #it will be re-added if it fails to submit
		bakeCookie "missedPost" + lastMissedPost, ""
	json #if nothing is returned assume error

saveMissedRequest = (filename, json) ->
	missedPosts.push
		filename: filename
		json: json

	lastMissedPost = missedPosts.length - 1
	bakeCookie "missedPost" + lastMissedPost, $.toJSON(missedPosts[lastMissedPost])
	console.log "TODO: prompt file download" if lastMissedPost >= 149
	$("#jGrowl-container").jGrowl "although the request has failed, your data has been saved, and I will attempt to resubmit it when possible",
		sticky: true
		theme: "error"

#TODO: replace with something better, like downloadify or just a modal

colorList = ['rgb(97,28,252)','rgb(11,223,129)','rgb(27,98,240)','rgb(109,250,21)','rgb(40,247,81)','rgb(1,166,194)','rgb(197,2,196)','rgb(207,4,184)','rgb(210,181,5)','rgb(183,1,208)','rgb(140,7,237)','rgb(12,128,223)','rgb(7,142,213)','rgb(35,87,245)','rgb(15,228,121)','rgb(46,72,250)','rgb(250,106,47)','rgb(19,112,233)','rgb(76,43,254)','rgb(26,101,239)','rgb(217,172,8)','rgb(28,96,241)','rgb(158,227,3)','rgb(102,251,25)','rgb(205,187,4)','rgb(174,1,216)','rgb(228,15,156)','rgb(252,52,99)','rgb(252,99,53)','rgb(31,243,93)','rgb(125,244,13)','rgb(153,4,230)','rgb(230,152,17)','rgb(29,95,242)','rgb(10,219,134)','rgb(245,122,35)','rgb(152,231,4)','rgb(107,250,22)','rgb(209,183,5)','rgb(137,8,239)','rgb(234,20,147)','rgb(233,19,148)','rgb(238,24,139)','rgb(254,88,62)','rgb(179,212,1)','rgb(1,169,191)','rgb(253,95,55)','rgb(186,1,206)','rgb(202,190,3)','rgb(165,2,222)','rgb(21,109,235)','rgb(61,254,57)','rgb(3,156,202)','rgb(254,83,66)','rgb(52,252,66)','rgb(203,3,189)','rgb(155,229,3)','rgb(8,139,216)','rgb(55,63,253)','rgb(167,221,1)','rgb(159,3,226)','rgb(42,248,78)','rgb(145,6,235)','rgb(116,17,247)','rgb(242,30,129)','rgb(25,103,238)','rgb(9,218,135)','rgb(240,133,28)','rgb(248,113,42)','rgb(227,14,158)','rgb(70,48,254)','rgb(53,65,252)','rgb(3,201,158)','rgb(224,162,13)','rgb(136,239,9)','rgb(130,11,242)','rgb(5,147,210)','rgb(63,55,254)','rgb(22,236,107)','rgb(6,212,143)','rgb(38,247,82)','rgb(226,14,159)','rgb(2,163,197)','rgb(149,5,232)','rgb(48,251,71)','rgb(192,200,1)','rgb(147,234,5)','rgb(92,253,32)','rgb(196,196,2)','rgb(214,7,176)','rgb(218,171,9)','rgb(175,1,214)','rgb(171,1,218)','rgb(20,111,234)','rgb(219,169,9)','rgb(1,191,170)','rgb(170,1,219)','rgb(1,173,187)','rgb(5,210,147)','rgb(95,253,30)','rgb(58,253,59)','rgb(27,100,240)','rgb(206,185,4)','rgb(252,100,52)','rgb(1,188,173)','rgb(229,16,154)','rgb(228,157,15)','rgb(253,92,58)','rgb(49,251,69)','rgb(3,204,154)','rgb(254,66,84)','rgb(235,21,145)','rgb(6,144,212)','rgb(231,151,18)','rgb(73,46,254)','rgb(250,47,105)','rgb(2,160,200)','rgb(88,34,254)','rgb(253,59,91)','rgb(81,40,254)','rgb(194,1,198)','rgb(244,124,34)','rgb(143,6,236)','rgb(200,192,2)','rgb(180,1,211)','rgb(37,246,84)','rgb(2,196,164)','rgb(105,23,251)','rgb(110,249,20)','rgb(69,254,49)','rgb(101,252,26)','rgb(236,23,142)','rgb(113,248,19)','rgb(45,74,250)','rgb(222,165,11)','rgb(254,77,72)','rgb(59,59,253)','rgb(118,247,16)','rgb(162,224,2)','rgb(85,254,36)','rgb(249,109,44)','rgb(14,123,226)','rgb(33,90,244)','rgb(251,49,104)','rgb(4,205,153)','rgb(50,68,251)','rgb(246,37,120)'];

colorBackground = ->
	i = Math.floor(Math.random() * colorList.length)
	i = 0 if i > colorList.length - 6 #not really random, but easy and quick
	bodyElement.style.backgroundColor = colorList[i]
	cElement.setAttribute "fill", colorList[i + 1] + " !important"
	sElement.style.fill = colorList[i + 2] + "!important"
	dElement.style.fill = colorList[i + 3] + "!important"
	#TODO: make above work w/ css

	if current.subpage is "front-page"
		bigcElement.style.color = colorList[i + 4]
		bigsElement.style.color = colorList[i + 5]
		bigdElement.style.color = colorList[i + 6]

rainbow = (seizureMode) ->
	window.bodyElement = document.getElementById("body")
	window.bigcElement = document.getElementById("bigC")
	window.bigsElement = document.getElementById("bigS")
	window.bigdElement = document.getElementById("bigD")
	window.cElement = document.getElementById("c")
	window.sElement = document.getElementById("s")
	window.dElement = document.getElementById("d")
	window.startTime2 = new Date()
	setInterval "colorBackground()", 150