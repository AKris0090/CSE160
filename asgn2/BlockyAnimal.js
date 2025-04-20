// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  `attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE =
  `precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

let g_points = [];
let g_animated = false;
let g_cameraAngle = 0;

let g_magentaAngle = -5;
let g_yellowAngle = -5;

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

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Storage location of camera matrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }
}

function addActionsForHtmlUI() {
  document.getElementById('yellowSlider').addEventListener('mousemove', function() { g_magentaAngle = this.value; renderAllShapes(); });
  document.getElementById('angleSlider').addEventListener('mousemove', function() { g_cameraAngle = this.value; renderAllShapes(); });

  document.getElementById('start').onclick = function() { g_animated = true; g_startTime = performance.now() / 1000.0; };
  document.getElementById('stop').onclick = function() { g_animated = false; };
}

function createAttachCubeVertexBuffer() {
    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }
  
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertices), gl.DYNAMIC_DRAW);
    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  
    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  createAttachCubeVertexBuffer();
  addActionsForHtmlUI();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  requestAnimationFrame(tick);
}

function updateAnimation() {
  if (g_animated) {
    g_yellowAngle = 45 * Math.sin(g_seconds);
  }
}

function clearCanvas() {
  g_points = [];
  renderAllShapes();
}

function renderAllShapes() {
  var startTime = performance.now();
  g_seconds = performance.now() / 1000.0 - g_startTime;

  if(g_animated) updateAnimation();

  var globalRotateMatrix = new Matrix4().rotate(g_cameraAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotateMatrix.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var body = new Cube();
  body.m_color = [1.0, 0.0, 0.0, 1.0];
  body.m_matrix.setTranslate(-.25, -.75, 0.0);
  body.m_matrix.rotate(-5, 1, 0, 0);
  body.m_matrix.scale(0.5, .3, 0.5);
  body.render();
  
  var arm = new Cube();
  arm.m_color = [1.0, 1.0, 0.0, 1.0];
  arm.m_matrix.setTranslate(0, -.5, 0.0);
  arm.m_matrix.rotate(g_yellowAngle, 1, 0, 0);
  var yellowMat = new Matrix4(arm.m_matrix);
  arm.m_matrix.scale(0.25, .7, 0.5);
  arm.m_matrix.translate(-.5, 0, 0);
  arm.render();

  var box = new Cube();
  box.m_matrix = yellowMat;
  box.m_color = [1.0, 0.0, 1.0, 1.0];
  box.m_matrix.translate(0, 0.65, 0);
  box.m_matrix.rotate(g_magentaAngle, 0, 0, 1);
  box.m_matrix.scale(0.3, .3, 0.3);
  box.m_matrix.translate(-.5, 0, -0.0001);
  box.render();

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
