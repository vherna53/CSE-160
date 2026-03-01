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
  uniform float u_Alpha;       // <-- new uniform for fade

  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;   // SECOND TEXTURE
  uniform sampler2D u_Sampler2;   // THIRD TEXTURE
  uniform int u_whichTexture;
  uniform float u_texColorWeight;

  void main() {

    vec4 texColor;

if (u_whichTexture == -2){
    texColor = u_FragColor;          // solid color (sky)
} 
else if (u_whichTexture == -1) {
    texColor = vec4(v_UV, 1.0, 1.0); // debug UV
} 
else if (u_whichTexture == 0) {
    texColor = texture2D(u_Sampler0, v_UV);
}
else if (u_whichTexture == 1) {
    texColor = texture2D(u_Sampler1, v_UV);
}
else if (u_whichTexture == 2) {
    texColor = texture2D(u_Sampler2, v_UV);
}
else {
    texColor = vec4(1, .2, .2, 1);
}

// **Mix base color and texture using weight**
gl_FragColor = mix(u_FragColor, texColor, u_texColorWeight);

// Apply fade
gl_FragColor.a *= u_Alpha;

  }`

 
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Alpha;
let u_texColorWeight;  
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_whichTexture;
let g_skyTexture = null;
let g_wallTexture = null;
let g_cheeseTexture = null; 

function setupWebGL(){

  canvas = document.getElementById('webgl');

  gl = canvas.getContext("webgl",{ preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
 
  gl.enable(gl.DEPTH_TEST)
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
}

function connectVariablesToGLS(){
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
      console.log('Failed to intialize shaders.');
      return;
    }
  
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
    if (u_whichTexture==null) {
      console.log('Failed to get the storage location of u_whichTexture');
      return;
    }
  
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

    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return;
    }

    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
    if (!u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler2');
    return;
    }

    u_Alpha = gl.getUniformLocation(gl.program, 'u_Alpha');
        gl.uniform1f(u_Alpha, 1.0); // fully visible at start
    u_texColorWeight = gl.getUniformLocation(gl.program, 'u_texColorWeight');
    if (!u_texColorWeight) console.log('Failed to get u_texColorWeight');
    gl.uniform1f(u_texColorWeight, 1.0);  // default: use full texture

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, identityM.elements);

    gl.uniform1i(u_whichTexture, 0);
}

//Ui related globals
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedColor = [1.0,1.0,1.0,1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_globalAngle=0;
let g_yellowAngle=0;
let g_magentaAngle=0;
let g_yellowAnimation=false;
let g_magentaAnimation=false;
let fading = false;
let fadeAlpha = 1.0;

function addActionsForHtmlUI() {

  document.getElementById('showMapButton').onclick = function() {
    let mapCanvas = document.getElementById('miniMap');
    mapCanvas.style.display = mapCanvas.style.display === 'none' ? 'block' : 'none';
    drawMiniMap();
};

  let lastX = null;

  canvas.onmousemove = function(ev){
 
    if (ev.buttons === 1) { 
        fading = true; // left button pressed
        if (lastX !== null && lastY !== null) {
            let dx = ev.clientX - lastX;
            let dy = ev.clientY - lastY;

            // Horizontal rotation
            g_camera.panLeft(-dx * 0.2);  // sensitivity

            // Vertical rotation
            g_camera.pitch(-dy * 0.2);    // negative to invert Y-axis
        }
        lastX = ev.clientX;
        lastY = ev.clientY;
    } else {
        lastX = null;
        lastY = null;
    }
  }  
} 

let texturesLoaded = 0;
function initTextures() {
  var image0 = new Image();
  var image1 = new Image();
  var image2 = new Image();


  image0.onload = function() {
    sendImageToTEXTURE0(image0);
    texturesLoaded++;
    checkAllTexturesLoaded();
  };

  image1.onload = function() {
    sendImageToTEXTURE1(image1);
    texturesLoaded++;
    checkAllTexturesLoaded();
  };

  image2.onload = function() {
    sendImageToTEXTURE2(image2);
    texturesLoaded++;
    checkAllTexturesLoaded();
  };

  image0.src = 'sky.jpg';
  image1.src = 'wall.jpg';
  image2.src = 'cheese.jpg';
  function checkAllTexturesLoaded() {
    if (texturesLoaded === 3) {
        placeStartingAnimal();
    }
}
}

  function sendImageToTEXTURE0(image) {
    g_skyTexture = gl.createTexture();
    if (!g_skyTexture) { console.log('Failed to create texture'); return false; }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, g_skyTexture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    gl.uniform1i(u_Sampler0, 0);
}

function sendImageToTEXTURE1(image) {

  g_wallTexture = gl.createTexture();
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, g_wallTexture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  gl.uniform1i(u_Sampler1, 1);
}

function sendImageToTEXTURE2(image) {
    g_cheeseTexture = gl.createTexture();
    if (!g_cheeseTexture) { console.log('Failed to create texture'); return false; }
  
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, g_cheeseTexture);
  
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    gl.uniform1i(u_Sampler2, 2);

  }


var g_startTime=performance.now()/1000.0;
var g_seconds=performance.now()/1000.0-g_startTime;

function tick() {
    g_seconds = performance.now()/1000.0 - g_startTime;

    if (g_seconds >= g_maxTime) {
        treasureFound = true;
        alert("Time's up! You didn't find the treasure. You lose!");
        return;
    }

    if (fading && fadeAlpha > 0) {
        fadeAlpha -= 0.04;
        fadeAlpha = Math.max(0, fadeAlpha);
    }

    updateAnimationAngles();
    renderAllShapes();

    if (!treasureFound) {
        requestAnimationFrame(tick);
    }
}
var g_shapesList = [];
let g_startAnimal = null;

function updateAnimationAngles() {
  if(g_yellowAnimation){
    g_yellowAngle = (45*Math.sin(g_seconds));
  }

  if(g_magentaAnimation){
    g_magentaAngle= (45*Math.sin(3*g_seconds));
  }

}

var g_camera=new Camera();
g_camera.eye.elements[0] = 16;
g_camera.eye.elements[1] = 2;
g_camera.eye.elements[2] = 16;

g_camera.at.elements[0] = 16;
g_camera.at.elements[1] = 2;
g_camera.at.elements[2] = 15;

g_camera.up.elements[0] = 0;
g_camera.up.elements[1] = 1;
g_camera.up.elements[2] = 0;

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

let g_maxTime = 60;
let treasureX = 5;
let treasureZ = 5;
let treasureY = 0.5;
let treasureFound = false;

function placeStartingAnimal() {
    let distance = 1.6;

    let dirX = g_camera.at.elements[0] - g_camera.eye.elements[0];
    let dirY = g_camera.at.elements[1] - g_camera.eye.elements[1];
    let dirZ = g_camera.at.elements[2] - g_camera.eye.elements[2];

    let len = Math.sqrt(dirX*dirX + dirY*dirY + dirZ*dirZ);
    dirX /= len; dirY /= len; dirZ /= len;

    let x = g_camera.eye.elements[0] + dirX * distance  + 0.3;
    let y = g_camera.eye.elements[1] + dirY * distance + 0.5;
    let z = g_camera.eye.elements[2] + dirZ * distance;

    g_startAnimal = new Animal(gl);
    g_startAnimal.globalMatrix = new Matrix4();
    g_startAnimal.globalMatrix.setIdentity();
    g_startAnimal.globalMatrix.setIdentity();
    g_startAnimal.globalMatrix.translate(x, y, z);

    let angleY = 220;
    g_startAnimal.globalMatrix.rotate(angleY, 0, 1, 0);

}

function drawSky() {
    let sky = new Cube();

    sky.textureNum = 0;
    
    gl.uniform1i(u_whichTexture, 0); 
    gl.uniform1f(u_texColorWeight, 1.0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, g_skyTexture);

    sky.matrix.scale(-500, -500, -500); 
    sky.matrix.translate(-0.5, -0.5, -0.5); 

    sky.renderfaster();
}

function renderAllShapes() {
    var startTime = performance.now();

    var projMat = new Matrix4();
    projMat.setPerspective(60, canvas.width / canvas.height, 0.1, 5000);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

    var viewMat = new Matrix4();
    viewMat.setLookAt(
        g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
        g_camera.at.elements[0],  g_camera.at.elements[1],  g_camera.at.elements[2],
        g_camera.up.elements[0],  g_camera.up.elements[1],  g_camera.up.elements[2]
    );
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    var globalRotMat = new Matrix4();
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniform1f(u_Alpha, 1.0);
    gl.uniform1i(u_whichTexture, 0);
    gl.disable(gl.DEPTH_TEST);
    drawSky();
    gl.enable(gl.DEPTH_TEST);

    gl.uniform1f(u_Alpha, 1.0);
    let ground = new Cube();
    ground.textureNum = -2;
    ground.color = [0.05, 0.25, 0.05, 1];

    ground.matrix.setTranslate(0, -0.1, 0);
    ground.matrix.scale(32, 0.2, 32);
    ground.renderfaster();

    gl.uniform1f(u_Alpha, 1.0);
    drawMap();

    if (g_startAnimal) {
        gl.uniform1f(u_Alpha, fadeAlpha);
        g_startAnimal.render(g_startAnimal.globalMatrix);
    }

    var duration = performance.now() - startTime;
    var fps = 1000 / duration;
    sendTextToHTML("ms: " + duration.toFixed(1) + " | fps: " + fps.toFixed(1), "numdot");
    sendTextToHTML("Time left: " + Math.max(0, (g_maxTime - g_seconds)).toFixed(1) + " s", "timerDisplay");

    if (document.getElementById('miniMap').style.display !== 'none') {
        drawMiniMap();
    }
}
function placeTreasureSafely() {
    let x, z;
    do {
        x = Math.floor(Math.random() * 32);
        z = Math.floor(Math.random() * 32);
    } while (g_map[x][z] > 0);

    treasureX = x;
    treasureZ = z;
    treasureY = g_map[x][z] + 0.5;

    treasureFound = false;

    treasureY = g_map[x][z] + 0.5;
}

function addBlock() {
    let dirX = g_camera.at.elements[0] - g_camera.eye.elements[0];
    let dirZ = g_camera.at.elements[2] - g_camera.eye.elements[2];
  
    let len = Math.sqrt(dirX * dirX + dirZ * dirZ);
    dirX /= len;
    dirZ /= len;

    let distance = 8;

    let x = Math.floor(g_camera.eye.elements[0] + dirX * distance - 1);
    let z = Math.floor(g_camera.eye.elements[2] + dirZ * distance/2);
  
  
    if (x >= 0 && x < 32 && z >= 0 && z < 32) {
      if (g_map[x][z] < 4) {
        g_map[x][z]++;
      }
    }
}
  
function removeBlock() {
    let dirX = g_camera.at.elements[0] - g_camera.eye.elements[0];
    let dirZ = g_camera.at.elements[2] - g_camera.eye.elements[2];
  
    let len = Math.sqrt(dirX * dirX + dirZ * dirZ);
    dirX /= len;
    dirZ /= len;

    let distance = 8;

    let x = Math.floor(g_camera.eye.elements[0] + dirX * distance - 1);
    let z = Math.floor(g_camera.eye.elements[2] + dirZ * distance/2);

  
    if (x >= 0 && x < 32 && z >= 0 && z < 32) {
      if (g_map[x][z] > 0) {
        g_map[x][z]--;
      }
    }
}

function drawMap() {
    if (!this.mapCube) this.mapCube = new Cube();
    if (!this.mapMatrix) this.mapMatrix = new Matrix4();

    let mapCube = this.mapCube;
    let mapMatrix = this.mapMatrix;

    mapCube.textureNum = 1;
    //mapCube.color = [1, 1, 1, 1];
    mapCube.color = [0.8, 0.8, 0.8, 1];
    gl.uniform1f(u_texColorWeight, 0.5);

    for (let x = 0; x < 32; x++) {
        for (let z = 0; z < 32; z++) {
            let height = g_map[x][z];
            for (let h = 0; h < height; h++) {
                mapMatrix.setTranslate(x + 0.5, h - 0.5, z + 0.5);
                mapMatrix.scale(1, 1, 1);
                mapCube.matrix = mapMatrix;
                mapCube.renderfaster();
            }
        }
    }
    if (!treasureFound) {
        mapMatrix.setTranslate(treasureX + 0.5, treasureY, treasureZ + 0.5);
        mapMatrix.scale(0.5, 0.5, 0.5);
        mapCube.matrix = mapMatrix;
        mapCube.textureNum = 2;
        gl.uniform1i(u_whichTexture, 2);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, g_cheeseTexture);

        mapCube.color = [1, 1, 0, 1];
        gl.uniform1f(u_texColorWeight, 1.0);
        mapCube.render();
    
        let dx = g_camera.eye.elements[0] - (treasureX + 0.5);
        let dz = g_camera.eye.elements[2] - (treasureZ + 0.5);
        let dist = Math.sqrt(dx*dx + dz*dz);
    
        if (dist < 2) {
            treasureFound = true;
            alert("You found the treasure! Game over!");
        }
    }

}

function drawMiniMap() {
    let mapCanvas = document.getElementById('miniMap');
    let ctx = mapCanvas.getContext('2d');
    let size = mapCanvas.width / 32;

    ctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);

    for (let x = 0; x < 32; x++) {
        for (let z = 0; z < 32; z++) {
            let height = g_map[x][z];
            if (height === 0) {
                ctx.fillStyle = '#3CA83C';
            } else {
                ctx.fillStyle = '#808080';
            }

            ctx.fillRect(x * size, z * size, size, size);
        }
    }
    if (!treasureFound) {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(treasureX * size, treasureZ * size, size, size);
    }

    ctx.fillStyle = 'white';
    let camX = Math.floor(g_camera.eye.elements[0]);
    let camZ = Math.floor(g_camera.eye.elements[2]);
    ctx.fillRect(camX * size, camZ * size, size, size);
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

function keydown(ev) {
    const fadeKeys = ['w', 'a', 's', 'd', 'q', 'e', 'x', 'c'];
    if (fadeKeys.includes(ev.key.toLowerCase())) fading = true;

    switch (ev.key) {
      case 'w':
      case 'W':
        g_camera.forward();
        break;
      case 's':
      case 'S':
        g_camera.backward();
        break;
      case 'a':
      case 'A':
        g_camera.left();
        break;
      case 'd':
      case 'D':
        g_camera.right();
        break;
      case 'q':
      case 'Q':
        g_camera.panLeft();
        break;
      case 'e':
      case 'E':
        g_camera.panRight();
        break;

        case 'x':
            case 'X':
              addBlock();
              break;
            
            case 'c':
            case 'C':
              removeBlock();
              break;
    }
  
    renderAllShapes();
}
  
function main() {
    setupWebGL();
    connectVariablesToGLS();
    addActionsForHtmlUI();
    initTextures();

    placeTreasureSafely();  

    document.onkeydown = keydown;

    requestAnimationFrame(tick);

}
 