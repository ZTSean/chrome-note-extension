var rmouseDown=false, moved=false
var move=false;
var pi =3.14159
var canvas;
var penColor="black", penWidth=3
var ctx;
var startDrawing = false, showMenu = false;
var gestureStr=""
var point1 = vec2.create();
var point2 = vec2.create();


function createCanvas(){   
    // console.log("create canvas");
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
function draw(x,y){
    ctx.beginPath();
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.moveTo(point1[0],point1[1]);
    ctx.lineTo(point2[0],point2[1]);
    ctx.stroke();
    point1 = vec2.copy(point1,point2);
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
document.onmousedown = function(event){
    if(event.which == 3){
        rmouseDown = true;
        moved = false;
        createCanvas();
        document.body.appendChild(canvas);
        ctx = document.getElementById('Canvas').getContext('2d');
    }
};

document.onmousemove = function(event){
    showMenu = false;
    getMousePos(event);
    if (rmouseDown) {
        // console.log("moved"+ moved);
        moved = true;
        if(!startDrawing){
            startDrawing = true;
            point1[0] = mouseX;
            point1[1] = mouseY;
        }
        else{
            // console.log("point1[0:"+point1[0+"point2[0]:"+point2[0]+"point1[1]"+point1[1+"point2[1]"+point2[1]);
            point2[0] = mouseX;
            point2[1] = mouseY;
            buildGestureString();
            // console.log(gestureStr);
            draw(point2[0],point2[1]);
        }
    }
};

document.onmouseup = function(event){
    if(event.which == 3){
        if(!moved){
            // console.log("did not move");
            showMenu = true;
        }
        else{
            //dragged, so process and execute control
            // console.log("gestureStr");
            // console.log(gestureStr);
            processGesture();
        }
        gestureStr = "";
        rmouseDown = false;
        moved = false;
        startDrawing = false;
        ctx = document.getElementById("Canvas");
        if(ctx) ctx.parentNode.removeChild(ctx);
        point1[0],point2[0],point1[1],point2[1] = 0;
    }
};

document.oncontextmenu = function()
{
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
};

function processGesture(){
    if(gestureStr.match(RIGHT)){
        console.log("matched RIGHT");
        executeControl("RIGHT");
    }
    else if(gestureStr.match(LEFT)){
        console.log("matched LEFT");
        executeControl("LEFT");
    }
    else if(gestureStr.match(UP)){
        console.log("matched UP");
        executeControl("UP");   
    }
    else if(gestureStr.match(DOWN)){
        console.log("matched DOWN");
        executeControl("DOWN");
    }  
    else if(gestureStr.match(RIGHTARROW)){
        console.log("matched RIGHTARROW");
        executeControl("RIGHTARROW");
    }
    else if(gestureStr.match(LEFTARROW)){
        console.log("matched LEFTARROW");
        executeControl("LEFTARROW");
    }
    else if(gestureStr.match(UPARROW)){
        console.log("matched UPARROW");
        executeControl("UPARROW");
    }
    else if(gestureStr.match(DOWNARROW)){
        console.log("matched DOWNARROW");
        executeControl("DOWNARROW");
    }
    else if(gestureStr.match(CIRCLE)){
        console.log("matched CIRCLE");
        executeControl("CIRCLE");
    }
    else if(gestureStr.match(TRIANGLE)){
        console.log("matched TRIANGLE");
        executeControl("TRIANGLE");
    }
    else if(gestureStr.match(QMARK)){
        console.log("matched QMARK");
        executeControl("QMARK");
    }
    else if(gestureStr.match(STAR)){
        console.log("matched STAR");
        executeControl("STAR");
    }
    else{
        console.log("no match");
    }
}

function executeControl(match){
    var control = gestControlHT[match];
    console.log("control: "+control); 
    Controls[control]();
}

function buildGestureString(){
    //build gesture string
    if(point1[0]<point2[0]){ //East
        if (point1[1]<point2[1]){
            gestureStr+=SOUTH_EAST;
        } 
        else if (point1[1] > point2[1]){
            gestureStr+=NORTH_EAST;
        } 
        else if (point1[1] == point2[1]){
            gestureStr+=EAST;
        }
    } 
    else if (point1[0]>point2[0]){// West
        if (point1[1] < point2[1]){
            gestureStr+=SOUTH_WEST;
        }
        else if (point1[1] > point2[1]){
            gestureStr+=NORTH_WEST;
        } 
        else {
            gestureStr+=WEST;
        }
    } 
    else if (point1[0]=point2[0]){
        if (point1[1] > point2[1]) {// North
            gestureStr+=NORTH;
        } else if (point1[1] < point2[1]){// South
            gestureStr+=SOUTH;
        }
    }
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

var CIRCLE = new RegExp(START+NORTHISH+NORTH_EASTISH+EASTISH+SOUTH_EASTISH+SOUTHISH+SOUTH_WESTISH+WESTISH+NORTH_WESTISH+NORTHISH+END);
var TRIANGLE = new RegExp(START+SOUTH_WESTISH+EASTISH+NORTH_WESTISH+END);
var STAR = new RegExp(START+EASTISH+SOUTH_WESTISH+NORTH_EASTISH+SOUTH_EASTISH+NORTH_WESTISH+END)
var QMARK = new RegExp(START+NORTHISH+EASTISH+SOUTHISH+SOUTH_WESTISH+SOUTHISH+END)

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
gestControlHT["TRIANGLE"] = "add_bookmark";


// ================ Zixiao Wang Implementation for option settings ===============
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
    'add_bookmark'
];

// load settings from options page
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.command == 'ApplyGestureSettings') {
        for (var i = 0; i < gcOptions.length; i++) {
            if (localStorage[gcOptions[i]] != undefined) {
                // load settings from local storage
                gestureControl[gcOptions[i]] = localStorage[gcOptions[i]];
            }
        }
        console.log("gesture control settins loaded.");
    } else if (request.command == 'ResetGestureSettings') {
        for (var i = 0; i < gcOptions.length; i++) {
            if (localStorage[gcOptions[i]] != undefined) {
                // load settings from local storage
                gestureControl[gcOptions[i]] = gc_defaults[i];
            }
        }
        console.log("gesture control settins reset.");
    }
  }
);
// ======================================================================

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
     "add_bookmark": function(){
        chrome.extension.sendMessage({msg: "add_bookmark"});
        console.log("add_bookmark command");
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

}

