// Credits to Zachary Messer's project for some major inspiration, especially with the idea of using perspective for the camera and adding a little bit of normal-based lighting
// Perspective code is already in cuon-matrix-cse160.js anyway, so I just used those functions/matrices.
var VSHADER_SOURCE =
  `attribute vec4 a_Position;
  attribute vec4 a_Normal;

  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  varying vec3 v_normalOut;

  void main() {
    v_normalOut = mat3(u_ModelMatrix) * a_Normal.xyz;
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

var FSHADER_SOURCE =
  `precision mediump float;
  const vec3 u_lightPos = normalize(vec3(10, -30, -25));

  varying mediump vec3 v_normalOut;
  uniform vec4 u_FragColor;

  void main() {
    mediump float nDotL = max(0.4, dot(normalize(v_normalOut.xyz), u_lightPos.xyz));
    gl_FragColor = vec4(u_FragColor.xyz * vec3(nDotL), 1.0);
  }`

let canvas;
let gl;

let a_Position;
let a_Normal;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

let g_lastX = 0;
let g_lastY = 0;

let g_ViewProjection = new Matrix4();
let g_globalRotateMatrix;
let g_vulture;
let g_area;
let g_bone;
let g_paused = false;
let g_centeredCamera = false;

let g_currentTime = -1;
let g_time = -1;

let angleX = 55.8;
let angleY = 13.8;
let g_lookAtX = -20;
let g_lookAtY = 6;
let g_lookAtZ = 0;
let g_Zoom = 7.33;

let upTop = false;

var g_startTime = performance.now() / 1000.0;

function setupWebGL() {
    canvas = document.getElementById('webgl');

    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
    if (!gl) {
      console.log('Failed to get the rendering context for WebGL');
      return;
    }

    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if(a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Storage location of camera matrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }
}

function addActionsForHtmlUI() {
  // holy moly
  document.getElementById('wingSlider')?.addEventListener('mousemove', function() { g_leftWingAngle = this.value;});
  document.getElementById('handXSlider').addEventListener('mousemove', function() { g_leftRightWing = this.value;});
  document.getElementById('wingFrontBackSlider').addEventListener('mousemove', function() { g_wingFrontBackAngle = this.value; });
  document.getElementById('tailSlider').addEventListener('mousemove', function() { g_tailAngle = this.value; });

  document.getElementById('topBeakSlider').addEventListener('mousemove', function() { g_topBeakAngle = this.value; });
  document.getElementById('bottomBeakSlider').addEventListener('mousemove', function() { g_bottomBeakAngle = this.value; });

  document.getElementById('bodyAngleXSlider')?.addEventListener('mousemove', function() { g_xWing = this.value; });
  document.getElementById('bodyAngleYSlider')?.addEventListener('mousemove', function() { g_yWing = this.value; });
  document.getElementById('bodyAngleZSlider')?.addEventListener('mousemove', function() { g_zWing = this.value; });

  document.getElementById('bodyXSlider')?.addEventListener('mousemove', function() { g_X = this.value; });
  document.getElementById('bodyYSlider')?.addEventListener('mousemove', function() { g_Y = this.value; });
  document.getElementById('bodyZSlider')?.addEventListener('mousemove', function() { g_Z = this.value; });

  document.getElementById('headSlider')?.addEventListener('mousemove', function() { g_headX = this.value; });
  document.getElementById('headYSlider')?.addEventListener('mousemove', function() { g_headY = this.value; });

  document.getElementById('rightLegXSlider').addEventListener('mousemove', function() { g_rightLegXAngle = this.value; });
  document.getElementById('rightLegYSlider').addEventListener('mousemove', function() { g_rightLegYAngle = this.value; });
  document.getElementById('rightShinXSlider').addEventListener('mousemove', function() { g_rightShinXAngle = this.value; });
  document.getElementById('rightFootAngle').addEventListener('mousemove', function() { g_rightFootAngle = this.value; });
  document.getElementById('rightToeSlider').addEventListener('mousemove', function() { g_rightToeAngle = this.value; });

  document.getElementById('leftLegXSlider').addEventListener('mousemove', function() { g_leftLegXAngle = this.value; });
  document.getElementById('leftLegYSlider').addEventListener('mousemove', function() { g_leftLegYAngle = this.value; });
  document.getElementById('leftShinXSlider').addEventListener('mousemove', function() { g_leftShinXAngle = this.value; });
  document.getElementById('leftFootAngle').addEventListener('mousemove', function() { g_leftFootAngle = this.value; });
  document.getElementById('leftToeSlider').addEventListener('mousemove', function() { g_leftToeAngle = this.value; });

  document.getElementById('pauseButton').onclick = function() { g_paused = true; };
  document.getElementById('resumeButton').onclick = function() { g_paused = false; };
  document.getElementById('focusButton').onclick = function() { g_centeredCamera = false; };
  document.getElementById('centerButton').onclick = function() { g_centeredCamera = true; };
}

// could not be bothered calculating these myself LOL - math from the textbook on calculating normals of a triangle
function createCubeNormals() {
  let out = [];
  for(var i = 0; i < cubeVertices.length; i+= 9) {
    var vec1 = new Vector3([cubeVertices[i], cubeVertices[i + 1], cubeVertices[i + 2]]);
    var vec2 = new Vector3([cubeVertices[i + 3], cubeVertices[i + 4], cubeVertices[i + 5]]);
    var vec3 = new Vector3([cubeVertices[i + 6], cubeVertices[i + 7], cubeVertices[i + 8]]);

    var cross = Vector3.cross((vec2.sub(vec1)), (vec3.sub(vec1))).normalize();
    out.push(cross.elements[0]);
    out.push(cross.elements[1]);
    out.push(cross.elements[2]);
    out.push(cross.elements[0]);
    out.push(cross.elements[1]);
    out.push(cross.elements[2]);
    out.push(cross.elements[0]);
    out.push(cross.elements[1]);
    out.push(cross.elements[2]);
  }
  return out;
}

let g_icoVerts = [];

function addVertsFromIndices(tIndices) {
  for(let j = 0; j < 3; j++) {
    for(let k = 0; k < 3; k++) {
      cubeArray.push(g_icoVerts[tIndices[j]][k]);
    }
  }
}

// http://blog.andreaskahler.com/2009/06/creating-icosphere-mesh-in-code.html
function addIcoSphereVertices() {
  var t = (1.0 + Math.sqrt(5.0)) / 2.0;

  g_icoVerts.push([-1,  t,  0]);
  g_icoVerts.push([ 1,  t,  0]);
  g_icoVerts.push([-1, -t,  0]);
  g_icoVerts.push([ 1, -t,  0]);
  g_icoVerts.push([ 0, -1,  t]);
  g_icoVerts.push([ 0,  1,  t]);
  g_icoVerts.push([ 0, -1, -t]);
  g_icoVerts.push([ 0,  1, -t]);
  g_icoVerts.push([ t,  0, -1]);
  g_icoVerts.push([ t,  0,  1]);
  g_icoVerts.push([-t,  0, -1]);
  g_icoVerts.push([-t,  0,  1]);

  addVertsFromIndices([11, 0, 5]);
  addVertsFromIndices([5, 0, 1]);
  addVertsFromIndices([1, 0, 7]);
  addVertsFromIndices([7, 0, 10]);
  addVertsFromIndices([10, 0, 11]);
  addVertsFromIndices([5, 1, 9]);
  addVertsFromIndices([11, 5, 4]);
  addVertsFromIndices([10, 11, 2]);
  addVertsFromIndices([7, 10, 6]);
  addVertsFromIndices([1, 7, 8]);
  addVertsFromIndices([9, 3, 4]);
  addVertsFromIndices([4, 3, 2]);
  addVertsFromIndices([2, 3, 6]);
  addVertsFromIndices([6, 3, 8]);
  addVertsFromIndices([8, 3, 9]);
  addVertsFromIndices([9, 4, 5]);
  addVertsFromIndices([4, 2, 11]);
  addVertsFromIndices([2, 6, 10]);
  addVertsFromIndices([6, 8, 7]);
  addVertsFromIndices([8, 9, 1]);
}

function createAttachCubeVertexBuffer() {
  addIcoSphereVertices();
  cubeVertices = new Float32Array(cubeArray);
  
  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  var normalBuffer = gl.createBuffer();
  if(!normalBuffer) {
    console.log("Failed to create the normal buffer object");
    return -1;
  }
  
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertices), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  let normalsArray = createCubeNormals();

  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalsArray), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);

  // Enable assignment to a_Normal variable;
  gl.enableVertexAttribArray(a_Normal);
}

// animations are queued in reverse, since the current animation is popped off the back
function flyUp() {
  // turnaround at top
  g_vulture.queuedAnims.push(reset);
  g_vulture.queuedAnims.push(landTurn);
  g_vulture.queuedAnims.push(threeFourthsBuffer);
  g_vulture.queuedAnims.push(oneFourthsBuffer);
  g_vulture.queuedAnims.push(flyUpTurn);
  g_vulture.queuedAnims.push(startTurn);

  g_vulture.queuedAnims.push(moveReset);
  g_vulture.queuedAnims.push(moveFlapping);
  g_vulture.queuedAnims.push(moveSetLeg);
  g_vulture.queuedAnims.push(moveLand);
  g_vulture.queuedAnims.push(moveBuffer);
  g_vulture.queuedAnims.push(moveTilt);
  g_vulture.queuedAnims.push(moveQuarter);
  g_vulture.queuedAnims.push(moveCrateQuarter);
  g_vulture.queuedAnims.push(jumpOff);
  g_vulture.queuedAnims.push(startFlight);

  upTop = true;
}

function flyDown() {
  g_vulture.queuedAnims.push(reset2);
  g_vulture.queuedAnims.push(landTurn2);
  g_vulture.queuedAnims.push(threeFourthsBuffer2);
  g_vulture.queuedAnims.push(oneFourthsBuffer2);
  g_vulture.queuedAnims.push(flyUpTurn2);
  g_vulture.queuedAnims.push(startTurn2);

  g_vulture.queuedAnims.push(moveReset);
  g_vulture.queuedAnims.push(backResetBody);
  g_vulture.queuedAnims.push(backImpact);
  g_vulture.queuedAnims.push(backLand);
  g_vulture.queuedAnims.push(backBuffer1);
  g_vulture.queuedAnims.push(backFlapping);
  g_vulture.queuedAnims.push(backRotate);
  g_vulture.queuedAnims.push(jumpReturn);
  g_vulture.queuedAnims.push(startReturn);

  upTop = false;
}

function boneAnim() {
  g_vulture.queuedAnims.push(resetBone);
  g_vulture.queuedAnims.push(tiltDown);
  g_vulture.queuedAnims.push(tiltUp);

  g_vulture.queuedAnims.push(secondPause);
  g_vulture.queuedAnims.push(tiltDown);
  g_vulture.queuedAnims.push(tiltUp);

  g_vulture.queuedAnims.push(secondPause);
  g_vulture.queuedAnims.push(tiltDown);
  g_vulture.queuedAnims.push(tiltUp);

  g_vulture.queuedAnims.push(pickup);
  g_vulture.queuedAnims.push(secondPause);
  g_vulture.queuedAnims.push(bendForPickup);

  g_bone.queuedAnims.push(bonePause);
  g_bone.queuedAnims.push(down3);
  g_bone.queuedAnims.push(up3);

  g_bone.queuedAnims.push(bonePause);
  g_bone.queuedAnims.push(down2);
  g_bone.queuedAnims.push(up2);

  g_bone.queuedAnims.push(bonePause);
  g_bone.queuedAnims.push(down);
  g_bone.queuedAnims.push(up);
  
  g_bone.queuedAnims.push(throwUp);
  g_bone.queuedAnims.push(delay);
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  createAttachCubeVertexBuffer();
  addActionsForHtmlUI();

  canvas.addEventListener('contextmenu', function(ev) {
    if(ev.buttons == 2) {
      ev.preventDefault();
    }
  });

  canvas.addEventListener('mousedown', function(ev) {
    g_lastX = ev.x;
    g_lastY = ev.y;

    if(ev.buttons == 1 && ev.shiftKey) {
      if(!upTop && !g_moving && !g_boneMoving) {
        g_moving = true;
        g_boneMoving = true;

        g_boneX = -8;
        g_boneY = -2;
        g_boneZ = 0;
        g_boneAngleX = 180;
        g_boneAngleY = 0;
        g_boneAngleZ = 0;

        boneAnim();
      }
    } 

    if(ev.buttons == 2 && g_moving === false) {
      if(upTop) {
        g_moving = true;
        g_vulture.queuedAnims = [];
        currentAnim = null;
        flyDown();
      } else {
        g_moving = true;
        g_vulture.queuedAnims = [];
        currentAnim = null;
        flyUp();
      }
    }


  })

  canvas.addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {
    var scale = 0.2;
    angleX += (ev.x - g_lastX) * scale;
    angleY += (ev.y - g_lastY) * scale;
    g_lastX = ev.x;
    g_lastY = ev.y;
  }})

  canvas.addEventListener('wheel', function(ev) {
    ev.preventDefault();
    g_Zoom += ev.deltaY / 100;
  })
  

  // // Specify the color for clearing <canvas>
  // gl.clearColor(150/255,226/255,238/255, 1.0);
  gl.clearColor(0, 0, 0, 1.0);

  g_globalRotateMatrix = new Matrix4();
  // perspective matrix using cuon-matrix lib
  g_ViewProjection.setPerspective(90, canvas.width/canvas.height, 0.1, 1000);
  g_vulture = new Vulture();
  g_area = new Area();
  g_bone = new Bone();
  
  requestAnimationFrame(tick);
}

let g_pauseTime;

function renderAllShapes() {
  let now = performance.now();
  let nowSeconds = now / 1000;
  g_time = nowSeconds;

  let frameTime = now - g_startTime;
  if(!g_paused) {
    g_currentTime = nowSeconds;
    g_pauseTime = g_currentTime;
  }

  // https://stackoverflow.com/questions/21603412/algorithm-3d-orbiting-camera-control-with-mouse-drag
  
  var cameraMatrix = new Matrix4();
  // view matrix using xy angle and zoom
  cameraMatrix.translate(0, 0, -g_Zoom).rotate(angleY, 1, 0, 0).rotate(angleX, 0, 1, 0)
  if(g_centeredCamera) {
    cameraMatrix.translate(-g_lookAtX, -g_lookAtY, -g_lookAtZ);
  } else {
    cameraMatrix.translate(-g_X + 2.5, -g_Y, -g_Z);
  }

  // get vp matrix by multiplying them, and multiply by model in shader
  var finalMat = new Matrix4().set(g_ViewProjection);
  finalMat.multiply(cameraMatrix);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, finalMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  g_area.render();
  g_vulture.render();
  if(g_boneMoving) {
    g_bone.render();
  }

  sendTextToHTML("ms: " + frameTime.toFixed(2) + " fps: " + (1000/frameTime).toFixed(2));

  g_startTime = now;
}

function tick() {
  renderAllShapes();

  requestAnimationFrame(tick);
}


function sendTextToHTML(text) {
  var output = document.getElementById("output");
  output.innerHTML = text;
}
