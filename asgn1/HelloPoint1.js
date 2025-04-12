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

let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_pointSize;

let g_selectedColor = [0.0, 0.0, 0.0, 1.0];
let g_size = 1;

var g_points = [];

class Point {
  m_pos = [];
  m_color = [];
  m_size = 1;

  constructor(xy, c, s) {
    this.m_pos = xy;
    this.m_color = c;
    this.m_size = s;
  }

  render() {
    gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniform1f(u_pointSize, size);
    gl.drawArrays(gl.POINTS, 0, 1);
  }
}

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
  document.getElementById('redSlider').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100; });
  document.getElementById('greenSlider').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });
  document.getElementById('blueSlider').addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100; });
  document.getElementById('sizeSlider').addEventListener('mouseup', function() { g_size = this.value; });
}

function clearCanvas() {
  g_points = [];
  renderAllShapes();
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = function(ev){ click(ev) };
  canvas.onmousemove = function(ev) { click(ev) };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

function click(ev) {
  if(ev.buttons != 1) {
    return;
  }

  [x, y] = convertCoordinatesEventToGL(ev);

  g_points.push(new Point([x, y].slice(), g_selectedColor.slice(), g_size));

  renderAllShapes();
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
    console.log(p);

    gl.vertexAttrib3f(a_Position, p.m_pos[0], p.m_pos[1], 0.0);
    gl.uniform4f(u_FragColor, p.m_color[0], p.m_color[1], p.m_color[2], p.m_color[3]);
    gl.uniform1f(u_pointSize, p.m_size);
    gl.drawArrays(gl.POINTS, 0, 1);
  }
}
