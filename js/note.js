var captured = null;
var highestZ = 0;
var notes = new Array();
var clickedMouseButton = -1;
var moved = false;

var fa = document.createElement('style');
    fa.type = 'text/css';
    fa.textContent = '@font-face { font-family: FontAwesome; src: url("'
        + chrome.extension.getURL('fonts/fontawesome-webfont.woff?v=4.7.0')
        + '"); }';
document.head.appendChild(fa);

chrome.extension.sendRequest({command:"InsertDownloadJS"});

function getHighestZindex(){
   var highestIndex = 0;
   var currentIndex = 0;
   var elArray = Array();
   elArray = document.getElementsByTagName('*');
   for(var i=0; i < elArray.length; i++){
      if (elArray[i].currentStyle){
         currentIndex = parseFloat(elArray[i].currentStyle['zIndex']);
      }else if(window.getComputedStyle){
         currentIndex = parseFloat(document.defaultView.getComputedStyle(elArray[i],null).getPropertyValue('z-index'));
      }
      if(!isNaN(currentIndex) && currentIndex > highestIndex){ highestIndex = currentIndex; }
   }
   return(highestIndex);
}

highestZ = getHighestZindex();

// Constructor
function Note()
{
   /* attribute created:
      note
      toolbar
      add
      delete
      editField

    */
    var self = this;

    // Whole note element
    var note = document.createElement('div');
    note.className = 'note-box';
    //note.addEventListener('mousedown', function(e) { return self.onMouseDown(e) }, false);
    note.addEventListener('click', function() { return self.onNoteClick() }, false);
    this.note = note;

    // toolbar
    var toolbar = document.createElement('div');
    toolbar.className = 'note-toolbar';
    toolbar.addEventListener('mousedown', function(e) { return self.onMouseDown(e) }, false);
    note.appendChild(toolbar);
    this.toolbar = toolbar;

    // toolbar: new note
    var newNoteButton = document.createElement('a');
    newNoteButton.className = "left";
    newNoteButton.innerHTML = "&plus;"
    newNoteButton.addEventListener('click', function(e) { chrome.extension.sendRequest({command:"Create"}); }, false);
    this.newNoteButton = newNoteButton;
    toolbar.appendChild(newNoteButton);

    // toolbar: delete
    var deleteButton = document.createElement('a');
    deleteButton.className = "right";
    deleteButton.innerHTML = "&times;";
    deleteButton.addEventListener('click', function(e) {return self.close(e)}, false);
    this.deleteButton = deleteButton;
    toolbar.appendChild(deleteButton);

    // toolbar: add image
    var imageButton = document.createElement('a');
    imageButton.className = "left";
    var imageIcon = document.createElement('i');
    imageIcon.className = "fa fa-picture-o";
    imageIcon.setAttribute("aira-hidden", "true");
    imageButton.appendChild(imageIcon);
    imageButton.addEventListener('click', function(e) {  } );
    this.imageButton = imageButton;
    toolbar.appendChild(imageButton);

    // toolbar: download
    var downloadButton = document.createElement('a');
    downloadButton.className = "left";
    var downloadIcon = document.createElement('i');
    downloadIcon.className = "fa fa-download";
    downloadIcon.setAttribute("aira-hidden", "true");
    downloadButton.appendChild(downloadIcon);
    downloadButton.addEventListener('click', function(e) { self.download(); } );
    this.downloadButton = downloadButton;
    toolbar.appendChild(downloadButton);


    // text area
    var edit = document.createElement('div');
    edit.className = 'edit';
    edit.setAttribute('contenteditable', true);
    edit.addEventListener('keyup', function() { return self.onKeyUp() }, false); // save later if no continue input
    note.appendChild(edit);
    this.editField = edit;
    //console.log("e width: " + edit.style.height + " height: " + edit.style.width );
    editH = edit.style.height;
    editW = edit.style.width;

    /*
    setInterval(function () {
      var curWidth = self.note.style.width - self.editField.style.marginLeft - self.editField.style.marginRight;
      var curHeight = self.note.style.height - self.toolbar.style.height - 10 - self.editField.style.marginTop - self.editField.style.marginBottom;
      console.log(curWidth + " " + curHeight);
      if (self.editField.style.height != curHeight || self.editField.style.width != curWidth) {
        self.editField.style.height = curHeight;
        self.editField.style.width = curWidth
      }

    }, 1000);
    */
    document.body.appendChild(note);
    return this;
}


Note.prototype = {
   /*
    Create attribute:
    _id

    */
    get id()
    {
        if (!("_id" in this))
            this._id = 0;
        return this._id;
    },

    set id(x)
    {
        this._id = x;
    },

    get text()
    {
        return this.editField.innerHTML;
    },

    set text(x)
    {
        this.editField.innerHTML = x;
    },

    get left()
    {
        return this.note.style.left;
    },

    set left(x)
    {
        this.note.style.left = x;
    },

    get top()
    {
        return this.note.style.top;
    },

    set top(x)
    {
        this.note.style.top = x;
    },

    get zIndex()
    {
        return this.note.style.zIndex;
    },

    set zIndex(x)
    {
        this.note.style.zIndex = x;
    },

    close: function(event)
    {
        this.cancelPendingSave();

        var note = this;
        chrome.extension.sendRequest(
          {command:"close",data:{id:note.id}},
          function(response){console.log(response.message+response.id);}
        );
       
        notes.splice(notes.indexOf(note.id), 1);
        chrome.extension.sendRequest({command:"updateCount",data:notes.length});

        document.body.removeChild(this.note);
    },

    download: function ()
    {
        var self = this;
        var pdf = new jsPDF();
        var source = self.editField;

        pdf.text(20, 20, "Note from note_" + this._id);
        pdf.text(20, 30, source.innerHTML);


        pdf.save("note" + this._id + ".pdf");
    },

    saveSoon: function()
    {
        this.cancelPendingSave();
        var self = this;
        this._saveTimer = setTimeout(function() { self.save() }, 200);
    },

    cancelPendingSave: function()
    {
        if (!("_saveTimer" in this))
            return;
        clearTimeout(this._saveTimer);
        delete this._saveTimer;
    },

    save: function()
    {
        this.cancelPendingSave();

        if ("dirty" in this) {
            delete this.dirty;
        }

        var note = this;
        chrome.extension.sendRequest({command:"save",
                                      data:{id:note.id, 
                                            text:note.text, 
                                            left:note.left, 
                                            top:note.top, 
                                            zindex:note.zIndex, 
                                            url:window.location.href}},
                                      function(response){console.log(response.message+response.id);});

    },

    saveAsNew: function()
    {
      var note = this;
      console.log(note.offsetHeight + ", width: " + note.offsetWidth);
      chrome.extension.sendRequest({command:"saveAsNew",
                                    data:{id:note.id, 
                                       text:note.text, 
                                       left:note.left, 
                                       top:note.top,
                                       zindex:note.zIndex, 
                                       url:window.location.href}},
                                    function(response){console.log(response.message+response.id);});

    },

    onMouseDown: function(e)
    {
        captured = this;

        clickedMouseButton = e.which; // 1: left; 2: middle; 3: right; -1: no click

        if (clickedMouseButton == 1) {
          // Record the position mouse clicked: relative to parent element(body)
          this.startX = e.clientX - this.note.offsetLeft;
          this.startY = e.clientY - this.note.offsetTop;
          this.zIndex = ++highestZ;
        }
        
        
        

        var self = this;
        if (!("mouseMoveHandler" in this)) {
            this.mouseMoveHandler = function(e) { return self.onMouseMove(e) }
            this.mouseUpHandler = function(e) { return self.onMouseUp(e) }
        }

        document.addEventListener('mousemove', this.mouseMoveHandler, true);
        document.addEventListener('mouseup', this.mouseUpHandler, true);

        return false;
    },

    onMouseMove: function(e)
    {
        if (this != captured)
            return true;

        if (clickedMouseButton == 1) {
          // Update position of current note
          this.left = e.clientX - this.startX + 'px';
          this.top = e.clientY - this.startY + 'px';
        } else if (clickedMouseButton == 2) {

        } else if (clickedMouseButton == 3) {
          moved = true;
        }
        
        return false;
    },

    onMouseUp: function(e)
    {
        document.removeEventListener('mousemove', this.mouseMoveHandler, true);
        document.removeEventListener('mouseup', this.mouseUpHandler, true);

        switch (clickedMouseButton){
          case 1:
            // save new note position to database
            this.save();
            break;
          case 2:
            break;
          case 3:
            console.log("create new notes");
            //if (moved) chrome.extension.sendRequest({command:"Create"});
            moved = false;
            break;
        }
        
        clickedMouseButton = -1;
        return false;
    },

    onNoteClick: function(e)
    {
        /*
        var self = this;
        var curWidth = self.note.offsetWidth - 10;
        var curHeight = self.note.offsetHeight - self.toolbar.offsetHeight - 20;
        console.log(curWidth + " " + curHeight);
        if (self.editField.offsetHeight != curHeight || self.editField.offsetWidth != curWidth) {
          
          self.editField.style.height = curHeight + "px";
          //console.log(self.editField.offsetHeight + " " + curHeight);
          self.editField.style.width = curWidth + "px";
        }*/


        this.editField.focus();
        getSelection().collapseToEnd();
    },

    onKeyUp: function()
    {
        this.dirty = true;
        this.saveSoon();
    },
}

function loadNotes(data)
{
   data = eval(data);
   for (var i = 0; i < data.length; ++i) {
      var row = data[i];
      if(notes.indexOf(row.id) == -1){
         var note = new Note();
         note.id = row.id;
         note.text = row.note;
         note.timestamp = row.timestamp;
         note.left = row.left;
         note.top = row.top;
         note.zIndex = row.zindex;
         if(note.zIndex == ''){
            note.zIndex = highestZ;
         }

         if (row.zindex > highestZ)
            highestZ = row['zindex'];
         notes[notes.length] = note.id;
      }
   }
}

function modifiedString(date)
{
    return  date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
}

function newNote(id)
{
   var note = new Note();
   note.id = id;
   // TODO: Create note according to mouse input or other input
   note.left = (window.pageXOffset + Math.round(Math.random() * (window.innerWidth - 150))) + 'px';
   note.top = (window.pageYOffset + Math.round(Math.random() * (window.innerHeight - 200))) + 'px';
   note.zIndex = ++highestZ;
   note.saveAsNew();
   notes[notes.length] = note.id;
   chrome.extension.sendRequest({command:"updateCount",data:notes.length});
   note.editField.focus();
}

function applyCSS(localstorage){
   var newline=unescape("%"+"0A");
   if(document.getElementById('noteboxcss') == null){
      var headID = document.getElementsByTagName("head")[0];         
      var cssNode = document.createElement('link');
      cssNode.setAttribute('id','noteboxcss');
      cssNode.media = 'screen';
      cssNode.type = 'text/css';
      cssNode.rel = 'stylesheet';
      headID.appendChild(cssNode);
   }
   css = '';
   

   // update settings according to user preference
   if(localstorage != undefined){
      if(localstorage['bg_color'] != undefined) // background color
        css += '.note-box {background-color: #'+localstorage['bg_color']+';}'+ newline;
      if(localstorage['t_color'] != undefined) // text color
        css += '.note-box {color: #'+localstorage['t_color']+';}'+ newline;
      if(localstorage['font'] != undefined) // font style
        css += '.note-box  .edit {font-family: '+localstorage['font']+';}' +newline;
      if(localstorage['font_size'] != undefined) // font size
        css += '.note-box  .edit {font-size: '+localstorage['font_size']+'px;}' +  newline;
      if (localstorage['bi_color'] != undefined) // tool bar icon color
        css += '.note-toolbar a {color: #' + localstorage['bi_color'] + ';}' + newline;
      if(localstorage['bb_color'] != undefined) // toolbar background color
        css += '.note-toolbar {color: #' + localstorage['bb_color'] + ';}' + newline;
   }
   //console.log(css);
   document.getElementById('noteboxcss').href = 'data:text/css,'+escape(css);

   /*
   console.log(localstorage['bg_color']);
   console.log(localstorage['t_color']);
   console.log(localstorage['font']);
   console.log(localstorage['font_size']);
   console.log(localstorage['bb_color']);
   console.log(localstorage['bi_color']);
   */
}

// ===================== Load settings helper functions ====================
// load note settings
function loadCSS(json){
   localstorage = eval(json);
   applyCSS(localstorage);
}

// load search settings
function loadSearchSettings(json){
   localstorage = eval(json);
   applySearchSettings(localstorage);
}

// load drawing settings
function loadDrawingSettings(json){
   localstorage = eval(json);
   applySearchSettings(localstorage);
}

// load gesture control settings
function loadGestureSettings(json){
   localstorage = eval(json);
   applyGestureSettings(localstorage);
}

// =========================================================================
// apply css from local storage
applyCSS();

// Background event listener
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.command == 'downloadallbyurl') {

      if ((typeof request.notesdata) != undefined) {
        var filename = "";
        var data = JSON.parse(request.notesdata); 
        var pdf = new jsPDF();
        var startX = 20;
        var startY = 20;
        
        for (var i = 0; i < data.length; ++i) {
          var row = data[i];
          pdf.text(startX, startY, "Note from note_" + row._id);
          pdf.text(startX, startY+10, row.note);
          startY += 20;
          filename += row.id;
        }


        pdf.save('note_' + filename + ".pdf");
  
        //console.log(notesdata);
      
      
    }
  }
});


// =========================================================================
// drawing function controlled by mode
var Line = function(x1,y1,x2,y2){
      this.x1= x1;
      this.y1= y1;
      this.x2= x2;
      this.y2= y2;
};


// list array store example, store according to current url
var strokeListList = [];
strokeListList.push(new Line(15, 15, 15, 15));
//var storage = chrome.storage.local();
// storage.set(url, stroke points)
//chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
    //var url = tabs[0].url;
    var url = document.URL;
    var strokes = JSON.stringify(strokeListList);
    var stroke = {url };
    stroke[url] = strokes;
    //console.log(stroke);
    chrome.storage.local.set(stroke, function () {
      console.log('saved strokes');
    });                      
//});

//chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
//    var url = tabs[0].url;
  chrome.storage.local.get(null, function (result) {
    //console.log(result);
  });
//});


