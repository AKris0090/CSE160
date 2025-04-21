// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  `attribute vec4 a_Position;
  attribute vec4 a_Normal;

  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  varying vec3 v_normalOut;

  void main() {
    v_normalOut = mat3(u_GlobalRotateMatrix * u_ModelMatrix) * a_Normal.xyz;
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;

  }`

// Fragment shader program
var FSHADER_SOURCE =
  `precision mediump float;
  const vec3 u_lightPos = normalize(vec3(5, -5, 15));

  varying mediump vec3 v_normalOut;
  uniform vec4 u_FragColor;

  void main() {
    mediump float nDotL = max(0.5, dot(normalize(v_normalOut), u_lightPos.xyz));
    gl_FragColor = vec4(u_FragColor.xyz * vec3(nDotL), 1.0);
  }`

let canvas;
let gl;
let a_Position;
let a_Normal;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let angleX = 0;
let angleY = 0;
let g_lastX = 0;
let g_lastY = 0;
let g_Zoom = 10;

let g_ViewProjection = new Matrix4();
let g_globalRotateMatrix;
let g_vulture;

let g_animated = false;
let g_cameraAngle = 0;

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

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
  // if (!u_FragColor) {
  //   console.log('Failed to get the storage location of u_FragColor');
  //   return;
  // }

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
  document.getElementById('angleSlider').addEventListener('mousemove', function() { g_cameraAngle = this.value; renderAllShapes(); });
  document.getElementById('topBeakSlider').addEventListener('mousemove', function() { g_topBeakAngle = this.value; renderAllShapes(); });
  document.getElementById('bottomBeakSlider').addEventListener('mousemove', function() { g_bottomBeakAngle = this.value; renderAllShapes(); });
  document.getElementById('wingSlider').addEventListener('mousemove', function() { g_leftWingAngle = this.value; renderAllShapes(); });
  document.getElementById('elbowSlider').addEventListener('mousemove', function() { g_elbowAngle = this.value; renderAllShapes(); });
  document.getElementById('handSlider').addEventListener('mousemove', function() { g_wristAngle = this.value; renderAllShapes(); });

  document.getElementById('headSlider').addEventListener('mousemove', function() { g_headAngle = this.value; renderAllShapes(); });

  document.getElementById('start').onclick = function() { g_animated = true; g_startTime = performance.now() / 1000.0; };
  document.getElementById('stop').onclick = function() { g_animated = false; };
}

// could not be bothered calculating these myself
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

function createAttachCubeVertexBuffer() {
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

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  createAttachCubeVertexBuffer();
  addActionsForHtmlUI();

  canvas.addEventListener('mousedown', function(ev) {
    g_lastX = ev.x;
    g_lastY = ev.y;
  })

  canvas.addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {
    var scale = 0.2;
    angleX += (ev.x - g_lastX) * scale;
    angleY += (ev.y - g_lastY) * scale;
    g_lastX = ev.x;
    g_lastY = ev.y;
    renderAllShapes();
  }})

  canvas.addEventListener('wheel', function(ev) {
    g_Zoom += ev.mouseWheelDelta;
  })

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  //requestAnimationFrame(tick);

  g_globalRotateMatrix = new Matrix4();
  g_ViewProjection.setPerspective(75, canvas.width/canvas.height, 0.1, 1000);
  g_vulture = new Vulture();
  renderAllShapes();
}

function clearCanvas() {
  g_points = [];
  renderAllShapes();
}

function renderAllShapes() {
  var startTime = performance.now();
  g_seconds = performance.now() / 1000.0 - g_startTime;

  // if(g_animated) updateAnimation();
  var cameraMatrix = new Matrix4();
  cameraMatrix.translate(0, 0, -g_Zoom);
  cameraMatrix.rotate(angleY, 1, 0, 0);
  cameraMatrix.rotate(angleX, 0, 1, 0);
  cameraMatrix.translate(0, 0, 0);

  var finalMat = new Matrix4().set(g_ViewProjection);
  finalMat.multiply(cameraMatrix);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, finalMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  g_vulture.render();

  var duration = performance.now() - startTime;
  sendTextToHTML("ms: " + duration.toFixed(2) + " fps: " + (1000/duration).toFixed(2));
}

function tick() {
  renderAllShapes();

  requestAnimationFrame(tick);
}


function sendTextToHTML(text) {
  var output = document.getElementById("output");
  output.innerHTML = text;
}
