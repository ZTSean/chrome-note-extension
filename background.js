var db; // database
var notes; // count of notes
var highestId = 0;
//var skipUrls = ['chrome://extensions/','chrome://newtab/','chrome://devtools/devtools.html'];

// data base table name
var notestable = "WebNotes";

try {
	if (window.openDatabase) {
		// openDatabase(name, version, description, size)
		db = openDatabase("notesdb", "1.0", "Note database", 2000000);
		if (!db)
			alert("Failed to open the database on disk.");
		else{
			 db.transaction(function(tx) {
			 	console.log("Create database...");
			 	// Create table if not exist: 
				tx.executeSql('CREATE TABLE IF NOT EXISTS ' + notestable +  
					'(id REAL UNIQUE, note TEXT, left TEXT, top TEXT, zindex REAL, url TEXT)', 
				  []);
			  });
		}
	} else
		console.log("Couldn't open the database.  Please try with a WebKit nightly with this feature enabled");
}catch(err) {}

// Restrict usage in certain pages
function skipUrl(url,notify){
	if((url.indexOf('http://') != 0 && url.indexOf('https://') != 0 ) || url.indexOf('https://chrome.google.com/') == 0){
		if(notify)	alert('Google Chrome has restrict to use plugin in this page!');
		return true;
	}else
		return false;
}


function findHighestId(){
	db.transaction(function(tx) {
		tx.executeSql("SELECT id FROM " + notestable, [], 
			function(tx, result) {
				for (var i = 0; i < result.rows.length; ++i) {
					var row = result.rows.item(i);
					if (row['id'] > highestId)
						highestId = row['id'];
				}
			}, 
			function(tx, error) {
				console.log("find highest ID error...");
				alert('Failed to retrieve notes from database - ' + error.message);
			return;
			}
		);
	});
}

findHighestId(); //let's find the highest Id

chrome.browserAction.setBadgeText({text:""});

// NOT WORK NOW!!!! Does not activate when the there is a popup page
chrome.browserAction.onClicked.addListener(function(tab) {
	if(!skipUrl(tab.url,true))
		newNote();
});

// load notes when tab being created
chrome.tabs.onCreated.addListener(function(tab) {
	if(!skipUrl(tab.url)){
		loadCSS();
		loadNotes();
	}
	updateCount(tab);
});

// load notes and update count when tab updated
chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tab) {
	if(!skipUrl(tab.url)){
		loadCSS();
		loadNotes();
	}
	updateCount(tab);
});

// update the number of notes
function updateCount(tab,count){
	if(count != undefined){
		notes = count;
	}else if(skipUrl(tab.url)){
		notes = '';
	}else{
		db.transaction(function(tx) {
			tx.executeSql("SELECT * FROM " + notestable + " WHERE url = ?", [tab.url], function(tx, result) {
				notes = result.rows.length;
			})
		});
	}
	chrome.browserAction.setBadgeText({text:""+notes,tabId:tab.id});
}

var newNote =  function() {
	id = ++highestId;
	code = 'newNote('+id+')';
    chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.executeScript(tab.id, {code: code});
    });
};

// Load notes for current tab
var loadNotes = function(){
	chrome.tabs.getSelected(null, function(tab) {
		db.transaction(function(tx) {
			tx.executeSql("SELECT * FROM " + notestable + " WHERE url = ?", [tab.url], function(tx, result) {
				var data =[];
				for (var i = 0; i < result.rows.length; ++i){
					data[i] = result.rows.item(i);
				}
				code = 'loadNotes('+JSON.stringify(data)+')';
				chrome.tabs.executeScript(tab.id, {code: code});
			}, function(tx, error) {
				console.log("load notes error...");
				alert('Failed to retrieve notes from database - ' + error.message);
				return;
			});
		});
	});
}


var loadCSS = function(){
	code = 'loadCSS('+JSON.stringify(localStorage)+')';
	chrome.tabs.getSelected(null, function(tab) {
		chrome.tabs.executeScript(tab.id, {code: code});
	});
}

var execute = function(code) {
    chrome.tabs.getSelected(null, function(tab) {
		if(!skipUrl(tab.url))
			chrome.tabs.executeScript(tab.id, {code: code});
    });
};

chrome.extension.onRequest.addListener(
	function(request,sender,sendResponse) {
		if(request.command == 'save'){
			note = request.data;
			db.transaction(function (tx){
				tx.executeSql("UPDATE " + notestable + " SET note = ?, left = ?, top = ?, zindex = ?, url = ? WHERE id = ?", [note.text, note.left, note.top, note.zindex, note.url, note.id]);
			});
			sendResponse({message:"Saved",id:request.data.id});
		}else if(request.command == 'saveAsNew'){
			console.log("save as new database query called.");
			note = request.data;
			db.transaction(function (tx) {
				tx.executeSql("INSERT INTO " + notestable + " (id, note, left, top, zindex, url) VALUES (?, ?, ?, ?, ?, ?)", [note.id, note.text, note.left, note.top, note.zindex, note.url]);
			});
			sendResponse({message:"SavedNew",id:request.data.id});
		}else if(request.command == 'close'){
			db.transaction(function(tx) {
				tx.executeSql("DELETE FROM " + notestable + " WHERE id = ?", [request.data.id]);
			});
			sendResponse({message:"Deleted",id:request.data.id});
		}else if(request.command == 'updateCount'){
			chrome.tabs.getSelected(null, function(tab) {
				updateCount(tab,request.data);
			});
		}else if (request.command == "Create") {
			chrome.tabs.getSelected(null, function(tab) {
    		console.log(tab.url);
        	if(!skipUrl(tab.url,true))
			{
				//alert("create new note!");
				newNote();
			}
	    });
				
		} // delete summary function
	}
);

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
  	//console.log("runtime message listener.");
    if (request.command == "Create")
    {
    	chrome.tabs.getSelected(null, function(tab) {
    		console.log(tab.url);
        	if(!skipUrl(tab.url,true))
			{
				//alert("create new note!");
				newNote();
			}
	    });
	} else if (request.command == "LoadNotes") {
		console.log("loadNotes request from popup");
		db.transaction(function(tx) {
			//console.log("execute executeSql");
			tx.executeSql("SELECT * FROM " + notestable, [], function(tx, result) {
				var data =[];
				for (var i = 0; i < result.rows.length; ++i){
					data[i] = result.rows.item(i);
				}

				var s = JSON.stringify(data);
				//console.log(s);
				chrome.runtime.sendMessage({
					command:"PopupShowNotes",
					notesdata:s
				});
			}, function(tx, error) {
				console.log("load notes error...");
				alert('Failed to retrieve notes from database - ' + error.message);
				return;
			});
		});
	}
	// ================= Search function listener ===================
	else if (request.command == "Search") {
		console.log("Search request from popup.");
		if (request.key == "") {
			// If search key word is empty, return all search result
			db.transaction(function(tx) {
				//console.log("execute executeSql");
				tx.executeSql("SELECT * FROM " + notestable, [], function(tx, result) {
					var data =[];
					for (var i = 0; i < result.rows.length; ++i){
						data[i] = result.rows.item(i);
					}

					var s = JSON.stringify(data);
					//console.log(s);
					chrome.runtime.sendMessage({
						command:"SearchResult",
						notesdata:s
					});
				}, function(tx, error) {
					console.log("load notes error...");
					alert('Failed to retrieve notes from database - ' + error.message);
					return;
				});
			});
		} else {
			// List of properties that will be searched. This also supports nested properties:
			// !!!!!!! TODO: local user customziation
			var keyOptions = ["note"];
			console.log("key not empty");

			// Database query
			db.transaction(function(tx) {
				//console.log("execute executeSql");
				tx.executeSql("SELECT * FROM " + notestable, [], function(tx, result) {
					var data =[];
					for (var i = 0; i < result.rows.length; ++i){
						data[i] = result.rows.item(i);
					}

					var fuse = new Fuse(data, { threshold: 0.2, keys: keyOptions });

					var result = fuse.search(request.key);

					
					// Send Message Preparation
					chrome.runtime.sendMessage({
						command:"SearchResult",
						notesdata:JSON.stringify(result)
					});



				}, function(tx, error) {
					console.log("load notes error...");
					alert('Failed to retrieve notes from database - ' + error.message);
					return;
				});
			});
		} 
	}
});