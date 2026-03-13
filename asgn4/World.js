// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
precision mediump float;
attribute vec4 a_Position;
attribute vec2 a_UV;
attribute vec3 a_Normal;
varying vec2 v_UV;
varying vec3 v_Normal;
varying vec4 v_VertPos;
uniform mat4 u_ModelMatrix;
uniform mat4 u_NormalMatrix;
uniform mat4 u_GlobalRotateMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjectionMatrix;
void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 0.0)));
    v_VertPos = vec4((u_ModelMatrix * a_Position).xyz, 1.0);

  }`


// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;

  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;   // SECOND TEXTURE
  uniform sampler2D u_Sampler2;   // THIRD TEXTURE
  uniform int u_whichTexture;

  uniform vec3 u_lightPos;
  uniform vec3 u_cameraPos;
  uniform bool u_lightOn;

  uniform vec3 u_spotLightPos;
  uniform vec3 u_spotLightDir;
  uniform float u_spotCutoff;  // cos(angle)
  uniform int u_spotLightOn;

  void main() {
    vec4 texColor;

    if (u_whichTexture == -4) {
      gl_FragColor = u_FragColor;
      return;
  }

  
    if (u_whichTexture == -3){
        texColor = vec4((v_Normal+1.0)/2.0, 1.0);
    } 
    else if (u_whichTexture == -2){
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

    gl_FragColor = texColor;
    if(u_lightOn) {
      vec3 lightVector = u_lightPos - vec3(v_VertPos);
      float r = length(lightVector);
      vec3 L = normalize(lightVector);
      vec3 N = normalize(v_Normal);
      float nDotL = max(dot(N,L), 0.0);

      vec3 R = reflect(-L, N);
      vec3 E = normalize(u_cameraPos - vec3(v_VertPos));
      float specular = pow(max(dot(E, R), 0.0), 10.0);

      vec3 diffuse = vec3(gl_FragColor) * nDotL;
      vec3 ambient = vec3(gl_FragColor) * 0.3;

      if(u_whichTexture == 0){ 
          gl_FragColor = vec4(specular+diffuse+ambient, texColor.a);
      } else {
          gl_FragColor = vec4(diffuse+ambient, texColor.a);
      }
  }

  if(u_spotLightOn == 1) {
    vec3 N = normalize(v_Normal);
    vec3 Ls = normalize(u_spotLightPos - vec3(v_VertPos));
    float distance = length(u_spotLightPos - vec3(v_VertPos));

    float theta = dot(normalize(-u_spotLightDir), Ls); // cosine of angle between spotlight dir and point
    if(theta > u_spotCutoff) {
        float nDotLs = max(dot(N, Ls), 0.0);
        vec3 diffuse = vec3(gl_FragColor) * nDotLs;

        // specular
        vec3 R = reflect(-Ls, N);
        vec3 E = normalize(u_cameraPos - vec3(v_VertPos));
        float specular = pow(max(dot(E, R), 0.0), 10.0);

        vec3 ambient = vec3(gl_FragColor) * 0.1;

        // simple distance attenuation
        float attenuation = 1.0 / (distance * distance);

        float intensity = 2.0;  // tweak this

        vec3 spotColor = vec3(1.0, 1.0, 0.6);  // warm yellow



        gl_FragColor.rgb += attenuation * (diffuse * intensity + specular * intensity + ambient) * spotColor;
    }
}
 
  }`

 
let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_NormalMatrix;
//let u_lightOn;

let u_whichTexture;

let u_Alpha;
let u_texColorWeight;  
let g_skyTexture = null;
let g_wallTexture = null;
let g_cheeseTexture = null; 

let u_lightPos;
let u_cameraPos;

let lightTime = 0;
let userControlLight = false;


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

    a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    if (a_Normal < 0) {
      console.log('Failed to get the storage location of a_Normal');
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

    u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
    if (!u_lightPos) {
      console.log('Failed to get the storage location of u_lightPos');
      return;
    }

    u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
    if (!u_cameraPos) {
      console.log('Failed to get the storage location of u_cameraPos');
      return;
    }

    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
      console.log('Failed to get the storage location of u_ModelMatrix');
      return;
    }

    u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
if (!u_NormalMatrix) {
  console.log('Failed to get u_NormalMatrix');
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


    u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
    u_Alpha = gl.getUniformLocation(gl.program, 'u_Alpha');


    u_spotLightPos = gl.getUniformLocation(gl.program, 'u_spotLightPos');
u_spotLightDir = gl.getUniformLocation(gl.program, 'u_spotLightDir');
u_spotCutoff = gl.getUniformLocation(gl.program, 'u_spotCutoff');
u_spotLightOn = gl.getUniformLocation(gl.program, 'u_spotLightOn');

    gl.uniform1f(u_Alpha, 1.0);
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, identityM.elements);
    gl.uniform1i(u_whichTexture, 0);
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
const roomSize = 10;
const roomHeight = 5;

let g_selectedColor = [1.0,1.0,1.0,1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_globalAngle=0;
let g_normalOn=false;
let g_lightPos = [roomSize / 2, roomHeight - 1, roomSize / 2];

let g_lightOn = true;
let g_startAnimal = null;

let g_spotLightOn = true;
let g_spotLightPos = [5, 4, 5];
let g_spotLightDir = [0, -1, 0];
let g_spotCutoff = Math.cos(20 * Math.PI / 180);


function addActionsForHtmlUI() {

document.getElementById('normalOn').onclick = function () {
  g_normalOn = true;
};
document.getElementById('normalOff').onclick = function () {
  g_normalOn = false;
};

document.getElementById('lightOnButton').onclick = function() {
  g_lightOn = true;
  renderAllShapes();
};

document.getElementById('lightOffButton').onclick = function() {
  g_lightOn = false;
  renderAllShapes();
};

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

document.getElementById('spotLightOnButton').onclick = function() {
  g_spotLightOn = true;
  renderAllShapes();
};
document.getElementById('spotLightOffButton').onclick = function() {
  g_spotLightOn = false;
  renderAllShapes();
};


const pad = 0.1;

document.getElementById('lightSlideX').addEventListener('mousemove', function(ev){
    if(ev.buttons == 1) {
      userControlLight = true;
        let newX = (this.value / 100) * roomSize;
        newX = Math.max(pad, Math.min(newX, roomSize - pad));
        g_lightPos[0] = newX;
        renderAllShapes();
    }
});

document.getElementById('lightSlideY').addEventListener('mousemove', function(ev){
    if(ev.buttons == 1) {
      userControlLight = true;
        let newY = (this.value / 100) * roomHeight;
        newY = Math.max(pad, Math.min(newY, roomHeight - pad));
        g_lightPos[1] = newY;
        renderAllShapes();
    }
});

document.getElementById('lightSlideZ').addEventListener('mousemove', function(ev){
    if(ev.buttons == 1) {
      userControlLight = true;
        let newZ = (this.value / 100) * roomSize;
        newZ = Math.max(pad, Math.min(newZ, roomSize - pad));
        g_lightPos[2] = newZ;
        renderAllShapes();
    }
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

  let lastX = null;
  let lastY = null;

  canvas.onmousemove = function(ev){
 
    if (ev.buttons === 1) { 
        if (lastX !== null && lastY !== null) {
            let dx = ev.clientX - lastX;
            let dy = ev.clientY - lastY;
            g_camera.panLeft(-dx * 0.2);
            g_camera.pitch(-dy * 0.2);s
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




let freqX = 0.25 + Math.random() * 0.2;
let freqY = 0.15 + Math.random() * 0.2;
let freqZ = 0.2 + Math.random() * 0.2;
let phaseX = Math.random() * 2 * Math.PI;
let phaseY = Math.random() * 2 * Math.PI;
let phaseZ = Math.random() * 2 * Math.PI;


function tick() {
  lightTime += 0.012;

  if (!userControlLight) {
      const pad = 0.5;
      const safeDist = 1.5;
      let x, y, z;
      let tries = 0;

      do {
          x = pad + (roomSize - 2*pad)/2 + (roomSize - 2*pad)/2 * Math.sin(freqX * lightTime + phaseX);
          z = pad + (roomSize - 2*pad)/2 + (roomSize - 2*pad)/2 * Math.cos(freqZ * lightTime + phaseZ);
          y = pad + (roomHeight - 2*pad)/2 + (roomHeight - 2*pad)/2 * Math.sin(freqY * lightTime + phaseY);

          tries++;
          let dxSphere = x - roomSize/2;
          let dzSphere = z - roomSize/2;
          let distSphere = Math.sqrt(dxSphere*dxSphere + dzSphere*dzSphere);

          let distAnimal = 0;
          if (g_startAnimal) {
              let ax = g_startAnimal.globalMatrix.elements[12];
              let az = g_startAnimal.globalMatrix.elements[14];
              distAnimal = Math.sqrt((x - ax)*(x - ax) + (z - az)*(z - az));
          }

          if (distSphere < safeDist || distAnimal < safeDist) {
              phaseX += 0.1;
              phaseZ += 0.1;
          } else {
              break;
          }

      } while (tries < 10);

      g_lightPos[0] = x;
      g_lightPos[1] = y;
      g_lightPos[2] = z;
  }

  renderAllShapes();
  requestAnimationFrame(tick);
}

var g_map = [];


for (let x = 0; x < roomSize; x++) {
  g_map[x] = [];
  for (let z = 0; z < roomSize; z++) {
      g_map[x][z] = 0;
  }
}
let treasureX = 5;
let treasureZ = 5;
let treasureY = 0.5;
let treasureFound = false;


function placeStartingAnimal() {
  g_startAnimal = new Animal(gl);
  g_startAnimal.globalMatrix = new Matrix4();
  g_startAnimal.globalMatrix.setIdentity();

  let x = 3;   // left wall
  let y = 1;    // above the floor
  let z = 5;    // back wall
  g_startAnimal.globalMatrix.translate(x, y, z);
  let angleY = 0;
  g_startAnimal.globalMatrix.rotate(angleY, 0, 1, 0);
}

function drawRoom() {
  let floor = new Cube();
  floor.textureNum = g_normalOn ? -3 : -2;
  floor.color = [0.02, 0.20, 0.05, 1];
  floor.matrix.setTranslate(roomSize / 2, 0, roomSize / 2);
  floor.matrix.scale(roomSize, 0.2, roomSize);
  floor.matrix.translate(-0.5, -0.5, -0.5);
  floor.normalMatrix = new Matrix4();
  floor.normalMatrix.setInverseOf(floor.matrix).transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, floor.normalMatrix.elements);
  gl.uniform1i(u_whichTexture, floor.textureNum);
  gl.uniform4fv(u_FragColor, floor.color);
  floor.renderfaster();

  let ceiling = new Cube();
  ceiling.textureNum = g_normalOn ? -3 : 0;
  ceiling.color = [0.8, 0.8, 0.8, 1];
  ceiling.matrix.setTranslate(roomSize / 2, roomHeight, roomSize / 2);
  ceiling.matrix.scale(roomSize, 0.2, roomSize);
  ceiling.matrix.translate(-0.5, -0.5, -0.5);
  ceiling.normalMatrix = new Matrix4();
  ceiling.normalMatrix.setInverseOf(ceiling.matrix).transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, ceiling.normalMatrix.elements);
  gl.uniform1i(u_whichTexture, ceiling.textureNum);
  gl.uniform4fv(u_FragColor, ceiling.color);
  ceiling.renderfaster();

  let walls = [
      {x: roomSize, z: roomSize / 2, sx: 0.2, sz: roomSize},
      {x: 0, z: roomSize / 2, sx: 0.2, sz: roomSize},
      {x: roomSize / 2, z: roomSize, sx: roomSize, sz: 0.2},
      {x: roomSize / 2, z: 0, sx: roomSize, sz: 0.2}
  ];

  for (let i = 0; i < walls.length; i++) {
      let w = new Cube();
      w.textureNum = g_normalOn ? -3 : 1;
      w.color = [0.8, 0.8, 0.8, 1];
      w.matrix.setTranslate(walls[i].x, roomHeight / 2, walls[i].z);
      w.matrix.scale(walls[i].sx, roomHeight, walls[i].sz);
      w.matrix.translate(-0.5, -0.5, -0.5);
      w.normalMatrix = new Matrix4();
      w.normalMatrix.setInverseOf(w.matrix).transpose();
      gl.uniformMatrix4fv(u_NormalMatrix, false, w.normalMatrix.elements);
      gl.uniform1i(u_whichTexture, w.textureNum);
      w.renderfaster();
  }
}

function drawObjects() {
  let sp = new Sphere();
  sp.textureNum = g_normalOn ? -3 : 0;
  sp.matrix.setTranslate(roomSize / 2, 1, roomSize / 2);

  sp.normalMatrix = new Matrix4();
  sp.normalMatrix.setInverseOf(sp.matrix).transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, sp.normalMatrix.elements);

  gl.uniform1i(u_whichTexture, sp.textureNum);
  sp.render();

  let lightCube = new Cube();
lightCube.color = [1.0, 1.0, 0.0, 1.0];

lightCube.matrix.setIdentity();
lightCube.matrix.setTranslate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
lightCube.matrix.scale(0.2, 0.2, 0.2);
lightCube.matrix.translate(-0.5, -0.5, -0.5);

lightCube.normalMatrix = new Matrix4();
lightCube.normalMatrix.setInverseOf(lightCube.matrix).transpose();
gl.uniformMatrix4fv(u_NormalMatrix, false, lightCube.normalMatrix.elements);


lightCube.textureNum = -4;
lightCube.color = [1.0, 1.0, 0.2, 1.0];
lightCube.renderfaster();

 
}

function renderAllShapes() {

  if (!g_camera || !g_camera.eye || !g_camera.at || !g_camera.eye.elements || !g_camera.at.elements) {
    return;
  }

  var startTime = performance.now();

  var projMat = new Matrix4();
  projMat.setPerspective(90, canvas.width / canvas.height, 0.1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  var viewMat = new Matrix4();
  viewMat.setLookAt(
      g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
      g_camera.at.elements[0],  g_camera.at.elements[1],  g_camera.at.elements[2],
      g_camera.up.elements[0],  g_camera.up.elements[1],  g_camera.up.elements[2]
  );
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  gl.uniform3f(u_cameraPos,
               g_camera.eye.elements[0],
               g_camera.eye.elements[1],
               g_camera.eye.elements[2]);
  gl.uniform1i(u_lightOn, g_lightOn);


  gl.uniform1i(u_spotLightOn, g_spotLightOn ? 1 : 0);
gl.uniform3f(u_spotLightPos, g_spotLightPos[0], g_spotLightPos[1], g_spotLightPos[2]);
gl.uniform3f(u_spotLightDir, g_spotLightDir[0], g_spotLightDir[1], g_spotLightDir[2]);
gl.uniform1f(u_spotCutoff, g_spotCutoff);

  gl.uniform1f(u_Alpha, 1.0);
  drawRoom();
  drawMap();

  drawObjects();

  if (g_startAnimal) {
      g_startAnimal.showNormals = g_normalOn;
      g_startAnimal.render(g_startAnimal.globalMatrix);
  }

 
}


function placeTreasureSafely() {
  let x, z;
  let distSphere;
  let distAnimal;

  do {
      x = Math.floor(Math.random() * roomSize);
      z = Math.floor(Math.random() * roomSize);

      // distance from sphere
      let dxSphere = x - roomSize/2;
      let dzSphere = z - roomSize/2;
      distSphere = Math.sqrt(dxSphere*dxSphere + dzSphere*dzSphere);

      // distance from animal
      distAnimal = 999;
      if (g_startAnimal) {
          let ax = g_startAnimal.globalMatrix.elements[12];
          let az = g_startAnimal.globalMatrix.elements[14];

          distAnimal = Math.sqrt(
              (x - ax) * (x - ax) +
              (z - az) * (z - az)
          );
      }

  } while (
      g_map[x][z] > 0 ||
      distSphere < 2 ||
      distAnimal < 2
  );

  treasureX = x;
  treasureZ = z;
  treasureY = 0.5;
  treasureFound = false;
}

function canPlaceLight(x, z) {
  let gridX = Math.floor(x);
  let gridZ = Math.floor(z);

  // make sure it's inside the room
  if(gridX < 0 || gridX >= roomSize || gridZ < 0 || gridZ >= roomSize) return false;

  // check map for walls
  if(g_map[gridX][gridZ] > 0) return false;

  return true;
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

  if (g_normalOn) {
      mapCube.textureNum = -3;
  } else {
      mapCube.textureNum = 1;
  }
  mapCube.color = [0.8, 0.8, 0.8, 1];
  gl.uniform1f(u_texColorWeight, 0.5);

  for (let x = 0; x < roomSize; x++) {
      for (let z = 0; z < roomSize; z++) {
          let height = g_map[x][z];
          for (let h = 0; h < height; h++) {
              mapMatrix.setTranslate(x, h, z);
              mapMatrix.scale(1, 1, 1);
              mapCube.matrix = mapMatrix;
              mapCube.normalMatrix.setInverseOf(mapCube.matrix).transpose();
              gl.uniformMatrix4fv(u_NormalMatrix, false, mapCube.normalMatrix.elements);
              mapCube.renderfaster();
          }
      }
  }

  if (!treasureFound) {
      mapMatrix.setTranslate(treasureX + 0.5, treasureY, treasureZ + 0.5);
      mapMatrix.scale(0.5, 0.5, 0.5);
      mapCube.matrix = mapMatrix;

      if (g_normalOn) {
          mapCube.textureNum = -3;
      } else {
          mapCube.textureNum = 2;
      }

      gl.uniform1i(u_whichTexture, mapCube.textureNum);
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, g_cheeseTexture);

      mapCube.color = [1, 1, 0, 1];
      gl.uniform1f(u_texColorWeight, 1.0);
      mapCube.normalMatrix.setInverseOf(mapCube.matrix).transpose();
      gl.uniformMatrix4fv(u_NormalMatrix, false, mapCube.normalMatrix.elements);

      mapCube.renderfaster();

      let dx = g_camera.eye.elements[0] - (treasureX + 0.5);
      let dz = g_camera.eye.elements[2] - (treasureZ + 0.5);
      //let dist = Math.sqrt(dx*dx + dz*dz);

  }
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
  
    if(ev.keyCode==39){
      g_camera. panRight() ;
    } else
    if (ev.keyCode == 37) {// left arrow
    g_camera.panLeft();
    }
    if(ev. keyCode == 87) { g_camera.forward();}
    if(ev.keyCode == 83) {g_camera.backward(); }
    if(ev.keyCode == 65) {g_camera.left(); }
    if (ev.keyCode == 68) {g_camera.right(); }
    if (ev.keyCode == 81) {g_camera.panLeft(); }
    if(ev.keyCode == 69) { g_camera.panRight(); }
    renderAllShapes();
    console.log(ev.keyCode);
  
}


var g_camera = new Camera();

g_camera.eye = new Vector3([roomSize / 2, 2, roomSize - 2]);
g_camera.at  = new Vector3([roomSize / 2, 2, roomSize / 2]);
g_camera.up  = new Vector3([0, 1, 0]);


function main() {
    setupWebGL();
    connectVariablesToGLS();
    addActionsForHtmlUI();
    initTextures();

    placeTreasureSafely();  

    document.onkeydown = keydown;
    
    g_camera.eye = new Vector3([roomSize / 2, 2, roomSize - 2]);
    g_camera.at  = new Vector3([roomSize / 2, 2, roomSize / 2]);
    g_camera.up  = new Vector3([0, 1, 0]);

    requestAnimationFrame(tick);

}
 