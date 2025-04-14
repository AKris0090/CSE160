// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  `attribute vec4 a_Position;
  uniform float u_pointSize;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_pointSize;
  }`

// Fragment shader program
var FSHADER_SOURCE =
  `precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`


const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_pointSize;

let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 8;
let g_selectedType = POINT;
let g_selectedSegments = 6;

let playingGame = false;

let gun;
let t1;
let t2;
let t3;

var g_points = [];

function setupWebGL() {
    canvas = document.getElementById('webgl');

    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
    if (!gl) {
      console.log('Failed to get the rendering context for WebGL');
      return;
    }
}

function connectVariablesToGLSL() {
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

  u_pointSize = gl.getUniformLocation(gl.program, 'u_pointSize');
  if (!u_pointSize) {
    console.log('Failed to get the storage location of u_pointSize');
    return;
  }
}

function addActionsForHtmlUI() {
  document.getElementById('redSlider').addEventListener('mouseup', function() { g_selectedColor[0] = this.value; });
  document.getElementById('greenSlider').addEventListener('mouseup', function() { g_selectedColor[1] = this.value; });
  document.getElementById('blueSlider').addEventListener('mouseup', function() { g_selectedColor[2] = this.value; });
  document.getElementById('segmentSlider').addEventListener('mouseup', function() { g_selectedSegments = this.value; });

  document.getElementById('pointButton').onclick = function() { g_selectedType = POINT; };
  document.getElementById('triangleButton').onclick = function() { g_selectedType = TRIANGLE; };
  document.getElementById('circleButton').onclick = function() { g_selectedType = CIRCLE; };
  document.getElementById('birdButton').onclick = function() { drawBird(); };

  document.getElementById('boringButton').onclick = function() { startGunGame(); };
  document.getElementById('drawButton').onclick = function() { regularDrawing(); };

  document.getElementById('sizeSlider').addEventListener('mouseup', function() { g_selectedSize = this.value; });
}

function clearCanvas() {
  g_points = [];
  renderAllShapes();
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  regularDrawing();
}

function regularDrawing() {
  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = function(ev){ click(ev) };
  canvas.onmousemove = function(ev) { if(ev.buttons ==1) click(ev) };

  playingGame = false;
  clearCanvas();
}

function click(ev) {
  if(playingGame) {
    return;
  }
  [x, y] = convertCoordinatesEventToGL(ev);

  let shape;
  if (g_selectedType == POINT) {
    shape = new Point([x, y].slice(), g_selectedColor.slice(), g_selectedSize);
  }
  else if (g_selectedType == TRIANGLE) {
    shape = new Triangle([x, y].slice(), g_selectedColor.slice(), g_selectedSize);
  } else if (g_selectedType == CIRCLE) {
    shape = new Circle([x, y].slice(), g_selectedColor.slice(), g_selectedSize, g_selectedSegments);
  }
  g_points.push(shape);

  renderAllShapes();
}

function drawBird() {
  if(playingGame) {
    regularDrawing();
  }
  let bird = new Bird();
  g_points.push(bird);
  bird.render();
}

function getRandomPair() {
  let x = Math.random() * 2 - 1;
  let y = Math.random() * 2 - 1;
  return [x, y];
}

function startRoundTargets() {
  clearCanvas();

  t1 = new Target(getRandomPair(), 8);
  t2 = new Target(getRandomPair(), 8);
  t3 = new Target(getRandomPair(), 8);

  g_points.push(t1);
  g_points.push(t2);
  g_points.push(t3);

  gun = new Gun();
  g_points.push(gun);
}

let count = 0;

function checkAllTargets(xy) {
  if(t1?.checkHit(xy)) {
    count++;
    t1 = null;
    g_points[0] = null;
  }
  if(t2?.checkHit(xy)) {
    count++;
    t2 = null;
    g_points[1] = null;
  }
  if(t3?.checkHit(xy)) {
    count++;
    t3 = null;
    g_points[2] = null;
  }
  if(count >= 3) {
    count = 0;
    startRoundTargets();
  }
}

function startGunGame() {
  playingGame = true;

  startRoundTargets();
  muzzleFlash.active = false;
  muzzleFlash.timer = 0;
  muzzleFlash.one = false;
  muzzleFlash.two = false;
  muzzleFlash.three = false;
  canvas.onmousemove = function(ev) { gun.updateGunPos(convertCoordinatesEventToGL(ev)); }
  canvas.onmousedown = function(ev) { if(muzzleFlash.active == false) { muzzleFlash.active = true;
                                      muzzleFlash.timer = muzzleFlash.maxTimer;}
                                      checkAllTargets(convertCoordinatesEventToGL(ev)); }; 
  requestAnimationFrame(gameLoop);
}

function gameLoop() {
  renderAllShapes();
  if(playingGame) {
    requestAnimationFrame(gameLoop);
  }
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX;
  var y = ev.clientY;
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return ([x, y]);
}

function renderAllShapes() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_points.length;
  for(var i = 0; i < len; i++) {
    var p = g_points[i];
    if(p == null) {
      continue;
    }
    p.render();
  }
}
