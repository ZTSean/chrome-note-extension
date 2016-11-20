var home_page = $("#home_page");
var note_page = $("#note_page");
var drawing_page = $("#drawing_page");
var search_page = $("#search_page");
var gesture_control_page = $("#gesture_control_page");

var hpButton = $("#home_page_button");
var npButton = $("#note_page_button");
var dpButton = $("#drawing_page_button");
var spButton = $("#search_page_button");
var gcpButton = $("#gc_page_button");

var pages = [home_page, note_page, drawing_page, search_page, gesture_control_page];

// ---------------- Page Content Switch Listener ------------------------
hpButton.click(function () {
	home_page.removeClass("hidden");
	home_page.addClass("show");

	jQuery.each(pages, function (i, page) {
		if (page.attr('id') != home_page.attr('id')) {
			page.addClass("hidden");
		}
	});
});

hpButton.click(function () {
	home_page.removeClass("hidden");
	home_page.addClass("show");

	jQuery.each(pages, function (i, page) {
		if (page.attr('id') != home_page.attr('id')) {
			page.addClass("hidden");
		}
	});
});

npButton.click(function () {
	note_page.removeClass("hidden");
	note_page.addClass("show");

	jQuery.each(pages, function (i, page) {
		if (page.attr('id') != note_page.attr('id')) {
			page.addClass("hidden");
		}
	});
});

dpButton.click(function () {
	drawing_page.removeClass("hidden");
	drawing_page.addClass("show");

	jQuery.each(pages, function (i, page) {
		if (page.attr('id') != drawing_page.attr('id')) {
			page.addClass("hidden");
		}
	});
});

spButton.click(function () {
	search_page.removeClass("hidden");
	search_page.addClass("show");

	jQuery.each(pages, function (i, page) {
		if (page.attr('id') != search_page.attr('id')) {
			page.addClass("hidden");
			page.removeClass('show');
		}
	});
});

gcpButton.click(function () {
	gesture_control_page.removeClass("hidden");
	gesture_control_page.addClass("show");

	jQuery.each(pages, function (i, page) {
		if (page.attr('id') != gesture_control_page.attr('id')) {
			page.addClass("hidden");
			page.removeClass('show');
		}
	});
});

// ---------------- Note Option Control ------------------------
var noteOptions = [
	'bg_color', // background color
	't_color', // text color
	'bb_color', // tool bar background color
	'bi_color', // tool bar icon color
	'font', // font style
	'font_size' // font size
];

var note_defaults =['FFF046','000066','DDBB00','666666', 'Arial, Helvetica, sans-serif','14'];

var font_options = {
	'Arial':'Arial, Helvetica, sans-serif',
	'Times':'Times, serif',
	'Georgia':'Georgia, Times, serif',
	'Geneva':'Geneva, Arial, Helvetica, sans-serif',
	'Helvetica':'Helvetica, Arial, Geneva',
	'Verdana':'Verdana, Arial, Helvetica',
	'Monospace':'monospace, courier'
}


function save_note_options () {
	for (i = 0; i < noteOptions.length; i++) {
		localStorage[noteOptions[i]] = $('#' + noteOptions[i]).val();
	}

	alert("Note Settings Saved!");
}

function reset_note_options () {
	for (i = 0; i < noteOptions.length; i++) {
		localStorage[noteOptions[i]] = note_defaults[i];
		// update preview in settings page
		$('#'+noteOptions[i]).val(note_defaults[i]);
		if (noteOptions[i].includes('_color')) {
			$('#' + noteOptions[i]).css('background-color', note_defaults[i]);
		}
	}

	alert("Reset Note Settings!");
}

function initNoteSettingPage() {
	var input = $("#font");
	$.each(font_options,function(fi,font){
				opt = $('<option>');
				opt.attr('value',font);
				opt.text(fi)
				input.append(opt);
			});
}

initNoteSettingPage();

$('#note_options_save_button').click(function () { save_note_options(); });
$('#note_options_reset_button').click(function () { reset_note_options();});

// ---------------- Drawing Option Control ------------------------
var drawingOptions = [

];

// ---------------- Search Option Control ------------------------
var searchOptions = [
	'caseSensitive',
	'shouldSort',
	'keys',
	'location',
	'threshold',
	'distance',
	'maxPatternLength',
];

var search_defaults =[
	'false',
	'true',
	'["note"]',
	'0',
	'0.2',
	'100',
	'32'
];

function load_search_options(){
	for(i = 0; i < searchOptions.length; i++) {
		if(localStorage[searchOptions[i]])
			$('#'+searchOptions[i]).val(localStorage[searchOptions[i]]);
		else
			$('#'+searchOptions[i]).val(search_defaults[i]);
		new jscolor.color(searchOptions[i]);
	}
	
}

function save_search_options(){
	console.log("save_search_options.");
	for(i = 0; i < searchOptions.length; i++) {
		if (searchOptions[i] == 'caseSensitive' || searchOptions[i] == 'shouldSort') {
			localStorage[searchOptions[i]] = $('#'+searchOptions[i]).prop('checked');
		} else {
			localStorage[searchOptions[i]] = $('#'+searchOptions[i]).val();	
		}
		
	}
	
	// send runtime message to background.js to apply settings
	chrome.runtime.sendMessage({command: "ApplySearchSettings"});

	alert("Search Settings Saved!");
}

function reset_search_options(){
	for(i = 0; i < searchOptions.length; i++) {
		localStorage[searchOptions[i]] = search_defaults[i];	
	}
	
	// send runtime message to background.js to apply settings
	chrome.runtime.sendMessage({command: "ApplySearchSettings"});

	alert("Reset Search Settings!");
}

$('#search_options_save_button').click(function () { save_search_options(); });
$('#search_options_reset_button').click(function () { reset_search_options(); });

// ---------------- Gesture Option Control ------------------------
// gesture control options
var gcOptions = [
    'LEFT',
    'RIGHT',
    'UP',
    'DOWN',
    'LEFTARROW',
    'RIGHTARROW',
    'UPARROW',
    'DOWNARROW',
    'CIRCLE',
    'TRIANGLE'
];

// * gesture control default settings (has the same order as gcOptions)
var gc_defaults = [
    'close_window',
    'open_new_window',
    'pin_tab',
    'close_tab',
    'prev_tab',
    'next_tab',
    'scroll_top',
    'scroll_bottom',
    'reload_page'
];

var gesture_options = {
    'Close window': 'close_window',
    'Open new window': 'open_new_window',
    'Pin tab': 'pin_tab',
    'Close current tab': 'close_tab',
    'Back to previous tab': 'prev_tab',
    'Go to next tab': 'next_tab',
    'Scroll up to the page top': 'scroll_top',
    'Scroll down to the page bottom': 'scroll_bottom',
    'Reload current page': 'reload_page',
}

function save_gc_options () {
    for (i = 0; i < gcOptions.length; i++) {
        localStorage[gcOptions[i]] = $('#gc_' + gcOptions[i]).val();
    }

    // send runtime message to gestureControl.js to apply settings
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    	console.log(tabs[0].url);
                    chrome.tabs.sendMessage(tabs[0].id, {
						command:"ApplyGestureSettings",
					});
                });
	//chrome.runtime.sendMessage({command: "ApplyGestureSettings"});

	alert("Gesture Settings Saved!");
}

function reset_gc_options () {
    for(i = 0; i < gcOptions.length; i++) {
		localStorage[gcOptions[i]] = gc_defaults[i];	
	}
	
	// send runtime message to gestureControl.js to apply settings
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		console.log(tabs[0].url);
                    chrome.tabs.sendMessage(tabs[0].id, {
						command:"ResetGestureSettings",
					});
                });
	//chrome.runtime.sendMessage({command: "ApplyGestureSettings"});

	alert("Reset Gesture Settings!");
}

function initControlSettingPage() {
    // Add options to each select element
    var inputArray = $('#gesture_control_page select');
    var i = 0;
    $.each(inputArray, function(index, input) {
    	var j = 0;
        $.each(gesture_options,function(actionName,action){
                opt = $('<option>');
                opt.attr('value',action);
                opt.text(actionName);
                if (i == j) opt.attr("selected", "selected");
                // set showing value is default value when init
    			// order of select array in html has to be consistent with defaults array
                $(input).append(opt);
                j++;
            });    

        i++;
    });
    
}

initControlSettingPage();

$('#gesture_options_save_button').click(function () { save_gc_options(); });
$('#gesture_options_reset_button').click(function () { reset_gc_options(); });








