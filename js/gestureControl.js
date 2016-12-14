var rmouseDown=false, moved=false
var move=false;
var annoMove = false;
var canvas;
var ctx;
var startDrawing = false, showMenu = false;
var gestureStr=""
var point1 = vec2.create();
var point2 = vec2.create();
var s1Gesture = [];
var controlMode = true;
var annoMode = false;
var annoMouseDown = false;
var annoStroke=[];
var annonStartDrawing = false;
var annonGestureStr = "";
var annonStrokeList = [];


function createCanvas(){   
    console.log("create canvas");
    canvas = document.createElement('canvas');
    canvas.id = "Canvas"
    canvas.style.width=document.body.scrollWidth;
    canvas.style.height=document.body.scrollHeight;
    canvas.width=window.document.body.scrollWidth;
    canvas.height=window.document.body.scrollHeight;     
    canvas.style.left="0px";
    canvas.style.top="0px";
    canvas.style.overflow = 'visible';
    canvas.style.position = 'absolute';
    canvas.style.zIndex="10000";
    canvas.style.backgroundColor = 'rgba(158, 167, 184, 0.2)';
}
function draw(){
    ctx.beginPath();
    // ctx.strokeStyle = penColor;
    // ctx.lineWidth = penWidth;
    ctx.moveTo(point1[0],point1[1]);
    ctx.lineTo(point2[0],point2[1]);
    ctx.stroke();
    point1 = vec2.copy(point1,point2);
}

function drawAnno(){
    // loadAnno();
    // console.log(annonStrokeList);
    for(var i = 0;i < annonStrokeList.length;i++){
        if(annonStrokeList[i][0] == "TRIANGLE"){
            var center = annonStrokeList[i][1];
            var left = annonStrokeList[i][2];
            var right = annonStrokeList[i][3];

            ctx.beginPath();
            ctx.moveTo(center[0],center[1]);
            ctx.lineTo(left[0],left[1]);
            ctx.lineTo(right[0],right[1]);
            ctx.closePath();
            ctx.stroke();
        }
        else if(annonStrokeList[i][0] == "RECTANGLE"){
           var bb = annonStrokeList[i][1];
            ctx.strokeRect(bb[0],bb[1],bb[2]-bb[0],bb[3]-bb[1]);
        }
        else if(annonStrokeList[i][0] == "CIRCLE"){
            var centroid = annonStrokeList[i][1];
            var radius = annonStrokeList[i][2];
            ctx.beginPath();
            ctx.arc(centroid[0],centroid[1],radius, 0, 2*Math.PI);
            ctx.stroke();
        }
        else if(annonStrokeList[i][0] == "LINE"){
            ctx.beginPath();
            ctx.moveTo(annonStrokeList[i][1][0],annonStrokeList[i][1][1]);
            ctx.lineTo(annonStrokeList[i][2][0],annonStrokeList[i][2][1]);
            ctx.stroke();
        }
        else if(annonStrokeList[i][0] == "ARROW"){
            var tip = annonStrokeList[i][1];
            var left = annonStrokeList[i][2];
            var right = annonStrokeList[i][3];
            ctx.beginPath();
            ctx.moveTo(left[0],left[1]);
            ctx.lineTo(tip[0],tip[1]);
            ctx.lineTo(right[0],right[1]);
            ctx.stroke();
        }
        else if(annonStrokeList[i][0] == "ELSE"){
            for(var n = 0; n<annonStrokeList[i][1].length -1;n++){
                ctx.beginPath();
                ctx.moveTo(annonStrokeList[i][1][n][0],annonStrokeList[i][1][n][1]);
                ctx.lineTo(annonStrokeList[i][1][n+1][0],annonStrokeList[i][1][n+1][1]);
                ctx.stroke();
            }
            
        }
    }
}

// called when direct to a new url
function saveNewAnno() {
    console.log("save new anno");
        chrome.extension.sendMessage ({ 
            command: "saveNewAnno", 
            data: JSON.stringify(annonStrokeList), 
            url: document.URL
        });   
}

// stay in the same url
function saveAnno() {
    console.log("save anno");
        chrome.extension.sendMessage ({ 
            command: "saveAnno", 
            data: JSON.stringify(annonStrokeList), 
            url: document.URL
        });   
}

// delete all strokes according to url
function deleteAnno() {
        chrome.extension.sendMessage ({ 
            command: "clearAnno", 
            url: document.url
        });
    annonStrokeList = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function loadAnno(data)
{
    data = eval(data);
    // although will always be one row
    for (var i = 0; i < data.length; ++i) {
        var row = data[i];
        annonStrokeList = JSON.parse(row.annotations);
    }
        console.log("loadanno");
        console.log(annonStrokeList);
}

function getMousePos(e) {
    if (!e)
        var e = event;

    if (e.offsetX) {
        mouseX = e.offsetX;
        mouseY = e.offsetY;
    }
    else if (e.layerX) {
        mouseX = e.layerX;
        mouseY = e.layerY;
    }
}

function switchMode(){
    if(annoMode == true){
        ctx = document.getElementById("Canvas");
        if(ctx) ctx.parentNode.removeChild(ctx);
        createCanvas();
        document.body.appendChild(canvas);
        ctx = document.getElementById('Canvas').getContext('2d');
        drawAnno();
    }
    if(annoMode == false){
        ctx = document.getElementById("Canvas");
        if(ctx) ctx.parentNode.removeChild(ctx);
    }
}
switchMode();
document.onmousedown = function(event){
    if(event.which == 3 && controlMode){
        rmouseDown = true;
        moved = false;
        createCanvas();
        document.body.appendChild(canvas);
        ctx = document.getElementById('Canvas').getContext('2d');
    }
    if(annoMode){
        annoMouseDown = true;
    }
};

document.onmousemove = function(event){
    getMousePos(event);
   if(controlMode == true){
        showMenu = false;
        if (rmouseDown) {
            // console.log("moved"+ moved);
            moved = true;
            if(!startDrawing){
                startDrawing = true;
                point1[0] = mouseX;
                point1[1] = mouseY;
                s1Gesture.push(vec2.fromValues(mouseX,mouseY));
                // console.log(s1Gesture);
            }
            else{
                point2[0] = mouseX;
                point2[1] = mouseY;
                // console.log(point2[0]+","+point2[1]);
                gestureStr += buildGestureString();
                // console.log(gestureStr);
                
                s1Gesture.push(vec2.fromValues(mouseX,mouseY));
                // console.log(s1Gesture);
                // console.log(gestureStr);
                draw();
            }
        }
   }
   else{
       if(annoMouseDown){
           annoMove = true;
           if(!annonStartDrawing){
                annonStartDrawing = true;
                point1[0] = mouseX;
                point1[1] = mouseY;
                annoStroke.push(vec2.fromValues(mouseX,mouseY));
                // console.log(annoStroke);
            }
            else{
                point2[0] = mouseX;
                point2[1] = mouseY;
                annonGestureStr += buildGestureString();
                annoStroke.push(vec2.fromValues(mouseX,mouseY));
                draw();
                
            }
       }
    }
};

document.onmouseup = function(event){
    if(controlMode == true){
            if(event.which == 3){
            if(!moved){
                // console.log("did not move");
                showMenu = true;
            }
            else{
                //dragged, so process and execute control
                processGesture(gestureStr,s1Gesture);
            }
            s1Gesture = [];
            gestureStr = "";
            rmouseDown = false;
            moved = false;
            startDrawing = false;
            ctx = document.getElementById("Canvas");
            if(ctx) ctx.parentNode.removeChild(ctx);
            point1[0],point2[0],point1[1],point2[1] = 0;
        }
    }
    else if(annoMode == true && annoMove == true){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        processGesture(annonGestureStr,annoStroke);
        annoStroke = [];
        annonGestureStr = "";
        annoMouseDown = false;
        annonStartDrawing = false;
        point1[0],point2[0],point1[1],point2[1] = 0;
        annoMove = false;
        drawAnno();

    }
};

document.oncontextmenu = function()
{
    if(controlMode){
            if(!showMenu)
            return false;
        else{
            console.log("show menu");
            ctx = document.getElementById("Canvas");
            if(ctx)
                ctx.parentNode.removeChild(ctx);
            rmouseDown = false;
            showMenu = false;
            return true;
        }
    }
    return true;
};

function processGesture(gestureString,s1path){
    // console.log("gestureString");
    // console.log(gestureString);
     var matchIndex = recognizer(s1path);
    console.log("matchIndex"+matchIndex);
    var matchGesture = "NO MATCH";
    if(gestureString.match(RIGHT)){
        console.log("matched RIGHT");
        matchGesture = "RIGHT";
    }
    else if(gestureString.match(LEFT)){
        console.log("matched LEFT");
        matchGesture = "LEFT";
    }

    else if(gestureString.match(UP)){
        console.log("matched UP");
        matchGesture = "UP";   
    }
    else if(gestureString.match(STAR) && matchIndex == 3){
        console.log("matched STAR");
        matchGesture = "STAR";
    }
    else if(gestureString.match(RECTANGLE) && matchIndex == 1){
        console.log("matched RECTANGLE");
        matchGesture = "RECTANGLE";
    }
    else if(gestureString.match(RIGHTARROW)){
        console.log("matched RIGHTARROW");
        matchGesture = "RIGHTARROW";
    }
    else if(gestureString.match(LEFTARROW)){
        console.log("matched LEFTARROW");
        matchGesture = "LEFTARROW";
    }
    else if(gestureString.match(UPARROW)){
        console.log("matched UPARROW");
        matchGesture = "UPARROW";
    }
    else if(gestureString.match(DOWNARROW)){
        console.log("matched DOWNARROW");
        matchGesture = "DOWNARROW";
    }
    else if(matchIndex == 0){
        console.log("matched TRIANGLE");
        matchGesture = "TRIANGLE";
    }
    else if(matchIndex == 2){
        console.log("matched CIRCLE");
        matchGesture = "CIRCLE";
    }
    else{
        console.log("no match");
    }

    if(matchGesture != "NO MATCH"){
        if(controlMode){
            executeControl(matchGesture);
        }
    }
    if(annoMode){
            beautify(matchGesture);
        }
}

function executeControl(match){
    var control = gestControlHT[match];
    console.log("control: "+control); 
    Controls[control]();
}

function beautify(matchGesture){
    console.log(matchGesture);
    if(matchGesture == "TRIANGLE"){
        // console.log(annoStroke);
        beautifyTri(annoStroke);
    }
    else if(matchGesture == "RECTANGLE"){
        // console.log(annoStroke);
        beautifyRect(annoStroke);
    }
    else if(matchGesture == "CIRCLE"){
        // console.log(annoStroke);
        beautifyCircle(annoStroke);
    }
    else if(matchGesture == "LEFT" ||matchGesture == "RIGHT"||matchGesture == "UP"||matchGesture == "DOWN"){
        console.log("matchGesture"+matchGesture);
        beautifyLine(annoStroke);
    }
     else if(matchGesture == "LEFTARROW" ||matchGesture == "RIGHTARROW"||matchGesture == "UPARROW"||matchGesture == "DOWNARROW"){
        beautifyArrow(annoStroke,matchGesture);
    }
    else{
        console.log("everything else");
        var stroke = ["ELSE",annoStroke];
        if(annonStrokeList.length == 0){
            annonStrokeList.push(stroke);
            saveNewAnno();
        }
        else{
            annonStrokeList.push(stroke);
            saveAnno();
        }
    }
}
function beautifyTri(annoStroke){
    var bb = boundingBox(annoStroke);
    console.log("bb"+bb);
    var center = vec2.fromValues(((bb[2]-bb[0])/2)+bb[0],bb[1]);
    console.log("center"+center);
    var left = vec2.fromValues(bb[0],bb[3]);
    console.log("left"+left);
    var right = vec2.fromValues(bb[2],bb[3]);
    console.log("right"+right);
    var stroke = ["TRIANGLE",center,left,right];
    // console.log(stroke);
    if(annonStrokeList.length == 0){
        annonStrokeList.push(stroke);
        saveNewAnno();
    }
    else{
        annonStrokeList.push(stroke);
        saveAnno();
    }
}

function beautifyRect(annoStroke){
    var bb = boundingBox(annoStroke);
    console.log("bb"+bb);
    var stroke = ["RECTANGLE",bb];
    if(annonStrokeList.length == 0){
        annonStrokeList.push(stroke);
        saveNewAnno();
    }
    else{
        annonStrokeList.push(stroke);
        saveAnno();
    }
}

function beautifyCircle(annoStroke){
    var bb = boundingBox(annoStroke);
    var centroid = Centroid(annoStroke);
    var radius = (bb[2]-bb[0]+bb[3]-bb[1])/4;
    console.log("bb"+bb);
    var stroke = ["CIRCLE",centroid,radius];
    if(annonStrokeList.length == 0){
        annonStrokeList.push(stroke);
        saveNewAnno();
    }
    else{
        annonStrokeList.push(stroke);
        saveAnno();
    }
}

function beautifyLine(annoStroke){
    var first = annoStroke[0];
    var last = annoStroke[annoStroke.length-1];
    var stroke = ["LINE", first,last];
    console.log(annonStrokeList);

    if(annonStrokeList.length ==0){
        annonStrokeList.push(stroke);
        saveNewAnno();
    }
    else{
        annonStrokeList.push(stroke);
        saveAnno();
    }
}

function beautifyArrow(annoStroke,matchGesture){
    var bb = boundingBox(annoStroke);
    var stroke = [];
    var left,right,tip;
    if(matchGesture == "RIGHTARROW"){
        tip = vec2.fromValues(bb[2],(bb[1]+(bb[3]-bb[1])/2));
        left = vec2.fromValues(bb[0],bb[1]);
        right = vec2.fromValues(bb[0],bb[3]);
        stroke = ["ARROW",tip,left,right];
    }
    if(matchGesture == "LEFTARROW"){
        tip = vec2.fromValues(bb[0],(bb[1]+(bb[3]-bb[1])/2));
        left = vec2.fromValues(bb[2],bb[1]);
        right = vec2.fromValues(bb[2],bb[3]);
        stroke = ["ARROW",tip,left,right];
    }
    if(matchGesture == "UPARROW"){
        tip = vec2.fromValues((bb[0]+(bb[2]-bb[0])/2),bb[1]);
        left = vec2.fromValues(bb[0],bb[3]);
        right = vec2.fromValues(bb[2],bb[3]);
        stroke = ["ARROW",tip,left,right];
    }
    if(matchGesture == "DOWNARROW"){
        tip = vec2.fromValues((bb[0]+(bb[2]-bb[0])/2),bb[3]);
        left = vec2.fromValues(bb[0],bb[1]);
        right = vec2.fromValues(bb[2],bb[1]);
        stroke = ["ARROW",tip,left,right];
    }

    if(annonStrokeList.length == 0){
        annonStrokeList.push(stroke);
        saveNewAnno();
    }
    else{
        annonStrokeList.push(stroke);
        saveAnno();
    }
    // annonStrokeList.push(stroke);
}

function buildGestureString(){
    var gestureString="";
    //build gesture string
    if(point1[0]<point2[0]){ //East
        if (point1[1]<point2[1]){
            gestureString+=SOUTH_EAST;
        } 
        else if (point1[1] > point2[1]){
            gestureString+=NORTH_EAST;
        } 
        else if (point1[1] == point2[1]){
            gestureString+=EAST;
        }
    } 
    else if (point1[0]>point2[0]){// West
        if (point1[1] < point2[1]){
            gestureString+=SOUTH_WEST;
        }
        else if (point1[1] > point2[1]){
            gestureString+=NORTH_WEST;
        } 
        else {
            gestureString+=WEST;
        }
    } 
    else if (point1[0]=point2[0]){
        if (point1[1] > point2[1]) {// North
            gestureString+=NORTH;
        } else if (point1[1] < point2[1]){// South
            gestureString+=SOUTH;
        }
    }
    return gestureString;
}

function loadOptions(name){}

document.addEventListener('DOMContentLoaded', loadOptions);

//helper

//directions
const NORTH = "N";
const EAST = "E";
const SOUTH = "S";
const WEST = "W";
const NORTH_EAST = "A";
const SOUTH_EAST = "B";
const SOUTH_WEST = "C";
const NORTH_WEST = "D";

//~ish
const NORTHISH = "[AND]+";
const EASTISH = "[AEB]+";
const SOUTHISH = "[BSC]+";
const WESTISH = "[DWC]+";
const SOUTH_WESTISH = "[SCW]+";
const SOUTH_EASTISH = "[SEB]+";
const NORTH_WESTISH = "[NDW]+";
const NORTH_EASTISH = "[NAE]+";

const START = "^.{0,2}";
const END = ".{0,2}$";

//template
var RIGHT =  new RegExp(START+EASTISH+END);
var LEFT = new RegExp(START+WESTISH+END);
var UP = new RegExp(START+NORTHISH+END);
var DOWN = new RegExp(START+SOUTHISH+END);

var RIGHTARROW = new RegExp(START+SOUTH_EASTISH+".{0,2}"+SOUTH_WESTISH+END);
var LEFTARROW = new RegExp(START+SOUTH_WESTISH+".{0,2}"+SOUTH_EASTISH+END);
var UPARROW = new RegExp(START+NORTH_EASTISH+SOUTH_EASTISH+END);
var DOWNARROW = new RegExp(START+SOUTH_EASTISH+NORTH_EASTISH+END);

var RECTANGLE = new RegExp(START+SOUTHISH+EASTISH+NORTHISH+WESTISH+END);
var TRIANGLE = new RegExp(START+SOUTH_WESTISH+EASTISH+NORTH_WESTISH+END);
var STAR = new RegExp(START+NORTH_EASTISH+SOUTH_EASTISH+NORTH_WESTISH+EASTISH+SOUTH_WESTISH+END);
// var QMARK = new RegExp(START+NORTHISH+EASTISH+SOUTHISH+SOUTH_WESTISH+SOUTHISH+END);

//hast table for gesture control
var gestControlHT = {};
gestControlHT["RIGHT"] = "open_new_window";
gestControlHT["LEFT"] = "close_window";
gestControlHT["UP"] = "pin_tab";
gestControlHT["DOWN"] = "close_tab";
gestControlHT["RIGHTARROW"] = "next_tab";
gestControlHT["LEFTARROW"] = "prev_tab";
gestControlHT["UPARROW"] = "scroll_top";
gestControlHT["DOWNARROW"] = "scroll_bottom";
gestControlHT["CIRCLE"] = "reload_page";
gestControlHT["TRIANGLE"] = "open_new_window";
gestControlHT["RECTANGLE"] = "create_note";
gestControlHT["STAR"] = "open_new_window";

var Controls = {
    "forward": function(){
        window.history.forward();
        console.log("forward command");
    },
    "back": function(){
        window.history.back();
        console.log("back command");
    },
     "open_new_tab": function(){
        chrome.extension.sendMessage({msg: "open_new_tab"});
        console.log("open_new_tab command");
    },
     "close_tab": function(){
        chrome.extension.sendMessage({msg: "close_tab"});
        console.log("close_tab command");
    },
     "next_tab": function(){
        chrome.extension.sendMessage({msg: "next_tab"});
        console.log("next_tab command");
    },
     "prev_tab": function(){
        chrome.extension.sendMessage({msg: "prev_tab"});
        console.log("prev_tab command");
    },
     "scroll_top": function(){
        window.scrollTo(0,0);
        console.log("scroll_top command");
    },
     "scroll_bottom": function(){
        window.scrollTo(0,document.body.scrollHeight);
        console.log("scroll_bottom command");
    },
     "reload_page": function(){
        window.location.reload();
        console.log("reload_page command");
    },
    "open_new_window": function(){
        chrome.extension.sendMessage({msg: "open_new_window"});
        console.log("open_new_window command");
    },
    "close_window": function(){
        chrome.extension.sendMessage({msg: "close_window"});
        console.log("close_window command");
    },
    "pin_tab":function(){
        chrome.extension.sendMessage({msg: "pin_tab"});
        console.log("pin_tab command");
    },
    "create_note":function(){
        chrome.extension.sendRequest({command: "Create"});
        console.log("create_note command");
    },
    "hide_notes":function(){
        //chrome.extension.sendMessage({msg: "hide_notes"});
        var code = "hideAllNotes()";
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.executeScript(tabs[0].id, {code: code});
        });
        console.log("hide_notes command");
    },
    "show_notes":function(){
        //chrome.extension.sendMessage({msg: "show_notes"});
        var code = "showAllNotes()";
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.executeScript(tabs[0].id, {code: code});
        });
        console.log("show_notes command");
    },
    "download_notes":function(){
        chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
            var URL = tabs[0].url;
            chrome.runtime.sendMessage ( {command: "DownloadAllByUrl", url: URL} );
        });
        console.log("download_notes command");
    },
    "delete_notes":function(){
        chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
            var URL = tabs[0].url;
            chrome.runtime.sendMessage ( {command: "DeleteAllByUrl", url: URL} );
        });
        console.log("delete_notes command");
    },

}

//1$ dataset
//This is adpated from https://depts.washington.edu/aimgroup/proj/dollar/dollar.js
var UnistrokesShapes = [];
//triangle
this.UnistrokesShapes[0] = new Array(vec2.fromValues(137,139),vec2.fromValues(135,141),vec2.fromValues(133,144),vec2.fromValues(132,146),vec2.fromValues(130,149),vec2.fromValues(128,151),vec2.fromValues(126,155),vec2.fromValues(123,160),vec2.fromValues(120,166),vec2.fromValues(116,171),vec2.fromValues(112,177),vec2.fromValues(107,183),vec2.fromValues(102,188),vec2.fromValues(100,191),vec2.fromValues(95,195),vec2.fromValues(90,199),vec2.fromValues(86,203),vec2.fromValues(82,206),vec2.fromValues(80,209),vec2.fromValues(75,213),vec2.fromValues(73,213),vec2.fromValues(70,216),vec2.fromValues(67,219),vec2.fromValues(64,221),vec2.fromValues(61,223),vec2.fromValues(60,225),vec2.fromValues(62,226),vec2.fromValues(65,225),vec2.fromValues(67,226),vec2.fromValues(74,226),vec2.fromValues(77,227),vec2.fromValues(85,229),vec2.fromValues(91,230),vec2.fromValues(99,231),vec2.fromValues(108,232),vec2.fromValues(116,233),vec2.fromValues(125,233),vec2.fromValues(134,234),vec2.fromValues(145,233),vec2.fromValues(153,232),vec2.fromValues(160,233),vec2.fromValues(170,234),vec2.fromValues(177,235),vec2.fromValues(179,236),vec2.fromValues(186,237),vec2.fromValues(193,238),vec2.fromValues(198,239),vec2.fromValues(200,237),vec2.fromValues(202,239),vec2.fromValues(204,238),vec2.fromValues(206,234),vec2.fromValues(205,230),vec2.fromValues(202,222),vec2.fromValues(197,216),vec2.fromValues(192,207),vec2.fromValues(186,198),vec2.fromValues(179,189),vec2.fromValues(174,183),vec2.fromValues(170,178),vec2.fromValues(164,171),vec2.fromValues(161,168),vec2.fromValues(154,160),vec2.fromValues(148,155),vec2.fromValues(143,150),vec2.fromValues(138,148),vec2.fromValues(136,148));
//rectangle
this.UnistrokesShapes[1] = new Array(vec2.fromValues(78,149),vec2.fromValues(78,153),vec2.fromValues(78,157),vec2.fromValues(78,160),vec2.fromValues(79,162),vec2.fromValues(79,164),vec2.fromValues(79,167),vec2.fromValues(79,169),vec2.fromValues(79,173),vec2.fromValues(79,178),vec2.fromValues(79,183),vec2.fromValues(80,189),vec2.fromValues(80,193),vec2.fromValues(80,198),vec2.fromValues(80,202),vec2.fromValues(81,208),vec2.fromValues(81,210),vec2.fromValues(81,216),vec2.fromValues(82,222),vec2.fromValues(82,224),vec2.fromValues(82,227),vec2.fromValues(83,229),vec2.fromValues(83,231),vec2.fromValues(85,230),vec2.fromValues(88,232),vec2.fromValues(90,233),vec2.fromValues(92,232),vec2.fromValues(94,233),vec2.fromValues(99,232),vec2.fromValues(102,233),vec2.fromValues(106,233),vec2.fromValues(109,234),vec2.fromValues(117,235),vec2.fromValues(123,236),vec2.fromValues(126,236),vec2.fromValues(135,237),vec2.fromValues(142,238),vec2.fromValues(145,238),vec2.fromValues(152,238),vec2.fromValues(154,239),vec2.fromValues(165,238),vec2.fromValues(174,237),vec2.fromValues(179,236),vec2.fromValues(186,235),vec2.fromValues(191,235),vec2.fromValues(195,233),vec2.fromValues(197,233),vec2.fromValues(200,233),vec2.fromValues(201,235),vec2.fromValues(201,233),vec2.fromValues(199,231),vec2.fromValues(198,226),vec2.fromValues(198,220),vec2.fromValues(196,207),vec2.fromValues(195,195),vec2.fromValues(195,181),vec2.fromValues(195,173),vec2.fromValues(195,163),vec2.fromValues(194,155),vec2.fromValues(192,145),vec2.fromValues(192,143),vec2.fromValues(192,138),vec2.fromValues(191,135),vec2.fromValues(191,133),vec2.fromValues(191,130),vec2.fromValues(190,128),vec2.fromValues(188,129),vec2.fromValues(186,129),vec2.fromValues(181,132),vec2.fromValues(173,131),vec2.fromValues(162,131),vec2.fromValues(151,132),vec2.fromValues(149,132),vec2.fromValues(138,132),vec2.fromValues(136,132),vec2.fromValues(122,131),vec2.fromValues(120,131),vec2.fromValues(109,130),vec2.fromValues(107,130),vec2.fromValues(90,132),vec2.fromValues(81,133),vec2.fromValues(76,133));
// //circle
this.UnistrokesShapes[2] =new Array(vec2.fromValues(127,141),vec2.fromValues(124,140),vec2.fromValues(120,139),vec2.fromValues(118,139),vec2.fromValues(116,139),vec2.fromValues(111,140),vec2.fromValues(109,141),vec2.fromValues(104,144),vec2.fromValues(100,147),vec2.fromValues(96,152),vec2.fromValues(93,157),vec2.fromValues(90,163),vec2.fromValues(87,169),vec2.fromValues(85,175),vec2.fromValues(83,181),vec2.fromValues(82,190),vec2.fromValues(82,195),vec2.fromValues(83,200),vec2.fromValues(84,205),vec2.fromValues(88,213),vec2.fromValues(91,216),vec2.fromValues(96,219),vec2.fromValues(103,222),vec2.fromValues(108,224),vec2.fromValues(111,224),vec2.fromValues(120,224),vec2.fromValues(133,223),vec2.fromValues(142,222),vec2.fromValues(152,218),vec2.fromValues(160,214),vec2.fromValues(167,210),vec2.fromValues(173,204),vec2.fromValues(178,198),vec2.fromValues(179,196),vec2.fromValues(182,188),vec2.fromValues(182,177),vec2.fromValues(178,167),vec2.fromValues(170,150),vec2.fromValues(163,138),vec2.fromValues(152,130),vec2.fromValues(143,129),vec2.fromValues(140,131),vec2.fromValues(129,136),vec2.fromValues(126,139));
//star
this.UnistrokesShapes[3] =new Array(vec2.fromValues(75,250),vec2.fromValues(75,247),vec2.fromValues(77,244),vec2.fromValues(78,242),vec2.fromValues(79,239),vec2.fromValues(80,237),vec2.fromValues(82,234),vec2.fromValues(82,232),vec2.fromValues(84,229),vec2.fromValues(85,225),vec2.fromValues(87,222),vec2.fromValues(88,219),vec2.fromValues(89,216),vec2.fromValues(91,212),vec2.fromValues(92,208),vec2.fromValues(94,204),vec2.fromValues(95,201),vec2.fromValues(96,196),vec2.fromValues(97,194),vec2.fromValues(98,191),vec2.fromValues(100,185),vec2.fromValues(102,178),vec2.fromValues(104,173),vec2.fromValues(104,171),vec2.fromValues(105,164),vec2.fromValues(106,158),vec2.fromValues(107,156),vec2.fromValues(107,152),vec2.fromValues(108,145),vec2.fromValues(109,141),vec2.fromValues(110,139),vec2.fromValues(112,133),vec2.fromValues(113,131),vec2.fromValues(116,127),vec2.fromValues(117,125),vec2.fromValues(119,122),vec2.fromValues(121,121),vec2.fromValues(123,120),vec2.fromValues(125,122),vec2.fromValues(125,125),vec2.fromValues(127,130),vec2.fromValues(128,133),vec2.fromValues(131,143),vec2.fromValues(136,153),vec2.fromValues(140,163),vec2.fromValues(144,172),vec2.fromValues(145,175),vec2.fromValues(151,189),vec2.fromValues(156,201),vec2.fromValues(161,213),vec2.fromValues(166,225),vec2.fromValues(169,233),vec2.fromValues(171,236),vec2.fromValues(174,243),vec2.fromValues(177,247),vec2.fromValues(178,249),vec2.fromValues(179,251),vec2.fromValues(180,253),vec2.fromValues(180,255),vec2.fromValues(179,257),vec2.fromValues(177,257),vec2.fromValues(174,255),vec2.fromValues(169,250),vec2.fromValues(164,247),vec2.fromValues(160,245),vec2.fromValues(149,238),vec2.fromValues(138,230),vec2.fromValues(127,221),vec2.fromValues(124,220),vec2.fromValues(112,212),vec2.fromValues(110,210),vec2.fromValues(96,201),vec2.fromValues(84,195),vec2.fromValues(74,190),vec2.fromValues(64,182),vec2.fromValues(55,175),vec2.fromValues(51,172),vec2.fromValues(49,170),vec2.fromValues(51,169),vec2.fromValues(56,169),vec2.fromValues(66,169),vec2.fromValues(78,168),vec2.fromValues(92,166),vec2.fromValues(107,164),vec2.fromValues(123,161),vec2.fromValues(140,162),vec2.fromValues(156,162),vec2.fromValues(171,160),vec2.fromValues(173,160),vec2.fromValues(186,160),vec2.fromValues(195,160),vec2.fromValues(198,161),vec2.fromValues(203,163),vec2.fromValues(208,163),vec2.fromValues(206,164),vec2.fromValues(200,167),vec2.fromValues(187,172),vec2.fromValues(174,179),vec2.fromValues(172,181),vec2.fromValues(153,192),vec2.fromValues(137,201),vec2.fromValues(123,211),vec2.fromValues(112,220),vec2.fromValues(99,229),vec2.fromValues(90,237),vec2.fromValues(80,244),vec2.fromValues(73,250),vec2.fromValues(69,254),vec2.fromValues(69,252));

const N = 64;
//1st step:
function Resample(points, n)
{
	var I = PathLength(points) / (n - 1); // interval length
	var D = 0.0;
	var newpoints = new Array(points[0]);
	for (var i = 1; i < points.length; i++)
	{
		var d = vec2.distance(points[i - 1], points[i]);
		if ((D + d) >= I)
		{
			var qx = points[i - 1][0] + ((I - D) / d) * (points[i][0] - points[i - 1][0]);
			var qy = points[i - 1][1] + ((I - D) / d) * (points[i][1] - points[i - 1][1]);
			newpoints.push(vec2.fromValues(qx, qy));
			points.splice(i, 0, vec2.fromValues(qx, qy));
			D = 0.0;
		}
		else D += d;
	}
	if (newpoints.length == n - 1) // somtimes we fall a rounding-error short of adding the last point, so add it if so
		newpoints.push(vec2.clone(points[points.length-1]));
	return newpoints;
}
//2nd step rotate once based on the indicative angle
function rotateToZero(path){
    var centroid = Centroid(path);
    // console.log("centroid: "+centroid);
    var indiAngle = Math.atan2(centroid[1]-path[0][1],centroid[0]-path[0][0]); //angle from Xaxis to point
    // console.log(indiAngle);
    var pathNew = RotateBy(path,-indiAngle);
    // console.log(pathNew);
    return pathNew;
}
function RotateBy(path, angle){
    var centroid = Centroid(path);
    var pathNew = [];
    for(var i = 0;i < path.length; i++){
        pathNew[i] = vec2.create();
        var xDist = path[i][0] - centroid[0];
        var yDist = path[i][1] - centroid[1];
        pathNew[i][0] = centroid[0] + xDist * Math.cos(angle) - yDist * Math.sin(angle);
        pathNew[i][1] = centroid[1] + xDist * Math.sin(angle) + yDist * Math.cos(angle); 
    }
    return pathNew;
}

//3rd step
function scaleToSquare(path,size){
    // console.log(path);
    var B = boundingBox(path);
    // console.log(B);
    var Bwidth = B[2] - B[0];
    var Bheight = B[3]- B[1];
    var pathNew = [];
    for(var i = 0; i<path.length; i++){
        var newPoint = vec2.create();
        newPoint[0] = path[i][0]*(size/Bwidth);
        newPoint[1] = path[i][1] *(size/Bheight);
        pathNew.push(newPoint); 
    }
    return pathNew;
}

function boundingBox(path){
    var min = vec2.fromValues(+Infinity,+Infinity);
    var max = vec2.fromValues(-Infinity,-Infinity);
    for(var i = 0;i<path.length;i++){
        min = vec2.min(min,min,path[i]);
        max = vec2.max(max,max,path[i]);
    }
    return vec4.fromValues(min[0],min[1],max[0],max[1]);
}
function translateToOrigin(path){
    var centroid = Centroid(path);
    var pathNew = [];
    for(var i =0; i<path.length;i++){
        var newPoint = vec2.create();
        newPoint = vec2.subtract(newPoint,path[i],centroid);
        pathNew.push(newPoint);
    }
    return pathNew;
}

//4th step
function recognizer(path)
	{   var points = path;
		points = Resample(points, 64);
        points = rotateToZero(points);
		points = scaleToSquare(points, 250);
		points = translateToOrigin(points);

		var b = +Infinity;
		var u = -1;
		for (var i = 0; i < UnistrokesShapes.length; i++)
		{
			var d;
            var shape = UnistrokesShapes[i];
            shape = Resample(shape, 64);
            shape = rotateToZero(shape);
            shape = scaleToSquare(shape, 250);
            shape = translateToOrigin(shape);
				d = DistanceAtBestAngle(points, shape);
                // console.log("i"+i);
                // console.log("d"+d);
			if (d < b) {
				b = d;
				u = i; 
			}
		}
        if(u == -1){
            console.log("no match");
            return u;
        }
        return u;
	}

function DistanceAtBestAngle(path,T){
    var phi = 0.5*(-1.0+Math.sqrt(5));
    var thetaA = -45*Math.PI/180.0;
    var thetaB = 45*Math.PI/180.0;
    var thetaTri = 2*Math.PI/180.0;

    var x1 = phi * thetaA + (1-phi)* thetaB;
    var f1 = DistanceAtAngle(path, T, x1);
    var x2 = (1-phi) * thetaA + phi* thetaB;
    var f2 = DistanceAtAngle(path, T, x2);
    while(Math.abs(thetaB - thetaA) > thetaTri) {
        if (f1 < f2) {
			thetaB = x2;
			x2 = x1;
			f2 = f1;
			x1 = phi * thetaA + (1.0 - phi) * thetaB;
			f1 = DistanceAtAngle(path, T, x1);
		} else {
			thetaA = x1;
			x1 = x2;
			f1 = f2;
			x2 = (1.0 - phi) * thetaA + phi * thetaB;
			f2 = DistanceAtAngle(path, T, x2);
		}
    }
    // console.log("f1: "+f1+"f2: "+f2);
    return Math.min(f1,f2);

}
function DistanceAtAngle(path,T,theta){
    var pathNew = RotateBy(path,theta);
    return PathDistance(pathNew,T);
}

function PathDistance(A,B){
    var dist = 0;
    for(var i = 0;i<A.length;i++){
        dist += vec2.distance(A[i],B[i]);
    }
    return dist / A.length;
}

function PathLength(points)
{
	var d = 0.0;
	for (var i = 1; i < points.length; i++)
		d += vec2.distance(points[i - 1], points[i]);
	return d;
}


function Centroid (path){
    var out = vec2.create();
    for(var i =0;i<path.length;i++){
        out = vec2.add(out,out,path[i]);
    }
    out = vec2.scale(out,out,(1.00/path.length));
    return out;
}

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
    'TRIANGLE',
    'RECTANGLE',
    'STAR'
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
    'reload_page',
    'open_new_window',
    'create_note',
    'open_new_window'
];


// load gesture control settings
function loadGestureSettings(json){
   localstorage = eval(json);
   applyGestureSettings(localstorage);
}

var applyGestureSettings = function (localstorage) {
    for (var i = 0; i < gcOptions.length; i++) {
            if (localstorage[gcOptions[i]] != undefined) {
                // load settings from local storage
                gestControlHT[gcOptions[i]] = localstorage[gcOptions[i]];
            } else {
                // no change, set to default
                gestControlHT[gcOptions[i]] = gc_defaults[i];
            }
    }
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {

        if (request.gestureMode == true){
            console.log("received control request");
            controlMode = true;
            annoMode = false;
            switchMode();
        }
        else if (request.drawingMode == true){
            console.log("received draw request");
            controlMode = false;
            annoMode = true;
            switchMode();
        }
        else if (request.clearAllAnnotation == "clear"){
            console.log("clear request");
            deleteAnno();
        }
});

