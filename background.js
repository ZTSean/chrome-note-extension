var db; // database
var notes; // count of notes
var highestId = 0;
//var skipUrls = ['chrome://extensions/','chrome://newtab/','chrome://devtools/devtools.html'];
var searchSettings = { threshold: 0.2, keys: ["note"] };

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
		apply
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

// ===================== Load settings helper functions ====================
// load notes settings
var loadCSS = function(){
	// execute note.js loadCSS function
	code = 'loadCSS('+JSON.stringify(localStorage)+')';
	chrome.tabs.getSelected(null, function(tab) {
		chrome.tabs.executeScript(tab.id, {code: code});
	});
}

// load search settings
var loadSearchSettings = function(){
	// apply search settings from localStorage
	if (localStorage != undefined) {
		if (localStorage['caseSensitive'] != undefined) 
			searchSettings['caseSensitive'] = eval(localStorage['caseSensitive']);
		if (localStorage['shouldSort'] != undefined) 
			searchSettings['shouldSort'] = eval(localStorage['shouldSort']);
		if (localStorage['keys'] != undefined) 
			searchSettings['keys'] = eval(localStorage['keys']);
		if (localStorage['location'] != undefined) 
			searchSettings['location'] = eval(localStorage['location']);
		if (localStorage['threshold'] != undefined) 
			searchSettings['threshold'] = eval(localStorage['threshold']);
		if (localStorage['distance'] != undefined) 
			searchSettings['distance'] = eval(localStorage['distance']);
		if (localStorage['maxPatternLength'] != undefined) 
			searchSettings['maxPatternLength'] = eval(localStorage['maxPatternLength']);
	}
	
}

// load drawing settings
var loadDrawingSettings = function(){
	// execute note.js loadDrawingSettings function
	code = 'loadDrawingSettings('+JSON.stringify(localStorage)+')';
	chrome.tabs.getSelected(null, function(tab) {
		chrome.tabs.executeScript(tab.id, {code: code});
	});
}

// load gesture control settings
var loadGestureSettings = function(){
	// execute note.js loadGestureSettings function
	code = 'loadGestureSettings('+JSON.stringify(localStorage)+')';
	chrome.tabs.getSelected(null, function(tab) {
		chrome.tabs.executeScript(tab.id, {code: code});
	});
}

// =========================================================================

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
				
		}

		
	}
);

chrome.extension.onMessage.addListener(
	function(request,sender,sendResponse) {
		// =================== Jingyuan Hu's implementation ==================
		if(request.msg == "open_new_tab"){
            chrome.tabs.create({
                url: 'chrome://newtab/',
                selected: true
            });
        }
        else if(request.msg == "close_tab"){
            // chrome.tabs.getSelected(null, 
            //     function(tab){
            //         if (!tab.pinned) {
            //             chrome.tabs.remove(tab.id);
            //         }
            //     });
        }
        else if(request.msg == "next_tab"){
            //  chrome.tabs.getSelected(null, 
            //     function(tab) {
            //         chrome.tabs.getAllInWindow(null, 
            //             function(tabs) {
            //                  for(i in tabs){
            //                     if (tabs[i].id == tab.id) {
            //                         var newtab = tabs[i+1] || tabs[0];
            //                         if (newtab) {
            //                             chrome.tabs.update(newtab.id, {selected: true});
            //                         }
            //                     }
            //                 }
            //         });
            // });
            chrome.tabs.getSelected(null, 
                function(tab) {
                    chrome.tabs.getAllInWindow(null, 
                        function(tabs) {
                            for(var i = 0; i < tabs.length; i++){
                                 if (tabs[i].id == tab.id) {
                                    var newtab = tabs[i+1] || tabs[0];
                                    if (newtab) {
                                        chrome.tabs.update(newtab.id, {selected: true});
                                    }
                                }
                            }
                        });
                });
        }
        else if(request.msg == "prev_tab"){
        	console.log("prevprev tab");
            chrome.tabs.getSelected(null, 
                function(tab) {
                    chrome.tabs.getAllInWindow(null, 
                        function(tabs) {
                             for(var i in tabs){
                                if (tabs[i].id == tab.id) {
                                    var newtab = tabs[i-1] || tabs[tabs.length-1];
                                    if (newtab) {
                                        chrome.tabs.update(newtab.id, {selected: true});
                                    }
                                }
                            }
                    });
            });
        }
        else if(request.msg == "open_new_window"){
            chrome.tabs.getSelected(null, 
                function(tab) {
                    chrome.windows.create({url: 'chrome://newtab/'});
                });
        }
        else if(request.msg == "close_window"){
            chrome.tabs.getSelected(null, 
                function(tab) {
                    chrome.windows.remove(tab.windowId);
                });
        }
        else if(request.msg == "pin_tab"){
            chrome.tabs.getSelected(null, 
                function(tab) {
                    chrome.tabs.update({pinned: true});
                });
        }
        else if(request.msg == "add_bookmark"){
            chrome.tabs.getSelected(null, 
                function(tab) {
                    chrome.bookmarks.create({title: tab.title, url: tab.url});
                });
        }
        // ===============================================================
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
	} else if (request.command == "OpenNote") {
		console.log("Open note request from popup");
		db.transaction(function(tx) {
			//console.log("execute executeSql");
			tx.executeSql("SELECT * FROM " + notestable + " WHERE id =?", [request.id], function(tx, result) {
				for (var i = 0; i < result.rows.length; ++i){
					chrome.tabs.create({ url:result.rows.item(i).url});
				}
			});
		});
	}
	// ================= download or delete all notes by url ==================
	else if (request.command == "DownloadAllByUrl") {
		console.log(request.url);
		db.transaction(function(tx) {
			tx.executeSql("SELECT * FROM " + notestable + " WHERE url =?", [request.url], function(tx, result) {
				var data =[];
				for (var i = 0; i < result.rows.length; ++i){
					data[i] = result.rows.item(i);
				}

				var s = JSON.stringify(data);
				console.log(s);
				// send message and selected notes to note.js
				chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {
						command:"downloadallbyurl",
						notesdata:s
					});
                });
			}, function(tx, error) {
				console.log("load notes error...");
				alert('Failed to retrieve notes from database - ' + error.message);
				return;
			});
		});
	} else if (request.command == "DeleteAllByUrl") {
		console.log(request.url);
		db.transaction(function(tx) {
			tx.executeSql("DELETE FROM " + notestable + " WHERE url =?", [request.url], function(tx, result) {
				var data =[];
				for (var i = 0; i < result.rows.length; ++i){
					data[i] = result.rows.item(i).id;
				}

				var s = JSON.stringify(data);
				var code = "deleteAllNotes()"
				// send message and selected notes to note.js
				chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
					if(!skipUrl(tabs[0].url))
						chrome.tabs.executeScript(tabs[0].id, {code: code});
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
			console.log(searchSettings);

			// Database query
			db.transaction(function(tx) {
				//console.log("execute executeSql");
				tx.executeSql("SELECT * FROM " + notestable, [], function(tx, result) {
					var data =[];
					for (var i = 0; i < result.rows.length; ++i){
						data[i] = result.rows.item(i);
					}

					console.log(searchSettings);
					var fuse = new Fuse(data, searchSettings);

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

	// ================= Settings apply listener ===================
	else if (request.command == "ApplySearchSettings") {
		console.log("Start apply settings:");
		loadSearchSettings();
		console.log(searchSettings);
	}
});