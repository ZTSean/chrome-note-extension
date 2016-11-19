var notes = [];
var pages = ['homepage', 'mode_switch_page', 'accordion'];

// Create Button -----------------------------
document.getElementById("create").addEventListener("click", function () {
	//console.log("Create clicked.");
	chrome.runtime.sendMessage ({command:"Create"});
});

// Get notes button --------------------------
document.getElementById("get_notes").addEventListener("click", function () {
	chrome.runtime.sendMessage ({command: "LoadNotes"});
	console.log("get notes clicked.");

	$('#accordion').addClass('show');
	$('#accordion').removeClass('hidden');
	for (var i = 0; i < pages.length; i++) {
		if (pages[i] != 'accordion') {
			$('#'+pages[i]).addClass('hidden');
			$('#'+pages[i]).removeClass('show');
		}
	}
});

// Switch mode button --------------------------
document.getElementById("switch_mode").addEventListener("click", function () {
	console.log("switch mode clicked.");

	$('#mode_switch_page').addClass('show');
	$('#mode_switch_page').removeClass('hidden');
	for (var i = 0; i < pages.length; i++) {
		if (pages[i] != 'mode_switch_page') {
			$('#'+pages[i]).addClass('hidden');
			$('#'+pages[i]).removeClass('show');
		}
	}
});

// Get notes button --------------------------
document.getElementById("search").addEventListener("click", function () {
	var keyword = document.getElementById("keyword").value;
	$('#accordion').addClass('show');
	$('#accordion').removeClass('hidden');
	for (var i = 0; i < pages.length; i++) {
		if (pages[i] != 'accordion') {
			$('#'+pages[i]).addClass('hidden');
			$('#'+pages[i]).removeClass('show');
		}
	}

	console.log(keyword + " search submitted.");
	chrome.runtime.sendMessage ( {command: "Search", key:keyword } );
	
}); 	

// Mode switch button ------------------------
document.getElementById("gesturemodebutton").addEventListener("click", function () {
	// get true or false value of radio button
	var isSelected = $(this).prop('checked');
	
	// TODO: background 
});

document.getElementById("drawingmodebutton").addEventListener("click", function () {
	// get true or false value of radio button
	var isSelected = $(this).prop('checked');
	
	// TODO: background 
});  	

// ====== Message receiver ======
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.command == "PopupShowNotes" || request.command == "SearchResult")
    {
    	// Clear previous result
		var notelist = document.getElementById('accordion');
		var node = notelist.firstChild;

		while(node) {
		    notelist.removeChild( node );
		    node = notelist.firstChild;
		}

    	// get note data
    	loadNotes(request.notesdata);
	};
});

// --------------------- Helper functions ----------------------
function loadNotes(notesdata)
{
	var notelist = document.getElementById('accordion');
	//var notelist = document.getElementById('note_list').firstElementChild;

	if (typeof notesdata != 'undefined')
	{
		data = JSON.parse(notesdata);	
	
		//console.log(notesdata);
	    
	    for (var i = 0; i < data.length; ++i) {
	    	var row = data[i];

	    	/* list group style
	    	var note = document.createElement("a");
	    	note.href = "#"; // TODO: link with webpages and notes
	    	note.className = "list-group-item";
	    	note.setAttribute('data-toggle', 'collapse');
	    	note.setAttribute('data-parent', '#note_list'); 
	    	note.setAttribute('data-target', '#note_content_' + row.id);
	    	note.innerHTML = "note_" + row.id;

	    	// note content
	    	var notecontent = document.createElement("div");
	    	notecontent.className = "collapse list-group-item";
	    	notecontent.id = "note_content_"+row.id;
	    	notecontent.innerHTML = row.note;


	    	notelist.appendChild(note);
	    	notelist.appendChild(notecontent);
	        */

	        /* Panel style */
	        var note = document.createElement('div');
	        note.className = "panel panel-default";

	        var heading = document.createElement('div');
	        heading.className = "panel-heading";
	        var title = document.createElement('div');
	        title.className = "panel-title";
	        //var a = document.createElement('a');
	        title.setAttribute('data-toggle', 'collapse');
	        title.setAttribute('data-parent', '#accordion');
	        title.setAttribute('data-target', '#note_content_' + row.id);
	        title.innerHTML = "note_"+row.id;
	        //title.appendChild(a);
	        heading.appendChild(title);
	        note.appendChild(heading);

	        var notecontent = document.createElement('div');
	        notecontent.id = 'note_content_'+row.id;
	        notecontent.className = "panel-collapse collapse";
	        var content = document.createElement('div');
	        content.className = "panel-body";
	        content.innerHTML = row.note;
	        notecontent.appendChild(content);
	        note.appendChild(notecontent);

	        notelist.appendChild(note);
	    }
	}
   
}