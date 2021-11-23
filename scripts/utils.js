export let vectorDistance = (point1,point2) => {
var disX = point1[0] - point2[0];
var disY = point1[1] - point2[1];

return Math.hypot(disX,disY);
}

export let getDisplacement = (length, angle) => {          //! NEED TO RECHECK THIS FUNCTION, CURRENTLY USED IN TRAVEL FUNCTION @PUPPET
var dx = Math.cos(angle)*length;
var dy = Math.sin(angle)*length;

return [dx,dy];
}

export let radOf = (angle)=> {
return angle*(Math.PI/180);
}

export let angleOf = (rad) => {
return rad*(180/Math.PI);
}

export let vectorDirection = (center,point) => {
var x = point[0] - center[0];
var y = point[1] - center[1];

var ang = angleOf(Math.atan2(x,y));

if(ang<0) { ang = Math.abs(ang) + 90; }
else {
    ang = 90-ang;
    ang = ang < 0 ? 360+ang: ang;
} return ang;
}

export let clamp = function(val, min, max) {
return Math.min(Math.max(val, min), max);
};

export var randomProperty = function (obj) {
var keys = Object.keys(obj);
return obj[keys[ keys.length * Math.random() << 0]];
};