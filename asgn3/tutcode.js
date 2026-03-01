// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
precision mediump float;
attribute vec4 a_Position;
attribute vec2 a_UV;
varying vec2 v_UV;
uniform mat4 u_ModelMatrix;
uniform mat4 u_GlobalRotateMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjectionMatrix;
void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`


// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -2){
      gl_FragColor = u_FragColor;
    } 
    else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV, 1.0, 1.0);
    } 
    else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else {
      gl_FragColor = vec4(1, .2, .2, 1);
    }
    
    gl_FragColor = vec4(v_UV, 1.0, 1.0);
  }`
 
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_whichTexture;


function setupWebGL(){

  canvas = document.getElementById('webgl');

  gl = canvas.getContext("webgl",{ preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
 
  gl.enable(gl.DEPTH_TEST)
  //g_vertexBuffer = gl.createBuffer(); 
  //if (!g_vertexBuffer) { console.log('Failed to create buffer'); }
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

    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
      console.log('Failed to get the storage location of a_UV');
      return;
    }
 
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
      console.log('Failed to get the storage location of u_whichTexture');
      return;
    }
  
    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
      console.log('Failed to get the storage location of u_FragColor');
      return;
    }

    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
      console.log('Failed to get the storage location of u_ModelMatrix');
      return;
    }

    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
      console.log('Failed to get the storage location of u_GlobalRotateMatrix');
      return;
    }

    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
      console.log('Failed to get the storage location of u_ViewMatrix');
      return;
    }

    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
      console.log('Failed to get the storage location of u_ProjectionMatrix');
      return;
    }

    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
      console.log('Failed to get the storage location of u_Sampler0');
      return;
    }

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, identityM.elements);


}

//Ui related globals
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedColor = [1.0,1.0,1.0,1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
//let g_circleSegments = 10; 
let g_globalAngle=0;
let g_yellowAngle=0;
let g_magentaAngle=0;
let g_yellowAnimation=false;
let g_magentaAnimation=false;

/*
let g_tailAngle = 0;
let g_headBob = 0;
let g_tailAnimation = true;   // animation on/off
let g_tailTipSlider = 0;        // base tail joint
let g_tailMidSlider = 0;     // mid tail joint
let g_tailTipAngle = 0;

let g_globalAngleX = 0;
let g_globalAngleY = 0;

let g_mouseAngleX = 0;  // mouse drag
let g_mouseAngleY = 0;  

let g_pokeAnimation = false;
let g_pokeStartTime = 0;
let g_vertexBuffer = null;

let g_animAngleX = 0;
let g_animAngleY = 0;
*/
function addActionsForHtmlUI() {


  document.getElementById('animationYellowOffButton').onclick = function () {
    g_tailAnimation = true;
  };

  document.getElementById('animationYellowOnButton').onclick = function () {
    g_tailAnimation = false;
  };

  document.getElementById('animationMagentaOffButton').onclick = function () {
    g_tailAnimation = true;
  };

  document.getElementById('animationMagentaOnButton').onclick = function () {
    g_tailAnimation = false;
  };

  document.getElementById('yellowSlide').addEventListener('mousemove', function() {
    g_globalAngle = this.value;
    renderAllShapes();
  });

  document.getElementById('magentaSlide').addEventListener('mousemove', function() {
    g_globalAngle = this.value;
    renderAllShapes();
  });

  canvas.onmousemove = function(ev){
    if(ev.buttons ==1){
      click(ev);
    }
  }

  document.getElementById('angleSlide').addEventListener('mousemove', function() {
    g_globalAngle = this.value;
    renderAllShapes();
  });

}

function initTextures(){
  var image = new Image();
  if(!image){
    console.log('Failed to create the image object');
    return false;
  }
  image.onload = function(){ sendImageToTEXTURE0( image); };
  image.src = 'sky.jpg';

  return true;
}

function sendImageToTEXTURE0( image) {
  var texture = gl.createTexture();
  if(!texture){
    console.log('Failed to create the texture object');
    return false;
  }
  gl.pixelStore(gl.UNPACK_FLIP_Y_WEBGL, 1);

  gl.activeTexture(gl.TEXTURE0);

  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  gl.uniform1i(u_Sampler0, 0);
  console.log('finished loadTexture');
}

function main() {

  setupWebGL();
  connectVariablesToGLS();
  addActionsForHtmlUI();

  initTextures();

  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  requestAnimationFrame(tick);

  document.onkeydown = function(ev) {
    switch(ev.key) {
      case 'w': g_camera.moveForward(); break;
      case 's': g_camera.moveBackwards(); break;
      case 'a': g_camera.moveLeft(); break;
      case 'd': g_camera.moveRight(); break;
      case 'q': g_camera.panLeft(); break;
      case 'e': g_camera.panRight(); break;

      case 'f': // add block
  let x = Math.floor(g_camera.at.elements[0] + 16);
  let z = Math.floor(g_camera.at.elements[2] + 16);

  if(x>=0 && x<32 && z>=0 && z<32){
    g_map[x][z]++;
  }
  break;

case 'r': // remove block
  let x2 = Math.floor(g_camera.at.elements[0] + 16);
  let z2 = Math.floor(g_camera.at.elements[2] + 16);

  if(x2>=0 && x2<32 && z2>=0 && z2<32 && g_map[x2][z2] > 0){
    g_map[x2][z2]--;
  }
  break;

    }
    renderAllShapes();

    
  };

  let lastX;

canvas.onmousemove = function(ev){
  if(ev.buttons == 1){   // left mouse held
    let dx = ev.movementX;
    g_camera.panLeft(-dx * 0.5);
    renderAllShapes();  // redraw after moving camera
  }
}

  
/*
  let dragging = false;
  let lastX = -1, lastY = -1;

  canvas.onmousedown = function(ev) {
      dragging = true;
      lastX = ev.clientX;
      lastY = ev.clientY;
  };

  canvas.onmouseup = function(ev) {
      dragging = false;
  };

  canvas.onmousemove = function(ev) {
      if (!dragging) return;

      let dx = ev.clientX - lastX;
      let dy = ev.clientY - lastY;

      g_mouseAngleY += dx * 0.5;  
      g_mouseAngleX += dy * 0.5;

      lastX = ev.clientX;
      lastY = ev.clientY;

      renderAllShapes();
  };

  canvas.onclick = function(ev) {
    if (ev.shiftKey) {
        g_pokeAnimation = true;
        g_pokeStartTime = g_seconds;
    }
};
*/

}

var g_startTime=performance.now()/1000.0;
var g_seconds=performance.now()/1000.0-g_startTime;

function tick() {
  g_seconds=performance.now()/1000.0-g_startTime;
  updateAnimationAngles();

  renderAllShapes();

  requestAnimationFrame(tick);
}
var g_shapesList = [];

function updateAnimationAngles() {
  if(g_yellowAnimation){
    g_yellowAngle = (45*Math.sin(g_seconds));
  }

  if(g_magentaAnimation){
    g_magentaAngle= (45*Math.sin(3*g_seconds));
  }

  /*
  if (g_pokeAnimation) {
      let t = g_seconds - g_pokeStartTime;

      g_tailAngle    = 45 * Math.sin(t * 10);
      g_tailMidAngle = 30 * Math.sin(t * 10 + 0.5);
      g_tailTipAngle = 20 * Math.sin(t * 10 + 1.0);

      g_headBob = 20 * Math.sin(t * 8);

      g_animAngleX = 10 * Math.sin(t * 6);
      g_animAngleY = 15 * Math.sin(t * 7);

      if (t > 2) {
          g_pokeAnimation = false;
          g_animAngleX = 0;
          g_animAngleY = 0;
          g_headBob = 0;
      }

  } else {
      if (g_tailAnimation) {
          g_tailAngle    = 30 * Math.sin(g_seconds * 3);
          g_tailMidAngle = 20 * Math.sin(g_seconds * 3 + 0.5);
          g_tailTipAngle = 15 * Math.sin(g_seconds * 3 + 1.0);
          g_headBob = 10 * Math.sin(g_seconds * 2);
      } else {
          g_tailAngle    = 0;
          g_tailMidAngle = g_tailMidSlider;
          g_tailTipAngle = g_tailTipSlider;
          g_headBob = 0;
      }
      g_animAngleX = 2 * Math.sin(g_seconds * 1.5);
      g_animAngleY = 3 * Math.sin(g_seconds * 1.2);
  }
  */
}

function keydown(ev) {
  if (ev.keyCode==39){
    g_eye[0] += 0.2;
  } else
  if (ev.keyCode == 37) {
    g_eye[0] -= 0.2;
  }

  renderAllShapes();
  console.log(ev.keyCode);
}
//var g_eye=[0,0,3];
//var g_at=[0,0,-100];
//var g_up=[0,1,0];


var g_camera=new Camera();
/*
var g_map=[
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 1, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
];
function drawMap() {
  var body = new Cube();
  for (i=0; i<2; i++){
  for (x=0;x<32;x++){
    for (y=0;y<32;y++){
  //console.log(x,y) ;
    //if (x==0 || x==31 || y==0 || y==31){
    //var body = new Cube();
    body.color = [0.8,1.0,1.0,1.0];
    body.matrix.translate(0, -.75, 0);
    body.matrix.scale(.4, .4, .4);
    body.matrix.translate(x-16, 0, y-16);
    body.renderfast();
    }
    }
  }
}
*/

var g_map = [];
for(let x=0; x<32; x++){
  g_map[x] = [];
  for(let z=0; z<32; z++){
    if(x==0 || x==31 || z==0 || z==31){
      g_map[x][z] = 4;
    } else {
      g_map[x][z] = Math.floor(Math.random()*3);
    }
  }
}
let treasureX = 5;
let treasureZ = 5;
let treasureFound = false;


function drawMap() {
  for(let x=0; x<32; x++){
    for(let z=0; z<32; z++){
      for(let h=0; h<g_map[x][z]; h++){
        let cube = new Cube();
        cube.textureNum = 0;
        cube.matrix.translate(x-16, h-1, z-16);
        cube.render();
      }
    }
  }
}


function renderAllShapes() {
  var startTime = performance.now();

  var projMat=new Matrix4();
  projMat.setPerspective(50, 1*canvas.width/canvas.height, 1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  var viewMat=new Matrix4();
  viewMat.setLookAt(
      g_camera.eye.x,g_camera.eye.y,g_camera.eye.z, 
      g_camera.at.x,g_camera.at.y,g_camera.at.z, 
      g_camera.up.x,g_camera.up.y,g_camera.up.z);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  var globalRotMat=new Matrix4().rotate(g_golbalAngle,0,1,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  var body = new Cube();
  body.color = [1.0,0.0,0.0,1.0];
  body.textureNum=0;
  body.matrix.translate(0, -.75, 0.0);
  //body.matrix.rotate(-5,1,0,0);
  body.matrix.scale(10, 0, 10);
  body.matrix.translate(-.5, 0, -0.5);
  body.render();

  var body = new Cube();
  body.color = [1.0,0.0,0.0,1.0];
  //body.textureNum=0;
  body.matrix.translate(-.25, -.75, 0.0);
  body.matrix.rotate(-5,1,0,0);
  body.matrix.scale(0.5, .3, .5);
  body.render();

  var yellow = newCube();
  yellow.color = [1,1,0,1];
  yellow.matrix.setTranslate(0, -.5, 0.0);
  yellow.matrix.rotate(-5,1,0,0);
  yellow.matrix.rotate(-g_yellowAngle, 0, 0, 1);
  var yellowCoordinatesMat=new Matrix4(yellow.matrix);
  yellow.matrix.scale(0.25, .7, .5);
  yellow.matrix.translate(-.5, 0, 0);
  yellow.render();

  var magenta = new Cube();
  magenta.color = [1,0,1,1];
  magenta.textureNum=0;
  magenta.matrix = yellowCoordinatesMat;
  magenta.matrix.translate(0, .65, 0);
  yellow.matrix.rotate(g_magentaAngle,0,0,1);
  yellow.matrix.scale(.3, .3, .3);
  yellow.matrix.translate(-.5, 0, -0.001);
  magenta.render();

  var ground = new Cube();
  ground.matrix.translate(0,0,-1);
  ground.matrix.scale(2,.1,2);
  ground.render();

  drawMap(); 
  
  // Draw Treasure
let treasure = new Cube();
treasure.color = [1, 1, 0, 1]; // yellow
treasure.matrix.translate(treasureX - 16, 0, treasureZ - 16);
treasure.matrix.scale(0.5, 0.5, 0.5);
treasure.render();

if(!treasureFound &&
  Math.abs(g_camera.eye.elements[0] - (treasureX - 16)) < 1 &&
  Math.abs(g_camera.eye.elements[2] - (treasureZ - 16)) < 1){

  treasureFound = true;
  alert("You found the treasure!");
}





  




  /*

  var globalRotMat = new Matrix4();
  
  globalRotMat.rotate(g_mouseAngleX, 1, 0, 0);
  globalRotMat.rotate(g_mouseAngleY, 0, 1, 0);

  globalRotMat.rotate(g_animAngleX, 1, 0, 0);
  globalRotMat.rotate(g_animAngleY, 0, 1, 0);

  globalRotMat.rotate(g_globalAngle, 0, 1, 0);  
  
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var backMat = new Matrix4();
  backMat.translate(-.2, -0.6, 0);
  backMat.scale(0.4, 0.4, 0.4);
  drawCube(backMat, [0.6, 0.6, 0.6, 1.0]);
  var backCoordinatesMat = new Matrix4(backMat); 

  var bodyMat = new Matrix4(backMat);
  bodyMat.translate(1, 0, 0);
  bodyMat.scale(.55, .75, 1);
  drawCube(bodyMat, [0.6, 0.6, 0.6, 1.0]);
  var bodyCoordinatesMat = new Matrix4(bodyMat); 

  var headMat = new Matrix4(bodyCoordinatesMat);
  headMat.translate(1, 0, .2);
  headMat.scale(0.9, 0.7, 0.6);
  drawCube(headMat, [0.7, 0.7, 0.7, 1.0]);
  var headCoordinatesMat = new Matrix4(headMat);

  var snoutMat = new Matrix4(headCoordinatesMat);
  snoutMat.translate(1, 0, 0.4);
  snoutMat.scale(0.3, 0.3, 0.3);
  drawCube(snoutMat, [0.7, 0.7, 0.7, 1.0]);
  var snoutCoordinatesMat = new Matrix4(snoutMat);

  
  //var noseMat = new Matrix4(snoutMat);
  //noseMat.translate(0.9, 1, 0.4);
  //noseMat.scale(0.25, 0.25, 0.25);
  //drawCube(noseMat, [0, 0, 0, 1]);


  //nose as a sphere
  var noseMat = new Matrix4(snoutMat);
  noseMat.translate(0.9, 1, 0.4);
  noseMat.scale(0.25, 0.25, 0.25);

  let noseSphere = new Sphere();
  noseSphere.color = [0, 0, 0, 1]; // black nose
  noseSphere.matrix = noseMat;
  noseSphere.render();

  var leftEarMat = new Matrix4(headCoordinatesMat);
  leftEarMat.translate(.7,1,.8);
  leftEarMat.scale(.3, .25, .2);
  drawCube(leftEarMat, [1, 0.7, 0.7, 1.0]);

  var rightEarMat = new Matrix4(headCoordinatesMat);
  rightEarMat.translate(.7,1,0);
  rightEarMat.scale(.3, .25, .2);
  drawCube(rightEarMat, [1, 0.7, 0.7, 1.0]);
 
  var thighMat = new Matrix4(backCoordinatesMat);
  thighMat.translate(.07, -.07, -.1);
  thighMat.scale(.67, .6, 0.1);
  drawCube(thighMat, [0.52, 0.52, 0.52, 1.0]);
  var thighCoordinatesMat = new Matrix4(thighMat);

  var calfMat = new Matrix4(thighCoordinatesMat);
  calfMat.translate(1, 0, 0);
  calfMat.scale(0.4, 0.7, 1);
  drawCube(calfMat, [0.52, 0.52, 0.52, 1.0]);
  var calfCoordinatesMat = new Matrix4(calfMat);

  var footMat = new Matrix4(calfCoordinatesMat);
  footMat.translate(1, 0, 0);
  footMat.scale(.9, 0.28, 1);
  drawCube(footMat, [1, 0.7, 0.7, 1.7]);

   var thigh2Mat = new Matrix4(backCoordinatesMat);
  thigh2Mat.translate(.07, -.07,1);
  thigh2Mat.scale(.67, .6, 0.1);
  drawCube(thigh2Mat, [0.52, 0.52, 0.52, 1.0]);
  var thigh2CoordinatesMat = new Matrix4(thigh2Mat);

  var calf2Mat = new Matrix4(thigh2CoordinatesMat);
  calf2Mat.translate(1, 0, 0);
  calf2Mat.scale(0.4, 0.7, 1);
  drawCube(calf2Mat, [0.52, 0.52, 0.52, 1.0]);
  var calf2CoordinatesMat = new Matrix4(calf2Mat);

  var foot2Mat = new Matrix4(calf2CoordinatesMat);
  foot2Mat.translate(1, 0, 0);
  foot2Mat.scale(0.9, 0.28, 1);
  drawCube(foot2Mat, [1, 0.7, 0.7, 1.7]);

  var frontFootLMat = new Matrix4(bodyCoordinatesMat);
  frontFootLMat.translate(.8, -.1, .08);
  frontFootLMat.scale(0.4, 0.1, 0.1);
  drawCube(frontFootLMat, [1, 0.7, 0.7, 1.0]);

  let frontFootRMat = new Matrix4(bodyCoordinatesMat);
  frontFootRMat.translate(.8, -.1, .82);
  frontFootRMat.scale(0.4, 0.1, .1);
  drawCube(frontFootRMat, [1, 0.7, 0.7, 1.0]);

  var tailBaseJointMat = new Matrix4(bodyCoordinatesMat);
  tailBaseJointMat.translate(-1.8, .3, 0.48);
  tailBaseJointMat.rotate(160, 0, 0, 1); 
  tailBaseJointMat.rotate(g_tailAngle, 0, 0, 1); 

  var tailBaseDrawMat = new Matrix4(tailBaseJointMat);
  tailBaseDrawMat.scale(1.4, 0.06, 0.06);
  drawCube(tailBaseDrawMat, [0.85, 0.55, 0.55, 1.0]);

  let tailMidJointMat = new Matrix4(tailBaseJointMat);
  tailMidJointMat.translate(1.4, 0, 0);
  tailMidJointMat.rotate(290, 0, 0, 1);
  tailMidJointMat.rotate(g_tailMidAngle, 0, 0, 1); 

  let tailMidDrawMat = new Matrix4(tailMidJointMat);
  tailMidDrawMat.scale(1, 0.05, 0.05);
  drawCube(tailMidDrawMat, [0.85, 0.55, 0.55, 1.0]);

  let tailTipJointMat = new Matrix4(tailMidJointMat);
  tailTipJointMat.translate(1, 0, 0);
  tailTipJointMat.rotate(65, 0, 0, 1);
  tailTipJointMat.rotate(g_tailTipAngle, 0, 0, 1); 

  let tailTipDrawMat = new Matrix4(tailTipJointMat);
  tailTipDrawMat.scale(0.8, 0.04, 0.04);
  drawCube(tailTipDrawMat, [0.85, 0.55, 0.55, 1.0]);


  var durationMs = performance.now() - startTime;
  var fps = 1000 / durationMs;
  sendTextToHTML(
    "ms: " + durationMs.toFixed(1) + " fps: " + fps.toFixed(1),
    "numdot"
);
*/
}

function renderScene() {
  renderAllShapes();
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}

