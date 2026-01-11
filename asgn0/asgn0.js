// DrawTriangle.js (c) 2012 matsuda
var ctx;
var canvas;
var v1, v2;

function main() {  
  // Retrieve <canvas> element
  canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  ctx = canvas.getContext('2d');

  // Draw a blue rectangle
  // ctx.fillStyle = 'rgba(0, 0, 255, 1.0)'; // Set color to blue
  // ctx.fillRect(120, 10, 150, 150);        // Fill a rectangle with the color
  v1 = new Vector3([2.25,2.25,0])
  drawVector(v1, "red");
}

function drawVector(v, color) {
  ctx.strokeStyle = color;
  ctx.beginPath();

  var cx = 200;
  var cy = 200;

  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + v.elements[0] * 20, cy - v.elements[1] * 20);
  ctx.stroke();
}

function handleDrawEvent() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
   // v1 input
   let v1x = parseFloat(document.getElementById("v1x").value);
   let v1y = parseFloat(document.getElementById("v1y").value);
 
   // v2 input
   let v2x = parseFloat(document.getElementById("v2x").value);
   let v2y = parseFloat(document.getElementById("v2y").value);
 
   v1 = new Vector3([v1x, v1y, 0]);
   v2 = new Vector3([v2x, v2y, 0]);
 
   drawVector(v1, "red");
   drawVector(v2, "blue");
}

function handleDrawOperationEvent() {
  if (!v1 || !v2) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawVector(v1, "red");
  drawVector(v2, "blue");

  let op = document.getElementById("op").value;
  let s = parseFloat(document.getElementById("scalar").value);

  if (op === "add") {
    let v3 = new Vector3(v1.elements);
    v3.add(v2);
    drawVector(v3, "green");

  } else if (op === "sub") {
    let v3 = new Vector3(v1.elements);
    v3.sub(v2);
    drawVector(v3, "green");

  } else if (op === "mul") {
    let v3 = new Vector3(v1.elements);
    let v4 = new Vector3(v2.elements);
    v3.mul(s);
    v4.mul(s);
    drawVector(v3, "green");
    drawVector(v4, "green");

  } else if (op === "div") {
    let v3 = new Vector3(v1.elements);
    let v4 = new Vector3(v2.elements);
    v3.div(s);
    v4.div(s);
    drawVector(v3, "green");
    drawVector(v4, "green");

  } else if (op === "mag") {
    console.log("Magnitude v1:", v1.magnitude());
    console.log("Magnitude v2:", v2.magnitude());

  } else if (op === "norm") {
    let nv1 = new Vector3(v1.elements);
    let nv2 = new Vector3(v2.elements);
    nv1.normalize();
    nv2.normalize();

    drawVector(nv1, "green");
    drawVector(nv2, "green");
  }
  else if (op === "angle") {
    let angle = angleBetween(v1, v2);
    console.log("Angle:", angle);
  }
  else if (op === "area") {
    let area = areaTriangle(v1, v2);
    console.log("Area of the triangle:", area);
  }
  
}
function angleBetween(v1, v2) {
  let dot = Vector3.dot(v1, v2);
  let mag = v1.magnitude() * v2.magnitude();
  let angle = Math.acos(dot / mag);
  return angle * 180 / Math.PI;
}
function areaTriangle(v1, v2) {
  let cross = Vector3.cross(v1, v2);
  return cross.magnitude() / 2;
}


