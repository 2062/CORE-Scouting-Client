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

/* TODO float google +1 button left w/out 4px overhang  */

//set fieldset class on focus
$("input, textarea").focus(function () {
    $(this).parentsUntil($("form"), "fieldset").addClass('focus');
});

$("input, textarea").focusout(function () {
    $(this).parentsUntil($("form"), "fieldset").removeClass('focus');
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
function fixFavicon() { //fixes favicon bug in firefox
    $('#favicon').remove();
    $('<link href="favicon.ico" rel="shortcut icon" id="favicon"/>').appendTo('head');
}

$(document).ready(function() {

    if (eatCookie('user') !== '') {
        window.user = eval(eatCookie('user'));
    } else {
        window.user = {
            "scoutid": "",
            "token": "",
            "prefs": []
        };
    }

    buildCache();

    nav(); //this will trigger login() if needed

	window.pwordin = document.getElementById('pwordin');
	window.pwordout = document.getElementById('pwordout');

	window.boxwidth = 15; //chars

	window.lastinfocus = '';
	window.pword = '';

	var testbox = document.getElementById('testbox');
	window.charwidth = $(testbox).width();
	testbox.style.display = 'none';

	pwordin.style.width = charwidth*boxwidth + 10 + 'px';
});

function buildCache() {
    var len = pages.length;

    for (var i = 0; i < len; i++) {
		cache.nav.push(pages[i].name);
        for (var e in pages[i].subpages) {
            cache.subpages.push(e);
        }
		for (var e in pages[i].modals) {
            cache.modals.push(e);
        }
    }
    cache.subpages = '.' + cache.subpages.join("-c, .") + '-c';
	cache.modals = '.' + cache.modals.join("-c, .") + '-c';
	cache.nav = '.' + cache.nav.join("-n, .") + '-n';
}

window.onpopstate = function(event) {
    // if nav() is failing, check browser support for this
    console.log(event);
    fixFavicon(); //remove this?????
    nav();
}

function nav() {
	/*
	 * Navigation Function
	 * this function handles all page transitions and applies all page specific options
	 * page specific options and data needed for displaying pages is stored in the JSON object 'pages'
	*/

	if (location.hash.substring(1) == "") {
		location.hash = '#front-page';
		return;
	}

    prev.index = current.index;
    prev.type = current.type;
    prev.lastSub = current.lastSub;
    prev.subpage = current.subpage;

    if (current.subpage == location.hash.substring(1) && current.subpage != "") {
        return;
    }

    current.subpage = location.hash.substring(1).toLowerCase();

    current.index = '';

    var len = pages.length;
    for (var i = 0; i < len; i++) { //TODO add catching?
        if (typeof pages[i].subpages[current.subpage] !== 'undefined') {
            current.index = i;
            current.type = 'subpages';
            current.lastSub = current.subpage;
            break;
        }
    }

    if (current.index === '') { // TODO merge with subpage search ?
        for (var i = 0; i < len; i++) {
            if (typeof pages[i].modals[current.subpage] !== 'undefined') {
                current.index = i;
                current.type = 'modals';
                break;
            }
        }
    }

    if (current.index === '') { //page cannot be found, select default page
        window.location = '#front-page';
        return;
    }

    var fadetime = 500;

    if (prev.subpage == "") { // if this is the first page
        if (current.type == 'modals') {
			$('.front-page-c').fadeIn(fadetime / 4);
            current.lastSub = 'front-page';
            prev.index = 2;
            prev.subpage = 'front-page';
        }
        prev.type = "subpages";
    }

    document.title = pages[current.index]['full-name'].replace(/\-/,' ').titleCase() + ' - ' + current['subpage'].replace(/\-/g,' ').titleCase();
	document.getElementById('body').style.minWidth = pages[current.index].minWidth;
	document.getElementById('progressbar').style.display = pages[current.index].progressbar;



	if (current.type != 'modals'){//TODO maybe merge with page changers
		$(cache.nav).css('display','none');
		$('.' + pages[current.index].name + '-n').css('display','inline');
	}

    //start page changers
    if (current.type == "subpages") { //sub-pages
        $('#' + current.subpage + '-r').attr('checked', true); //CONSIDER using [type="radio"]

        if (prev.type == 'subpages') { //sub-pages
            $(cache.subpages).fadeOut(fadetime).promise().done(function() {
                $('.' + current.subpage + '-c').fadeIn(fadetime);
            });
        } else { //modals

            if (prev.lastSub == current.subpage) { //don't fade out sub-page if is is already under the modal
                $('#overlay, #modal-container, ' + cache.modals).fadeOut(fadetime);
            } else {
                $('#overlay, #modal-container, ' + cache.subpages + ', ' + cache.modals).fadeOut(fadetime).promise().done(function() {
                    $('.' + current.subpage + '-c').fadeIn(fadetime);
                });
            }
        }
    } else { //modal
        document.getElementById('modal-title').innerHTML = pages[current.index]['modals'][current.subpage]['full-name'].replace(/\-/,' ').titleCase();

        if (prev.type == 'subpages') { //subpages
            $(cache['modals']).hide().promise().done(function() {
                $('#overlay').fadeIn(40);
                $('.' + current.subpage + '-c, #modal-container').fadeIn(fadetime);
            });
        } else { //modals
            $(cache.modals).fadeOut(fadetime).promise().done(function() {
                $('.' + current.subpage + '-c, #modal-container').fadeIn(fadetime);
            });
        }
    }
}

function modalclose() {
    window.location = '#' + current.lastSub;
}

function bakeCookie(name, value) {
    var expires = new Date();
    expires.setTime(expires.getTime() + (15552000000));
    document.cookie = name + "=" + value + "; expires=" + expires.toGMTString() + "; path=/";
}

function eatCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(nameEQ) == 0) {
            var cookieValue = c.substring(nameEQ.length);
            break;
        } else
        var cookieValue = "";
    }
    return cookieValue;
}
//TODO change login button to global user-button (id = userButton)
//made as button set, name in one part (opens edit-account modal)
//other part has logout (icon & tipsy)

function loginCheck() {
    if (eatCookie('scoutid') !== '' && eatCookie('token') !== '') {
        //assume logged in, if token is wrong error will be returned by process later
        //other wise there would be too many login checks
        //on error returned from process.php, token is removed
        return;
    }


    //is login stuff filled out
    //then attempt login

    //does page require login
    //then open login modal & say page requires login

    scoutidinput = document.getElementById('scoutid');
    pwordinput = document.getElementById('pword');
    loginbutton = document.getElementById('login-button');

    window.scoutid = scoutidinput.value;
    pword = pwordinput.value;
}

function getToken(password) { //merge function with login
    scoutidinput = document.getElementById('scoutid');
    pwordinput = document.getElementById('pword');
    loginbutton = document.getElementById('login-button'); //TODO change to global userButton

    user.scoutid = scoutidinput.value; //put in user object
    pword = pwordinput.value; //not global, pword stays in function and is deleted at return

    scoutidinput.value = ''; //remove them from inputs
    pwordinput.value = '';

    if (user.scoutid == '') {
        $('#jGrowl-container').jGrowl('ScoutID is blank', {
            theme: 'error'
        });
    } else if (pword == '') {
        $('#jGrowl-container').jGrowl('Password is blank', {
            theme: 'error'
        });
    } else {

        var json = post('login.php', '{"scoutid":"' + user.scoutid + '","pword":"' + pword + '"}');

        if (json.token) {
            user.token = json.token;
            user.prefs = json.prefs;

            bakeCookie('user', $.toJSON(user)); //store user object in cookie

            loginbutton.innerHTML = 'Logout';
            //TODO change to set stuff for user-button
            //hide login button
            //show user button with name of scout in the inner html

            return;
        } else if (json.error) {
            $('#jGrowl-container').jGrowl('Login Failure: ' + json.error, {
                theme: 'error'
            });
        } else {
            $('#jGrowl-container').jGrowl('Login Failure: Server did not respond properly', {
                theme: 'error'
            });
        }
    }

    loginbutton.innerHTML = 'Login'; //TODO change to global userButton &  the logout icon
    window.location = '#Login';
}

function pwordchange(newpword, key) {
	if (document.activeElement.id !== 'pwordin' && document.activeElement.id !== 'pwordout' && lastinfocus !== '') {
		var infocus = lastinfocus; //if focus is out of inputs
	} else {
		var infocus = document.activeElement.id;
		lastinfocus = infocus;
	}

	if(infocus == 'pwordin'){
		if (key !== ''){
			key = key.charCode? key.charCode : key.keyCode;
			if (key == 8) { //backspace
				if (newpword == '') {
					pword = pword + newpword;
					var length = pword.length;
					pwordin.value = pword.charAt(length - 1);
					pword = pword.substring(0, length - 1);
					length = pword.length;
				}
				newpword = '';
			} else if (key == 37){ //left arrow
				pwordout.focus();
			} else if(key == 13) { //enter key
				//TODO make it process password first
				modalclose();
				LoginCheck();
			}
		}

		pword = pword + newpword;
		var length = pword.length;
		pwordin.value = "";
		pwordout.value = pword;

	} else if (infocus == 'pwordout') {
		if (newpword.substring(0, newpword.length - 1) == pword) {
			pwordin.focus();
		}
		pword = newpword;
		var length = pword.length;
		pwordin.value = "";
		pwordout.value = pword;
	}

	if(length < boxwidth) {
		pwordin.style.width = charwidth*(boxwidth-length) + 'px';
    	pwordout.style.width = charwidth*length  + 'px';
	} else {
		pwordin.style.width = charwidth + 'px';
		pwordout.style.width = charwidth*(boxwidth-1) + 'px';
	}
}

function logout() {
    scoutid = '';
    token = '';
    loginbutton.innerHTML = 'Login';
    loginCheck();
}


//general functions

String.prototype.titleCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};


function limitInput(e, limit) { //used for limiting form input
    var unicode = e.charCode ? e.charCode : e.keyCode
    if (unicode != 8 && unicode != 9 && unicode != 37 && unicode != 39) { //if the key isn't the backspace key or tab or l/r arrow
        if ((unicode < 48 || unicode > 57) && limit == 'number') { //if not a number
            return false //disable key press
        }

		if ((unicode < 65 || unicode > 90) && (unicode < 97 || unicode > 122) && limit == 'letter') { //if not a letter
            return false //disable key press
        }
    }
}

function caps(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
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

//Tipsy
(function($) {

    function maybeCall(thing, ctx) {
        return (typeof thing == 'function') ? (thing.call(ctx)) : thing;
    };

    function Tipsy(element, options) {
        this.$element = $(element);
        this.options = options;
        this.enabled = true;
        this.fixTitle();
    };

    Tipsy.prototype = {
        show: function() {
            var title = this.getTitle();
            if (title && this.enabled) {
                var $tip = this.tip();

                $tip.find('.tipsy-inner')[this.options.html ? 'html' : 'text'](title);
                $tip[0].className = 'tipsy'; // reset classname in case of dynamic gravity
                $tip.remove().css({
                    top: 0,
                    left: 0,
                    visibility: 'hidden',
                    display: 'block'
                }).prependTo(document.body);

                var pos = $.extend({}, this.$element.offset(), {
                    width: this.$element[0].offsetWidth,
                    height: this.$element[0].offsetHeight
                });

                var actualWidth = $tip[0].offsetWidth,
                    actualHeight = $tip[0].offsetHeight,
                    gravity = maybeCall(this.options.gravity, this.$element[0]);

                var tp;
                switch (gravity.charAt(0)) {
                case 'n':
                    tp = {
                        top: pos.top + pos.height + this.options.offset,
                        left: pos.left + pos.width / 2 - actualWidth / 2
                    };
                    break;
                case 's':
                    tp = {
                        top: pos.top - actualHeight - this.options.offset,
                        left: pos.left + pos.width / 2 - actualWidth / 2
                    };
                    break;
                case 'e':
                    tp = {
                        top: pos.top + pos.height / 2 - actualHeight / 2,
                        left: pos.left - actualWidth - this.options.offset
                    };
                    break;
                case 'w':
                    tp = {
                        top: pos.top + pos.height / 2 - actualHeight / 2,
                        left: pos.left + pos.width + this.options.offset
                    };
                    break;
                }

                if (gravity.length == 2) {
                    if (gravity.charAt(1) == 'w') {
                        tp.left = pos.left + pos.width / 2 - 15;
                    } else {
                        tp.left = pos.left + pos.width / 2 - actualWidth + 15;
                	}
				}

				$tip.css(tp).addClass('tipsy-' + gravity);
				$tip.find('.tipsy-arrow')[0].className = 'tipsy-arrow tipsy-arrow-' + gravity.charAt(0);
				if (this.options.className) {
					$tip.addClass(maybeCall(this.options.className, this.$element[0]));
				}

				if (this.options.fade) {
					$tip.stop().css({
						opacity: 0,
						display: 'block',
						visibility: 'visible'
					}).animate({
						opacity: this.options.opacity
					}, this.options.fadeInTime);
				} else {
					$tip.css({
						visibility: 'visible',
						opacity: this.options.opacity
					});
				}
			}
		},

		hide: function() {
			if (this.options.fade) {
				this.tip().stop().fadeOut(this.options.fadeOutTime, function() {
					$(this).remove();
				});
			} else {
				this.tip().remove();
			}
		},

		fixTitle: function() {
			var $e = this.$element;
			if ($e.attr('title') || typeof($e.attr('original-title')) != 'string') {
				$e.attr('original-title', $e.attr('title') || '').removeAttr('title');
			}
		},

		getTitle: function() {
			var title, $e = this.$element,
				o = this.options;
			this.fixTitle();
			var title, o = this.options;
			if (typeof o.title == 'string') {
				title = $e.attr(o.title == 'title' ? 'original-title' : o.title);
			} else if (typeof o.title == 'function') {
				title = o.title.call($e[0]);
			}
			title = ('' + title).replace(/(^\s*|\s*$)/, "");
			return title || o.fallback;
		},

		tip: function() {
			if (!this.$tip) {
				this.$tip = $('<div class="tipsy"></div>').html('<div class="tipsy-arrow"></div><div class="tipsy-inner"></div>');
			}
			return this.$tip;
		},

		validate: function() {
			if (!this.$element[0].parentNode) {
				this.hide();
				this.$element = null;
				this.options = null;
			}
		},

		enable: function() {
			this.enabled = true;
		},
		disable: function() {
			this.enabled = false;
		},
		toggleEnabled: function() {
			this.enabled = !this.enabled;
		}
	};

	$.fn.tipsy = function(options) {

		if (options === true) {
			return this.data('tipsy');
		} else if (typeof options == 'string') {
			var tipsy = this.data('tipsy');
			if (tipsy) tipsy[options]();
			return this;
		}

		options = $.extend({}, $.fn.tipsy.defaults, options);

		function get(ele) {
			var tipsy = $.data(ele, 'tipsy');
			if (!tipsy) {
				tipsy = new Tipsy(ele, $.fn.tipsy.elementOptions(ele, options));
				$.data(ele, 'tipsy', tipsy);
			}
			return tipsy;
		}

		function enter() {
			var tipsy = get(this);
			tipsy.hoverState = 'in';
			if (options.delayIn == 0) {
				tipsy.show();
			} else {
				tipsy.fixTitle();
				setTimeout(function() {
					if (tipsy.hoverState == 'in') tipsy.show();
				}, options.delayIn);
			}
		};

		function leave() {
			var tipsy = get(this);
			tipsy.hoverState = 'out';
			if (options.delayOut == 0) {
				tipsy.hide();
			} else {
				setTimeout(function() {
					if (tipsy.hoverState == 'out') tipsy.hide();
				}, options.delayOut);
			}
		};

		if (!options.live) this.each(function() {
			get(this);
		});

		if (options.trigger != 'manual') {
			var binder = options.live ? 'live' : 'bind',
				eventIn = options.trigger == 'hover' ? 'mouseenter' : 'focus',
				eventOut = options.trigger == 'hover' ? 'mouseleave' : 'blur';
			this[binder](eventIn, enter)[binder](eventOut, leave);
		}

		return this;

	};

	$.fn.tipsy.defaults = {
		className: null,
		delayIn: 0,
		delayOut: 0,
		fade: true,
		fadeInTime: 500,
		fadeOutTime: 100,
		fallback: '',
		gravity: 'n',
		html: false,
		live: false,
		offset: 0,
		opacity: 0.8,
		title: 'title',
		trigger: 'hover'
	};

	// Overwrite this method to provide options on a per-element basis.
	// For example, you could store the gravity in a 'tipsy-gravity' attribute:
	// return $.extend({}, options, {gravity: $(ele).attr('tipsy-gravity') || 'n' });
	// (remember - do not modify 'options' in place!)
	$.fn.tipsy.elementOptions = function(ele, options) {
		return $.metadata ? $.extend({}, options, $(ele).metadata()) : options;
	};

	$.fn.tipsy.autoNS = function() {
		return $(this).offset().top > ($(document).scrollTop() + $(window).height() / 2) ? 's' : 'n';
	};

	$.fn.tipsy.autoWE = function() {
		return $(this).offset().left > ($(document).scrollLeft() + $(window).width() / 2) ? 'e' : 'w';
	};

	/**
	 * yields a closure of the supplied parameters, producing a function that takes
	 * no arguments and is suitable for use as an autogravity function like so:
	 *
	 * @param margin (int) - distance from the viewable region edge that an
	 *		element should be before setting its tooltip's gravity to be away
	 *		from that edge.
	 * @param prefer (string, e.g. 'n', 'sw', 'w') - the direction to prefer
	 *		if there are no viewable region edges effecting the tooltip's
	 *		gravity. It will try to vary from this minimally, for example,
	 *		if 'sw' is preferred and an element is near the right viewable
	 *		region edge, but not the top edge, it will set the gravity for
	 *		that element's tooltip to be 'se', preserving the southern
	 *		component.
	 */
	$.fn.tipsy.autoBounds = function(margin, prefer) {
		return function() {
			var dir = {
				ns: prefer[0],
				ew: (prefer.length > 1 ? prefer[1] : false)
			},
				boundTop = $(document).scrollTop() + margin,
				boundLeft = $(document).scrollLeft() + margin,
				$this = $(this);

			if ($this.offset().top < boundTop) dir.ns = 'n';
			if ($this.offset().left < boundLeft) dir.ew = 'w';
			if ($(window).width() + $(document).scrollLeft() - $this.offset().left < margin) dir.ew = 'e';
			if ($(window).height() + $(document).scrollTop() - $this.offset().top < margin) dir.ns = 's';

			return dir.ns + (dir.ew ? dir.ew : '');
		}
	};

})(jQuery);

$('a[title]').tipsy();
$('button[title]').tipsy();



	// Disable for iOS devices (their native controls are more suitable for a touch device)
	if (navigator.userAgent.match(/iPad|iPhone|Android/i)) return false;

/*
 *  jQuery selectBox - A cosmetic, styleable replacement for SELECT elements
 *
 *  Copyright 2012 Cory LaViska for A Beautiful Site, LLC.
 *
 *  https://github.com/claviska/jquery-selectBox
 *
 *  Licensed under both the MIT license and the GNU GPLv2 (same as jQuery: http://jquery.org/license)
 *
 */
if(jQuery) (function($) {

	$.extend($.fn, {

		selectBox: function(method, data) {

			var typeTimer,
				typeSearch = '',
				isMac = navigator.platform.match(/mac/i);

			//
			// Private methods
			//

			var init = function(select, data) {

				var options;

				// Disable for iOS devices (their native controls are more suitable for a touch device)
				if( navigator.userAgent.match(/iPad|iPhone|Android|IEMobile|BlackBerry/i) ) return false;

				// Element must be a select control
				if( select.tagName.toLowerCase() !== 'select' ) return false;

				select = $(select);
				if( select.data('selectBox-control') ) return false;

				var control = $('<a class="selectBox" />'),
					inline = select.attr('multiple') || parseInt(select.attr('size')) > 1;

				var settings = data || {};

				control
					.width(select.outerWidth())
					.addClass(select.attr('class'))
					.attr('title', select.attr('title') || '')
					.attr('tabindex', parseInt(select.attr('tabindex')))
					.css('display', 'inline-block')
					.bind('focus.selectBox', function() {
						if( this !== document.activeElement ) $(document.activeElement).blur();
						if( control.hasClass('selectBox-active') ) return;
						control.addClass('selectBox-active');
						select.trigger('focus');
					})
					.bind('blur.selectBox', function() {
						if( !control.hasClass('selectBox-active') ) return;
						control.removeClass('selectBox-active');
						select.trigger('blur');
					});

				if( !$(window).data('selectBox-bindings') ) {
					$(window)
						.data('selectBox-bindings', true)
						.bind('scroll.selectBox', hideMenus)
						.bind('resize.selectBox', hideMenus);
				}

				if( select.attr('disabled') ) control.addClass('selectBox-disabled');

				// Focus on control when label is clicked
				select.bind('click.selectBox', function(event) {
					control.focus();
					event.preventDefault();
				});

				// Generate control
				if( inline ) {

					//
					// Inline controls
					//
					options = getOptions(select, 'inline');

					control
						.append(options)
						.data('selectBox-options', options)
						.addClass('selectBox-inline selectBox-menuShowing')
						.bind('keydown.selectBox', function(event) {
							handleKeyDown(select, event);
						})
						.bind('keypress.selectBox', function(event) {
							handleKeyPress(select, event);
						})
						.bind('mousedown.selectBox', function(event) {
							if( $(event.target).is('A.selectBox-inline') ) event.preventDefault();
							if( !control.hasClass('selectBox-focus') ) control.focus();
						})
						.insertAfter(select);

					// Auto-height based on size attribute
					if( !select[0].style.height ) {

						var size = select.attr('size') ? parseInt(select.attr('size')) : 5;

						// Draw a dummy control off-screen, measure, and remove it
						var tmp = control
							.clone()
							.removeAttr('id')
							.css({
								position: 'absolute',
								top: '-9999em'
							})
							.show()
							.appendTo('body');
						tmp.find('.selectBox-options').html('<li><a>\u00A0</a></li>');
						optionHeight = parseInt(tmp.find('.selectBox-options A:first').html('&nbsp;').outerHeight());
						tmp.remove();

						control.height(optionHeight * size);

					}

					disableSelection(control);

				} else {

					//
					// Dropdown controls
					//
					var label = $('<span class="selectBox-label" />'),
						arrow = $('<span class="selectBox-arrow" />');

					// Update label
					label
						.attr('class', getLabelClass(select))
						.text(getLabelText(select));

					options = getOptions(select, 'dropdown');
					options.appendTo('BODY');

					control
						.data('selectBox-options', options)
						.addClass('selectBox-dropdown')
						.append(label)
						.append(arrow)
						.bind('mousedown.selectBox', function(event) {
							if( control.hasClass('selectBox-menuShowing') ) {
								hideMenus();
							} else {
								event.stopPropagation();
								// Webkit fix to prevent premature selection of options
								options.data('selectBox-down-at-x', event.screenX).data('selectBox-down-at-y', event.screenY);
								showMenu(select);
							}
						})
						.bind('keydown.selectBox', function(event) {
							handleKeyDown(select, event);
						})
						.bind('keypress.selectBox', function(event) {
							handleKeyPress(select, event);
						})
						.insertAfter(select);

					// Set label width
					var labelWidth = control.width() - arrow.outerWidth() - parseInt(label.css('paddingLeft')) - parseInt(label.css('paddingLeft'));
					label.width(labelWidth);

					disableSelection(control);

				}

				// Store data for later use and show the control
				select
					.addClass('selectBox')
					.data('selectBox-control', control)
					.data('selectBox-settings', settings)
					.hide();

			};


			var getOptions = function(select, type) {
				var options;

				switch( type ) {

					case 'inline':


						options = $('<ul class="selectBox-options" />');

						if( select.find('OPTGROUP').length ) {

							select.find('OPTGROUP').each( function() {

								var optgroup = $('<li class="selectBox-optgroup" />');
								optgroup.text($(this).attr('label'));
								options.append(optgroup);

								generateOptions($(this).find('OPTION'), options);

							});

						} else {
							generateOptions(select.find('OPTION'), options);
						}

						options
							.find('A')
								.bind('mouseover.selectBox', function(event) {
									addHover(select, $(this).parent());
								})
								.bind('mouseout.selectBox', function(event) {
									removeHover(select, $(this).parent());
								})
								.bind('mousedown.selectBox', function(event) {
									event.preventDefault(); // Prevent options from being "dragged"
									if( !select.selectBox('control').hasClass('selectBox-active') ) select.selectBox('control').focus();
								})
								.bind('mouseup.selectBox', function(event) {
									hideMenus();
									selectOption(select, $(this).parent(), event);
								});

						disableSelection(options);

						return options;

					case 'dropdown':
						options = $('<ul class="selectBox-dropdown-menu selectBox-options" />');

						if( select.find('OPTGROUP').length ) {

							select.find('OPTGROUP').each( function() {

								var optgroup = $('<li class="selectBox-optgroup" />');
								optgroup.text($(this).attr('label'));
								options.append(optgroup);
								generateOptions($(this).find('OPTION'), options);

							});

						} else {

							if( select.find('OPTION').length > 0 ) {
								generateOptions(select.find('OPTION'), options);
							} else {
								options.append('<li>\u00A0</li>');
							}

						}

						options
							.data('selectBox-select', select)
							.css('display', 'none')
							.appendTo('BODY')
							.find('A')
								.bind('mousedown.selectBox', function(event) {
									event.preventDefault(); // Prevent options from being "dragged"
									if( event.screenX === options.data('selectBox-down-at-x') && event.screenY === options.data('selectBox-down-at-y') ) {
										options.removeData('selectBox-down-at-x').removeData('selectBox-down-at-y');
										hideMenus();
									}
								})
								.bind('mouseup.selectBox', function(event) {
									if( event.screenX === options.data('selectBox-down-at-x') && event.screenY === options.data('selectBox-down-at-y') ) {
										return;
									} else {
										options.removeData('selectBox-down-at-x').removeData('selectBox-down-at-y');
									}
									selectOption(select, $(this).parent());
									hideMenus();
								}).bind('mouseover.selectBox', function(event) {
									addHover(select, $(this).parent());
								})
								.bind('mouseout.selectBox', function(event) {
									removeHover(select, $(this).parent());
								});

						// Inherit classes for dropdown menu
						var classes = select.attr('class') || '';
						if( classes !== '' ) {
							classes = classes.split(' ');
							for( var i in classes ) options.addClass(classes[i] + '-selectBox-dropdown-menu');
						}

						disableSelection(options);

						return options;

				}

			};


			var getLabelClass = function(select) {
				var selected = $(select).find('OPTION:selected');
				return ('selectBox-label ' + (selected.attr('class') || '')).replace(/\s+$/, '');
			};


			var getLabelText = function(select) {
				var selected = $(select).find('OPTION:selected');
				return selected.text() || '\u00A0';
			};


			var setLabel = function(select) {
				select = $(select);
				var control = select.data('selectBox-control');
				if( !control ) return;
				control.find('.selectBox-label').attr('class', getLabelClass(select)).text(getLabelText(select));
			};


			var destroy = function(select) {

				select = $(select);
				var control = select.data('selectBox-control');
				if( !control ) return;
				var options = control.data('selectBox-options');

				options.remove();
				control.remove();
				select
					.removeClass('selectBox')
					.removeData('selectBox-control').data('selectBox-control', null)
					.removeData('selectBox-settings').data('selectBox-settings', null)
					.show();

			};


			var refresh = function(select) {
				select = $(select);
				select.selectBox('options', select.html());
			};


			var showMenu = function(select) {

				select = $(select);
				var control = select.data('selectBox-control'),
					settings = select.data('selectBox-settings'),
					options = control.data('selectBox-options');
				if( control.hasClass('selectBox-disabled') ) return false;

				hideMenus();

				var borderBottomWidth = isNaN(control.css('borderBottomWidth')) ? 0 : parseInt(control.css('borderBottomWidth'));

				// Menu position
				options
					.width(control.innerWidth())
					.css({
						top: control.offset().top + control.outerHeight() - borderBottomWidth,
						left: control.offset().left
					});

				// Show menu
				switch( settings.menuTransition ) {

					case 'fade':
						options.fadeIn(settings.menuSpeed);
						break;

					case 'slide':
						options.slideDown(settings.menuSpeed);
						break;

					default:
						options.show(settings.menuSpeed);
						break;

				}

				// Center on selected option
				var li = options.find('.selectBox-selected:first');
				keepOptionInView(select, li, true);
				addHover(select, li);

				control.addClass('selectBox-menuShowing');

				$(document).bind('mousedown.selectBox', function(event) {
					if( $(event.target).parents().andSelf().hasClass('selectBox-options') ) return;
					hideMenus();
				});

			};


			var hideMenus = function() {

				if( $(".selectBox-dropdown-menu").length === 0 ) return;
				$(document).unbind('mousedown.selectBox');

				$(".selectBox-dropdown-menu").each( function() {

					var options = $(this),
						select = options.data('selectBox-select'),
						control = select.data('selectBox-control'),
						settings = select.data('selectBox-settings');

					switch( settings.menuTransition ) {

						case 'fade':
							options.fadeOut(settings.menuSpeed);
							break;

						case 'slide':
							options.slideUp(settings.menuSpeed);
							break;

						default:
							options.hide(settings.menuSpeed);
							break;

					}

					control.removeClass('selectBox-menuShowing');

				});

			};


			var selectOption = function(select, li, event) {

				select = $(select);
				li = $(li);
				var control = select.data('selectBox-control'),
					settings = select.data('selectBox-settings');

				if( control.hasClass('selectBox-disabled') ) return false;
				if( li.length === 0 || li.hasClass('selectBox-disabled') ) return false;

				if( select.attr('multiple') ) {

					// If event.shiftKey is true, this will select all options between li and the last li selected
					if( event.shiftKey && control.data('selectBox-last-selected') ) {

						li.toggleClass('selectBox-selected');

						var affectedOptions;
						if( li.index() > control.data('selectBox-last-selected').index() ) {
							affectedOptions = li.siblings().slice(control.data('selectBox-last-selected').index(), li.index());
						} else {
							affectedOptions = li.siblings().slice(li.index(), control.data('selectBox-last-selected').index());
						}

						affectedOptions = affectedOptions.not('.selectBox-optgroup, .selectBox-disabled');

						if( li.hasClass('selectBox-selected') ) {
							affectedOptions.addClass('selectBox-selected');
						} else {
							affectedOptions.removeClass('selectBox-selected');
						}

					} else if( (isMac && event.metaKey) || (!isMac && event.ctrlKey) ) {
						console.log(isMac);
						li.toggleClass('selectBox-selected');
					} else {
						li.siblings().removeClass('selectBox-selected');
						li.addClass('selectBox-selected');
					}

				} else {
					li.siblings().removeClass('selectBox-selected');
					li.addClass('selectBox-selected');
				}

				if( control.hasClass('selectBox-dropdown') ) {
					control.find('.selectBox-label').text(li.text());
				}

				// Update original control's value
				var i = 0, selection = [];
				if( select.attr('multiple') ) {
					control.find('.selectBox-selected A').each( function() {
						selection[i++] = $(this).attr('rel');
					});
				} else {
					selection = li.find('A').attr('rel');
				}

				// Remember most recently selected item
				control.data('selectBox-last-selected', li);

				// Change callback
				if( select.val() !== selection ) {
					select.val(selection);
					setLabel(select);
					select.trigger('change');
				}

				return true;

			};


			var addHover = function(select, li) {
				select = $(select);
				li = $(li);
				var control = select.data('selectBox-control'),
					options = control.data('selectBox-options');

				options.find('.selectBox-hover').removeClass('selectBox-hover');
				li.addClass('selectBox-hover');
			};


			var removeHover = function(select, li) {
				select = $(select);
				li = $(li);
				var control = select.data('selectBox-control'),
					options = control.data('selectBox-options');
				options.find('.selectBox-hover').removeClass('selectBox-hover');
			};


			var keepOptionInView = function(select, li, center) {

				if( !li || li.length === 0 ) return;

				select = $(select);
				var control = select.data('selectBox-control'),
					options = control.data('selectBox-options'),
					scrollBox = control.hasClass('selectBox-dropdown') ? options : options.parent(),
					top = parseInt(li.offset().top - scrollBox.position().top),
					bottom = parseInt(top + li.outerHeight());

				if( center ) {
					scrollBox.scrollTop( li.offset().top - scrollBox.offset().top + scrollBox.scrollTop() - (scrollBox.height() / 2) );
				} else {
					if( top < 0 ) {
						scrollBox.scrollTop( li.offset().top - scrollBox.offset().top + scrollBox.scrollTop() );
					}
					if( bottom > scrollBox.height() ) {
						scrollBox.scrollTop( (li.offset().top + li.outerHeight()) - scrollBox.offset().top + scrollBox.scrollTop() - scrollBox.height() );
					}
				}

			};


			var handleKeyDown = function(select, event) {

				//
				// Handles open/close and arrow key functionality
				//

				select = $(select);
				var control = select.data('selectBox-control'),
					options = control.data('selectBox-options'),
					settings = select.data('selectBox-settings'),
					totalOptions = 0,
					i = 0;

				if( control.hasClass('selectBox-disabled') ) return;

				switch( event.keyCode ) {

					case 8: // backspace
						event.preventDefault();
						typeSearch = '';
						break;

					case 9: // tab
					case 27: // esc
						hideMenus();
						removeHover(select);
						break;

					case 13: // enter
						if( control.hasClass('selectBox-menuShowing') ) {
							selectOption(select, options.find('LI.selectBox-hover:first'), event);
							if( control.hasClass('selectBox-dropdown') ) hideMenus();
						} else {
							showMenu(select);
						}
						break;

					case 38: // up
					case 37: // left

						event.preventDefault();

						if( control.hasClass('selectBox-menuShowing') ) {

							var prev = options.find('.selectBox-hover').prev('LI');
							totalOptions = options.find('LI:not(.selectBox-optgroup)').length;
							i = 0;

							while( prev.length === 0 || prev.hasClass('selectBox-disabled') || prev.hasClass('selectBox-optgroup') ) {
								prev = prev.prev('LI');
								if( prev.length === 0 ) {
									if (settings.loopOptions) {
										prev = options.find('LI:last');
									} else {
										prev = options.find('LI:first');
									}
								}
								if( ++i >= totalOptions ) break;
							}

							addHover(select, prev);
							selectOption(select, prev, event);
							keepOptionInView(select, prev);

						} else {
							showMenu(select);
						}

						break;

					case 40: // down
					case 39: // right

						event.preventDefault();

						if( control.hasClass('selectBox-menuShowing') ) {

							var next = options.find('.selectBox-hover').next('LI');
							totalOptions = options.find('LI:not(.selectBox-optgroup)').length;
							i = 0;

							while( next.length === 0 || next.hasClass('selectBox-disabled') || next.hasClass('selectBox-optgroup') ) {
								next = next.next('LI');
								if( next.length === 0 ) {
									if (settings.loopOptions) {
										next = options.find('LI:first');
									} else {
										next = options.find('LI:last');
									}
								}
								if( ++i >= totalOptions ) break;
							}

							addHover(select, next);
							selectOption(select, next, event);
							keepOptionInView(select, next);

						} else {
							showMenu(select);
						}

						break;

				}

			};


			var handleKeyPress = function(select, event) {

				//
				// Handles type-to-find functionality
				//

				select = $(select);
				var control = select.data('selectBox-control'),
					options = control.data('selectBox-options');

				if( control.hasClass('selectBox-disabled') ) return;

				switch( event.keyCode ) {

					case 9: // tab
					case 27: // esc
					case 13: // enter
					case 38: // up
					case 37: // left
					case 40: // down
					case 39: // right
						// Don't interfere with the keydown event!
						break;

					default: // Type to find

						if( !control.hasClass('selectBox-menuShowing') ) showMenu(select);

						event.preventDefault();

						clearTimeout(typeTimer);
						typeSearch += String.fromCharCode(event.charCode || event.keyCode);

						options.find('A').each( function() {
							if( $(this).text().substr(0, typeSearch.length).toLowerCase() === typeSearch.toLowerCase() ) {
								addHover(select, $(this).parent());
								keepOptionInView(select, $(this).parent());
								return false;
							}
						});

						// Clear after a brief pause
						typeTimer = setTimeout( function() { typeSearch = ''; }, 1000);

						break;

				}

			};


			var enable = function(select) {
				select = $(select);
				select.attr('disabled', false);
				var control = select.data('selectBox-control');
				if( !control ) return;
				control.removeClass('selectBox-disabled');
			};


			var disable = function(select) {
				select = $(select);
				select.attr('disabled', true);
				var control = select.data('selectBox-control');
				if( !control ) return;
				control.addClass('selectBox-disabled');
			};


			var setValue = function(select, value) {
				select = $(select);
				select.val(value);
				value = select.val();
				var control = select.data('selectBox-control');
				if( !control ) return;
				var settings = select.data('selectBox-settings'),
					options = control.data('selectBox-options');

				// Update label
				setLabel(select);

				// Update control values
				options.find('.selectBox-selected').removeClass('selectBox-selected');
				options.find('A').each( function() {
					if( typeof(value) === 'object' ) {
						for( var i = 0; i < value.length; i++ ) {
							if( $(this).attr('rel') == value[i] ) {
								$(this).parent().addClass('selectBox-selected');
							}
						}
					} else {
						if( $(this).attr('rel') == value ) {
							$(this).parent().addClass('selectBox-selected');
						}
					}
				});

				if( settings.change ) settings.change.call(select);

			};


			var setOptions = function(select, options) {

				select = $(select);
				var control = select.data('selectBox-control'),
					settings = select.data('selectBox-settings');

				switch( typeof(data) ) {

					case 'string':
						select.html(data);
						break;

					case 'object':
						select.html('');
						for( var i in data ) {
							if( data[i] === null ) continue;
							if( typeof(data[i]) === 'object' ) {
								var optgroup = $('<optgroup label="' + i + '" />');
								for( var j in data[i] ) {
									optgroup.append('<option value="' + j + '">' + data[i][j] + '</option>');
								}
								select.append(optgroup);
							} else {
								var option = $('<option value="' + i + '">' + data[i] + '</option>');
								select.append(option);
							}
						}
						break;

				}

				if( !control ) return;

				// Remove old options
				control.data('selectBox-options').remove();

				// Generate new options
				var type = control.hasClass('selectBox-dropdown') ? 'dropdown' : 'inline',
					options = getOptions(select, type);
				control.data('selectBox-options', options);

				switch( type ) {
					case 'inline':
						control.append(options);
						break;
					case 'dropdown':
						// Update label
						setLabel(select);
						$("BODY").append(options);
						break;
				}

			};


			var disableSelection = function(selector) {
				$(selector)
					.css('MozUserSelect', 'none')
					.bind('selectstart', function(event) {
						event.preventDefault();
					});
			};

			var generateOptions = function(originalOptions, options){
				originalOptions.each(function(){
					var self = $(this);
					var li = $('<li />'),
					a = $('<a />');
					li.addClass( self.attr('class') );
					li.data( self.data() );
					a.attr('rel', self.val()).text( self.text() );
					li.append(a);
					if( self.attr('disabled') ) li.addClass('selectBox-disabled');
					if( self.attr('selected') ) li.addClass('selectBox-selected');
					options.append(li);
				});
			};

			//
			// Public methods
			//

			switch( method ) {

				case 'control':
					return $(this).data('selectBox-control');

				case 'settings':
					if( !data ) return $(this).data('selectBox-settings');
					$(this).each( function() {
						$(this).data('selectBox-settings', $.extend(true, $(this).data('selectBox-settings'), data));
					});
					break;

				case 'options':
					$(this).each( function() {
						setOptions(this, data);
					});
					break;

				case 'value':
                    // Empty string is a valid value
					if( data === undefined ) return $(this).val();
					$(this).each( function() {
						setValue(this, data);
					});
					break;

				case 'refresh':
					$(this).each( function() {
						refresh(this);
					});
					break;

				case 'enable':
					$(this).each( function() {
						enable(this);
					});
					break;

				case 'disable':
					$(this).each( function() {
						disable(this);
					});
					break;

				case 'destroy':
					$(this).each( function() {
						destroy(this);
					});
					break;

				default:
					$(this).each( function() {
						init(this, method);
					});
					break;

			}

			return $(this);

		}

	});
})(jQuery);

//jGrowl
(function($) {

	/** Raise jGrowl Notification on a jGrowl Container **/
	$.fn.jGrowl = function(m, o) {
		if ($.isFunction(this.each)) {
			var args = arguments;

			return this.each(function() {
				var self = this;

				/** Create a jGrowl Instance on the Container if it does not exist **/
				if ($(this).data('jGrowl.instance') === undefined) {
					$(this).data('jGrowl.instance', $.extend(new $.fn.jGrowl(), {
						notifications: [],
						element: null,
						interval: null
					}));
					$(this).data('jGrowl.instance').startup(this);
				}

				/** Optionally call jGrowl instance methods, or just raise a normal notification **/
				if ($.isFunction($(this).data('jGrowl.instance')[m])) {
					$(this).data('jGrowl.instance')[m].apply($(this).data('jGrowl.instance'), $.makeArray(args).slice(1));
				} else {
					$(this).data('jGrowl.instance').create(m, o);
				}
			});
		};
	};

	$.extend($.fn.jGrowl.prototype, {

		/** Default JGrowl Settings **/
		defaults: {
			pool: 0,
			header: '',
			group: '',
			sticky: false,
			position: 'bottom-right',
			glue: 'before',
			theme: 'default',
			check: 250,
			life: 7000,
			closeDuration: 'normal',
			openDuration: 'normal',
			easing: 'swing',
			closer: true,
			closeTemplate: '&times;',
			closerTemplate: '<div>[ close all ]</div>',
			log: function(e, m, o) {},
			beforeOpen: function(e, m, o) {},
			afterOpen: function(e, m, o) {},
			open: function(e, m, o) {},
			beforeClose: function(e, m, o) {},
			close: function(e, m, o) {},
			animateOpen: {
				opacity: 'show'
			},
			animateClose: {
				opacity: 'hide'
			}
		},

		notifications: [],

		/** jGrowl Container Node **/
		element: null,

		/** Interval Function **/
		interval: null,

		/** Create a Notification **/
		create: function(message, o) {
			var o = $.extend({}, this.defaults, o);

			this.notifications.push({
				message: message,
				options: o
			});

			o.log.apply(this.element, [this.element, message, o]);
		},

		render: function(notification) {
			var self = this;
			var message = notification.message;
			var o = notification.options;

			var notification = $('<div class="jGrowl-notification' + ((o.group != undefined && o.group != '') ? ' ' + o.group : '') + '">' + '<div class="jGrowl-close">' + o.closeTemplate + '</div>' + '<div class="jGrowl-header">' + o.header + '</div>' + '<div class="jGrowl-message">' + message + '</div></div>').data("jGrowl", o).addClass(o.theme).children('div.jGrowl-close').bind("click.jGrowl", function() {
				$(this).parent().trigger('jGrowl.close');
			}).parent();


			/** Notification Actions **/
			$(notification).bind("mouseover.jGrowl", function() {
				$('div.jGrowl-notification', self.element).data("jGrowl.pause", true);
			}).bind("mouseout.jGrowl", function() {
				$('div.jGrowl-notification', self.element).data("jGrowl.pause", false);
			}).bind('jGrowl.beforeOpen', function() {
				if (o.beforeOpen.apply(notification, [notification, message, o, self.element]) != false) {
					$(this).trigger('jGrowl.open');
				}
			}).bind('jGrowl.open', function() {
				if (o.open.apply(notification, [notification, message, o, self.element]) != false) {
					if (o.glue == 'after') {
						$('div.jGrowl-notification:last', self.element).after(notification);
					} else {
						$('div.jGrowl-notification:first', self.element).before(notification);
					}

					$(this).animate(o.animateOpen, o.openDuration, o.easing, function() {
						// Fixes some anti-aliasing issues with IE filters.
						if ($.browser.msie && (parseInt($(this).css('opacity'), 10) === 1 || parseInt($(this).css('opacity'), 10) === 0)) this.style.removeAttribute('filter');

						if ($(this).data("jGrowl") != null) // Happens when a notification is closing before it's open.
						$(this).data("jGrowl").created = new Date();

						$(this).trigger('jGrowl.afterOpen');
					});
				}
			}).bind('jGrowl.afterOpen', function() {
				o.afterOpen.apply(notification, [notification, message, o, self.element]);
			}).bind('jGrowl.beforeClose', function() {
				if (o.beforeClose.apply(notification, [notification, message, o, self.element]) != false) $(this).trigger('jGrowl.close');
			}).bind('jGrowl.close', function() {
				// Pause the notification, lest during the course of animation another close event gets called.
				$(this).data('jGrowl.pause', true);
				$(this).animate(o.animateClose, o.closeDuration, o.easing, function() {
					if ($.isFunction(o.close)) {
						if (o.close.apply(notification, [notification, message, o, self.element]) !== false) $(this).remove();
					} else {
						$(this).remove();
					}
				});
			}).trigger('jGrowl.beforeOpen');

			/** Add a Global Closer if more than one notification exists **/
			if ($('div.jGrowl-notification:parent', self.element).size() > 1 && $('div.jGrowl-closer', self.element).size() == 0 && this.defaults.closer != false) {
				$(this.defaults.closerTemplate).addClass('jGrowl-closer').addClass(this.defaults.theme).appendTo(self.element).animate(this.defaults.animateOpen, this.defaults.speed, this.defaults.easing).bind("click.jGrowl", function() {
					$(this).siblings().trigger("jGrowl.beforeClose");

					if ($.isFunction(self.defaults.closer)) {
						self.defaults.closer.apply($(this).parent()[0], [$(this).parent()[0]]);
					}
				});
			};
		},

		/** Update the jGrowl Container, removing old jGrowl notifications **/
		update: function() {
			$(this.element).find('div.jGrowl-notification:parent').each(function() {
				if ($(this).data("jGrowl") != undefined && $(this).data("jGrowl").created != undefined && ($(this).data("jGrowl").created.getTime() + parseInt($(this).data("jGrowl").life)) < (new Date()).getTime() && $(this).data("jGrowl").sticky != true && ($(this).data("jGrowl.pause") == undefined || $(this).data("jGrowl.pause") != true)) {

					// Pause the notification, lest during the course of animation another close event gets called.
					$(this).trigger('jGrowl.beforeClose');
				}
			});

			if (this.notifications.length > 0 && (this.defaults.pool == 0 || $(this.element).find('div.jGrowl-notification:parent').size() < this.defaults.pool)) this.render(this.notifications.shift());

			if ($(this.element).find('div.jGrowl-notification:parent').size() < 2) {
				$(this.element).find('div.jGrowl-closer').animate(this.defaults.animateClose, this.defaults.speed, this.defaults.easing, function() {
					$(this).remove();
				});
			}
		},

		/** Setup the jGrowl Notification Container **/
		startup: function(e) {
			this.element = $(e).addClass('jGrowl').append('<div class="jGrowl-notification"></div>');
			this.interval = setInterval(function() {
				$(e).data('jGrowl.instance').update();
			}, parseInt(this.defaults.check));

			if ($.browser.msie && parseInt($.browser.version) < 7 && !window["XMLHttpRequest"]) {
				$(this.element).addClass('ie6');
			}
		},

		/** Shutdown jGrowl, removing it and clearing the interval **/
		shutdown: function() {
			$(this.element).removeClass('jGrowl').find('div.jGrowl-notification').remove();
			clearInterval(this.interval);
		},

		close: function() {
			$(this.element).find('div.jGrowl-notification').each(function() {
				$(this).trigger('jGrowl.beforeClose');
			});
		}
	});

})(jQuery);


// START AJAX processing



//scoutid and pword should be stored in vars, not in form input



//new AJAX

function post(filename, json) {
	var ajax = $.ajax({
		type: "POST",
		url: filename,
		data: 'data=' + json,
		async: false,
		success: function() {

		},
		error: function() {
			$('#jGrowl-container').jGrowl('AJAX Error Code: ' + xmlhttp.status + '<br />Request was not successful.', {
				sticky: true,
				theme: 'error'
			});
		}
	});
	console.log(ajax);
	json = eval("(" + ajax.responseText + ")");
	return json;
}



// TODO replace with something better, like downloadify or just a modal

function WriteToWindow() {
	top.consoleRef = window.open('', 'myconsole', 'width=350,height=250,menubar=0,toolbar=1,status=0,scrollbars=1,resizable=1');
	//TODO fix link to style sheet, or replace completely
	top.consoleRef.document.write('<html><head><title>Scouting Data</title></head><body bgcolor=white onLoad="self.focus()"><textarea style="width:100%; height:100%;">' + writetext + '</textarea></body></html>')
	top.consoleRef.document.close()
}

//shit code below
/*
switch (RequestType) {
case "P": // Poll

//AJAX

// stuff for processing mail XML

break;
case "I": // Input
		$('#jGrowl-container').jGrowl('Submit pending...');

		if (currentpage == 'Regular'){
		var v1 = errornum
		// var 2 in mutual
		var v3 = document.getElementById('AllianceColor').value;
		var v4 = document.getElementById('AllianceScore').value;
		var v5 = document.getElementById('TeamNum').value;
		var v6 = document.getElementById('YCard').value;
		var v7 = document.getElementById('RCard').value;
		// var 8 in mutual
		var v9 = ''

		}

		if (currentpage == 'Human-Player'){
				var inputXML = "" // build XML for Human-Player
		}

		if (currentpage == 'Regular' || currentpage == 'Human-Player') {
		var v2 = document.getElementById('MatchNum').value;
		var v8 = document.getElementById('Comments').value;
		}

		if (currentpage == 'Pit'){
				var inputXML = "" // build XML for pit
		}

		var RequestText = "&c="+currentpage + "&i="+inputXML

//AJAX


		$('#jGrowl-container').jGrowl('To prevent the loss of valuable scouting data, I have compiled all of the data which you have entered for this match. <br /> Click the button below to open a window containing the scouting data, then send the text to me at <a href="mailto:slang800@gmail.com">slang800@gmail.com</a>, and I will add it to the database.<br /><button type="button" style="margin-left:187px;;" onclick="WriteToWindow();">Open</button>', {sticky: true, theme: 'error'});
		window.writetext = "&ScoutID="+ScoutID + "&pword="+pword + "&Request="+RequestType + RequestText;

		//if no errors
		if (RequestType == 'I') {
				clearinputs();
				if (currentpage == 'Regular' || currentpage == 'Human-Player') {
						increase('MatchNum');
				}
		}


break;
case "M": // Mail


//AJAX

		// Code to clear mail inputs

break;
case "Q": // Query
		if (query.length==0) {
				document.getElementById(place).innerHTML="";
				return;
		}
		var RequestText = "&q="+query + "&t="+type + "&v1="+variable + "&p="+place

//AJAX


break;
*/



// json2js
(function($) {

	var escapeable = /["\\\x00-\x1f\x7f-\x9f]/g,
		meta = {
			'\b': '\\b',
			'\t': '\\t',
			'\n': '\\n',
			'\f': '\\f',
			'\r': '\\r',
			'"': '\\"',
			'\\': '\\\\'
		};

	/**
	 * jQuery.toJSON
	 * Converts the given argument into a JSON respresentation.
	 *
	 * @param o {Mixed} The json-serializble *thing* to be converted
	 *
	 * If an object has a toJSON prototype, that will be used to get the representation.
	 * Non-integer/string keys are skipped in the object, as are keys that point to a
	 * function.
	 *
	 */
	$.toJSON = typeof JSON === 'object' && JSON.stringify ? JSON.stringify : function(o) {

		if (o === null) {
			return 'null';
		}

		var type = typeof o;

		if (type === 'undefined') {
			return undefined;
		}
		if (type === 'number' || type === 'boolean') {
			return '' + o;
		}
		if (type === 'string') {
			return $.quoteString(o);
		}
		if (type === 'object') {
			if (typeof o.toJSON === 'function') {
				return $.toJSON(o.toJSON());
			}
			if (o.constructor === Date) {
				var month = o.getUTCMonth() + 1,
					day = o.getUTCDate(),
					year = o.getUTCFullYear(),
					hours = o.getUTCHours(),
					minutes = o.getUTCMinutes(),
					seconds = o.getUTCSeconds(),
					milli = o.getUTCMilliseconds();

				if (month < 10) {
					month = '0' + month;
				}
				if (day < 10) {
					day = '0' + day;
				}
				if (hours < 10) {
					hours = '0' + hours;
				}
				if (minutes < 10) {
					minutes = '0' + minutes;
				}
				if (seconds < 10) {
					seconds = '0' + seconds;
				}
				if (milli < 100) {
					milli = '0' + milli;
				}
				if (milli < 10) {
					milli = '0' + milli;
				}
				return '"' + year + '-' + month + '-' + day + 'T' + hours + ':' + minutes + ':' + seconds + '.' + milli + 'Z"';
			}
			if (o.constructor === Array) {
				var ret = [];
				for (var i = 0; i < o.length; i++) {
					ret.push($.toJSON(o[i]) || 'null');
				}
				return '[' + ret.join(',') + ']';
			}
			var name, val, pairs = [];
			for (var k in o) {
				type = typeof k;
				if (type === 'number') {
					name = '"' + k + '"';
				} else if (type === 'string') {
					name = $.quoteString(k);
				} else {
					// Keys must be numerical or string. Skip others
					continue;
				}
				type = typeof o[k];

				if (type === 'function' || type === 'undefined') {
					// Invalid values like these return undefined
					// from toJSON, however those object members
					// shouldn't be included in the JSON string at all.
					continue;
				}
				val = $.toJSON(o[k]);
				pairs.push(name + ':' + val);
			}
			return '{' + pairs.join(',') + '}';
		}
	};

	/**
	 * jQuery.quoteString
	 * Returns a string-repr of a string, escaping quotes intelligently.
	 * Mostly a support function for toJSON.
	 * Examples:
	 * >>> jQuery.quoteString('apple')
	 * "apple"
	 *
	 * >>> jQuery.quoteString('"Where are we going?", she asked.')
	 * "\"Where are we going?\", she asked."
	 */
	$.quoteString = function(string) {
		if (string.match(escapeable)) {
			return '"' + string.replace(escapeable, function(a) {
				var c = meta[a];
				if (typeof c === 'string') {
					return c;
				}
				c = a.charCodeAt();
				return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
			}) + '"';
		}
		return '"' + string + '"';
	};

})(jQuery);


// Accordion

$('.accordion > p').click(function() {
	console.log('bitches');
	console.log($(this).next());
});
