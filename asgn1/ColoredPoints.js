// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
attribute vec4 a_Position;
uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

function setupWebGL(){

  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl",{ preserveDrawingBuffer: true});
  
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLS(){
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
      console.log('Failed to intialize shaders.');
      return;
    }
  
    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
      console.log('Failed to get the storage location of a_Position');
      return;
    }
  
    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
      console.log('Failed to get the storage location of u_FragColor');
      return;
    }

    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (!u_Size) {
      console.log('Failed to get the storage location of u_Size');
      return;
    }
}
//Ui related globals
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;


let g_selectedColor = [1.0,1.0,1.0,1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_circleSegments = 10; 
let g_flowerRotation = 0;
let g_flowerAnimationId = null; 


function addActionsForHtmlUI(){
  document.getElementById('green').onclick = function () {
    g_selectedColor = [0.0, 1.0, 0.0, 1.0];
  };

  document.getElementById('red').onclick = function () {
    g_selectedColor = [1.0, 0.0, 0.0, 1.0];
  };

  document.getElementById('clearButton').onclick = function () {
    g_shapesList = [];
    renderAllShapes();
  };

  document.getElementById('pointButton').onclick = function () {
    g_selectedType=POINT;
  };

  document.getElementById('triButton').onclick = function () {
    g_selectedType=TRIANGLE;
  };

  document.getElementById('circleButton').onclick = function () {
    g_selectedType=CIRCLE;
  };

  document.getElementById('redSlide').addEventListener('mouseup', function() {
    g_selectedColor[0] = this.value/100;
  });

  document.getElementById('greenSlide').addEventListener('mouseup', function() {
    g_selectedColor[1] = this.value/100;
  });
  document.getElementById('blueSlide').addEventListener('mouseup', function() {
    g_selectedColor[2] = this.value/100;
  });

  document.getElementById('sizeSlide').addEventListener('mouseup', function() {
    g_selectedSize = this.value;
  });

  document.getElementById('circleSegmentsSlide').addEventListener('input', function() {
    g_circleSegments = parseInt(this.value);
    document.getElementById('circleSegmentsValue').innerText = this.value;
  });
  document.getElementById('flowerButton').onclick = function() {
    drawFlower();
  };
  document.getElementById('animateFlowerButton').onclick = function() {
    this.disabled = true;
    animateFlower();
  };
  document.getElementById('stopFlowerButton').onclick = () => {
    if (g_flowerAnimationId !== null) {
      cancelAnimationFrame(g_flowerAnimationId);
      g_flowerAnimationId = null;
      document.getElementById('animateFlowerButton').disabled = false;
    }
  };
  
}

function main() {

  setupWebGL();
  connectVariablesToGLS();
  addActionsForHtmlUI();


  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  //canvas.onmousemove = click;
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };


  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  //here

  //drawFlower();
}

var g_shapesList = [];
//var g_points = [];  // The array for the position of a mouse press
//var g_colors = [];  // The array to store the color of a point
//var g_sizes = [];

function click(ev) {
  let [x,y] = convertCoordinatesEventToGL(ev);

  let point;
  if (g_selectedType==POINT) {
    point = new Point();
  } else if (g_selectedType==TRIANGLE){
    point = new Triangle();
  } else {
    point = new Circle();
  }
  point.position=[x,y];
  point.color=g_selectedColor.slice();
  point.size=g_selectedSize;
  g_shapesList.push(point);

  // Store the coordinates to g_points array
  //g_points.push([x, y]);
  //g_colors.push(g_selectedColor);
  //g_colors.push(g_selectedColor.slice());

  //g_sizes.push(g_selectedSize);

  // Store the coordinates to g_points array
 //if (x >= 0.0 && y >= 0.0) {      // First quadrant
 //   g_colors.push([1.0, 0.0, 0.0, 1.0]);  // Red
 // } else if (x < 0.0 && y < 0.0) { // Third quadrant
 //  g_colors.push([0.0, 1.0, 0.0, 1.0]);  // Green
 //} else {                         // Others
  //  g_colors.push([1.0, 1.0, 1.0, 1.0]);  // White
  //}
  renderAllShapes();
}

function convertCoordinatesEventToGL(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();
  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  return([x,y]);

}

function renderAllShapes(){
  // Clear <canvas>
  var startTime = performance.now();

  gl.clear(gl.COLOR_BUFFER_BIT);

  //var len = g_points.length;
  var len = g_shapesList.length;

  for(var i = 0; i < len; i++) {
    g_shapesList[i].render(); 
  }
  var duration = performance.now() - startTime;
  sendTextToHTML("numdot: " + len + "ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10,"numdot");
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}

function drawTriangleColored(x1, y1, x2, y2, x3, y3, color) {
  // Set the color for this triangle
  gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);

  // Draw the triangle using the vertices
  drawTriangle([x1, y1, x2, y2, x3, y3]);
}

function drawTriangle(vertices) {
  var n = 3; // number of vertices

  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create buffer');
    return;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  
  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawFlower(rotation = 0) {
  const centerColor = [1.0, 0.95, 0.7, 1.0];
  const petalColor  = [1.0, 0.7, 0.85, 1.0];
  const leafColor   = [0.6, 0.9, 0.6, 1.0];
  const letterColor = [0.9, 0.4, 0.6, 1.0];

  const cx = 0.0, cy = 0.0;
  const scale = 4.0;

  function drawLine(x1, y1, x2, y2, width, color) {
    const dx = y2 - y1;
    const dy = x1 - x2;
    const len = Math.sqrt(dx * dx + dy * dy);
    const ux = (dx / len) * width;
    const uy = (dy / len) * width;

    drawTriangleColored(x1 - ux, y1 - uy, x1 + ux, y1 + uy, x2 + ux, y2 + uy, color);
    drawTriangleColored(x1 - ux, y1 - uy, x2 + ux, y2 + uy, x2 - ux, y2 - uy, color);
  }

  function rotatePoint(px, py, centerX, centerY, angle) {
    const dx = px - centerX;
    const dy = py - centerY;
    const cosR = Math.cos(angle);
    const sinR = Math.sin(angle);
    return [
      centerX + dx * cosR - dy * sinR,
      centerY + dx * sinR + dy * cosR
    ];
  }

  const leafAngles = [45, 135, 225, 315];
  leafAngles.forEach((a) => {
    const rad = a * Math.PI / 180;
    const length = 0.35 * scale;

    const tipX = cx + Math.cos(rad) * length;
    const tipY = cy + Math.sin(rad) * length;
    const side1X = cx + Math.cos(rad - 0.3) * (length * 0.5);
    const side1Y = cy + Math.sin(rad - 0.3) * (length * 0.5);
    const side2X = cx + Math.cos(rad + 0.3) * (length * 0.5);
    const side2Y = cy + Math.sin(rad + 0.3) * (length * 0.5);

    drawTriangleColored(cx, cy, side1X, side1Y, tipX, tipY, leafColor);
    drawTriangleColored(cx, cy, side2X, side2Y, tipX, tipY, leafColor);
  });

  const numPetals = 8;
  const petalRadius = 0.25 * scale;
  for (let i = 0; i < numPetals; i++) {
    const baseAngle = (i * 2 * Math.PI) / numPetals;
    const angle = baseAngle + rotation;
    const segments = 4;
    const spread = (Math.PI * 2) / numPetals * 0.8;

    for (let j = 0; j < segments; j++) {
      const theta1 = angle - spread / 2 + (j / segments) * spread;
      const theta2 = angle - spread / 2 + ((j + 1) / segments) * spread;

      const p1x = cx + Math.cos(theta1) * petalRadius;
      const p1y = cy + Math.sin(theta1) * petalRadius;
      const p2x = cx + Math.cos(theta2) * petalRadius;
      const p2y = cy + Math.sin(theta2) * petalRadius;

      drawTriangleColored(cx, cy, p1x, p1y, p2x, p2y, petalColor);
    }

    if (i === 0) {
      const midX = cx + Math.cos(angle) * petalRadius * 0.5;
      const midY = cy + Math.sin(angle) * petalRadius * 0.5;
      const letterScale = 0.015 * scale;

      let [vx1, vy1] = rotatePoint(midX - letterScale, midY + letterScale, midX, midY, rotation);
      let [vx2, vy2] = rotatePoint(midX, midY - letterScale, midX, midY, rotation);
      let [vx3, vy3] = rotatePoint(midX + letterScale, midY + letterScale, midX, midY, rotation);
      drawLine(vx1, vy1, vx2, vy2, 0.006, letterColor);
      drawLine(vx3, vy3, vx2, vy2, 0.006, letterColor);

      const hOffset = 2.0 * letterScale;
      let [hx1, hy1] = rotatePoint(midX + hOffset, midY + letterScale, midX, midY, rotation);
      let [hx2, hy2] = rotatePoint(midX + hOffset, midY - letterScale, midX, midY, rotation);
      let [hx3, hy3] = rotatePoint(midX + hOffset + letterScale, midY + letterScale, midX, midY, rotation);
      let [hx4, hy4] = rotatePoint(midX + hOffset + letterScale, midY - letterScale, midX, midY, rotation);
      let [hx5, hy5] = rotatePoint(midX + hOffset, midY, midX, midY, rotation);
      let [hx6, hy6] = rotatePoint(midX + hOffset + letterScale, midY, midX, midY, rotation);

      drawLine(hx1, hy1, hx2, hy2, 0.006, letterColor);
      drawLine(hx3, hy3, hx4, hy4, 0.006, letterColor);
      drawLine(hx5, hy5, hx6, hy6, 0.006, letterColor);
    }
  }

  const centerRes = 6;
  const centerRad = 0.08 * scale;
  for (let i = 0; i < centerRes; i++) {
    const t1 = (i * 2 * Math.PI) / centerRes;
    const t2 = ((i + 1) * 2 * Math.PI) / centerRes;

    drawTriangleColored(
      cx, cy,
      cx + Math.cos(t1) * centerRad, cy + Math.sin(t1) * centerRad,
      cx + Math.cos(t2) * centerRad, cy + Math.sin(t2) * centerRad,
      centerColor
    );
  }
}

function animateFlower() {
  g_flowerRotation += 0.01;
  gl.clear(gl.COLOR_BUFFER_BIT);
  drawFlower(g_flowerRotation);
  g_flowerAnimationId = requestAnimationFrame(animateFlower);
}


