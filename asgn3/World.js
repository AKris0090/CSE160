// Arjun Krishnan
//akrish29@ucsc.edu

//Notes to Grader:
//My submission's special features are notes in the <p> and <li> tags below the canvas. I hope you enjoy my project!

var VSHADER_SOURCE =
  `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  varying vec3 v_Position;
  uniform float u_textureIndex;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;

  void main() {
    v_UV = a_UV;
    v_Position = a_Position.xyz;
    if(u_textureIndex < 2.0) {
      gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
    } else {
      gl_Position = u_ProjectionMatrix * mat4(mat3(u_ViewMatrix)) * u_ModelMatrix * a_Position;
    }
  }`

var FSHADER_SOURCE =
  `precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Position;
  uniform vec4 u_FragColor;
  uniform float u_textureIndex;
  uniform sampler2D u_Sampler0;
  uniform samplerCube u_CubeMap;

  void main() {
    if(u_textureIndex == 0.0) {
      gl_FragColor = u_FragColor;
    }
    if(u_textureIndex == 1.0) {
      gl_FragColor = vec4(texture2D(u_Sampler0, v_UV).xyz, 1.0);
    }
    if(u_textureIndex == 2.0) {
      gl_FragColor = textureCube(u_CubeMap, normalize(v_Position));
    }
  }`

let canvas;
let gl;

let a_Position;
let a_UV;
let u_FragColor;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_textureIndex;
let u_Sampler0;

let g_cam = null;
let g_Sky = null;
let g_Ground = null;
let g_mapObj = null;

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

  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if(a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
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
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  // Storage location of camera matrix
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  // Storage location of textureIndex
  u_textureIndex = gl.getUniformLocation(gl.program, 'u_textureIndex');
  if (!u_textureIndex) {
    console.log('Failed to get the storage location of u_textureIndex');
    return;
  }
}

function sendTextureToGLSL(gl, n, texture, u_Sampler, image) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  gl.uniform1i(u_Sampler, 0);
}

function initTextures(gl, n) {
  var texture = gl.createTexture();
  if(!texture) {
    console.log("Failed to create the texture object");
    return false;
  }

  u_Sampler0 = gl.getUniformLocation(gl.program, "u_Sampler0");
  if(!u_Sampler0) {
    console.log("Failed to get the storage location of u_Sampler");
    return false;
  }
  
  var image = new Image();
  if(!image) {
    console.log("Failed to create the image object");
    return false;
  }
  image.onload = function() {
    sendTextureToGLSL(gl, n, texture, u_Sampler0, image);
  }
  image.src = "textures/sky.jpg";
  return true;
}

// https://webglfundamentals.org/webgl/lessons/webgl-environment-maps.html
function initCubeMap(gl) {
  const cubeMap = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);
  const faces = [
      { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, url: 'skybox/right.jpg' },
      { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, url: 'skybox/left.jpg' },
      { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, url: 'skybox/top.jpg' },
      { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, url: 'skybox/bottom.jpg' },
      { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, url: 'skybox/front.jpg' },
      { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, url: 'skybox/back.jpg' },
  ];

  let loadedImages = 0;

  faces.forEach((face) => {
      const { target, url } = face;
      const image = new Image();
      image.onload = () => {
          gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);
          gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
          loadedImages++;
          if (loadedImages === 6) {
              gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
              gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
          }
      };
      image.src = url;
  });

  const u_CubeMap = gl.getUniformLocation(gl.program, 'u_CubeMap');
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);
  gl.uniform1i(u_CubeMap, 1);
}

function createAttachCubeVertexBuffer() {
  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  var uvBuffer = gl.createBuffer();
  if(!uvBuffer) {
    console.log("Failed to create the UV buffer object");
    return -1;
  }
  
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeArray), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvMap), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_UV variable
  gl.enableVertexAttribArray(a_UV);
}

let g_keysPressed = {};

function handleKeys() {
  if (g_keysPressed["w"]) g_cam.moveForward();
  if (g_keysPressed["a"]) g_cam.moveLeft();
  if (g_keysPressed["s"]) g_cam.moveBack();
  if (g_keysPressed["d"]) g_cam.moveRight();
  if (g_keysPressed["q"]) g_cam.panLeft();
  if (g_keysPressed["e"]) g_cam.panRight();
}

let scale = 0.2;

function onMouseMove(ev) {
    g_cam.panRight(-ev.movementX * scale);
    g_cam.panUp(ev.movementY * scale);
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  createAttachCubeVertexBuffer();

  initTextures(gl, 0);
  initCubeMap(gl);
  
  gl.clearColor(0, 0, 0, 1.0);

  g_Sky = new Cube();
  g_Sky.m_matrix.scale(500, 500, 500);
  g_Ground = new Cube();
  g_Ground.m_matrix.translate(0, -2, 0).scale(500, 1, 500);

  g_mapObj = new Map();
  g_mapObj.generateMap();

  g_cam = new Camera();

  canvas.onclick = function() {
    canvas.requestPointerLock();
  };

  document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === canvas) {
      document.addEventListener("mousemove", onMouseMove, false);
    } else {
      document.removeEventListener("mousemove", onMouseMove, false);
    }
  }, false);

  document.addEventListener('keydown', (ev) => {
    g_keysPressed[ev.key.toLowerCase()] = true;

    if (ev.key === 'z') {
      g_mapObj.addBlockInFront(g_cam);
    }
    if (ev.key === 'x') {
      g_mapObj.removeBlockInFront(g_cam);
    }
  });

  document.addEventListener('keyup', (ev) => {
    g_keysPressed[ev.key.toLowerCase()] = false;
  });
  
  requestAnimationFrame(tick);
}

function renderAllShapes() {
  handleKeys();

  let now = performance.now();
  let nowSeconds = now / 1000;
  g_time = nowSeconds;
  let frameTime = now - g_startTime;

  g_cam.updateCamera();

  // Set projection matrix
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, g_cam.projectionMatrix.elements);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.uniformMatrix4fv(u_ViewMatrix, false, g_cam.viewMatrix.elements);
  g_Sky.render(2.0);
  g_Ground.render(0.0);
  g_mapObj.render();

  sendTextToHTML("ms: " + frameTime.toFixed(2) + " fps: " + (1000 / frameTime).toFixed(2));
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