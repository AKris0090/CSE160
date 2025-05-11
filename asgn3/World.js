// Arjun Krishnan
//akrish29@ucsc.edu

//Notes to Grader:
//My submission's special features are notes in the <p> and <li> tags below the canvas. I hope you enjoy my project!

var VSHADER_SOURCE =
  `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec4 a_Normal;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  varying vec3 v_Position;
  varying vec3 v_normalOut;
  uniform float u_textureIndex;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;

  void main() {
    v_UV = a_UV;
    v_Position = a_Position.xyz;
    v_normalOut = normalize(mat3(u_ModelMatrix) * a_Normal.xyz);
    if(u_textureIndex < 2.0) {
      gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
    } else {
      gl_Position = u_ProjectionMatrix * mat4(mat3(u_ViewMatrix)) * u_ModelMatrix * a_Position;
    }
  }`

var FSHADER_SOURCE =
  `precision mediump float;
  const vec3 u_lightPos = normalize(vec3(10, -50, 5));
  const vec3 tint = vec3(1.0, 0.75, 0.75);
  const float PI = 3.1415926;

  varying vec2 v_UV;
  varying vec3 v_normalOut;
  varying vec3 v_Position;
  uniform vec4 u_FragColor;
  uniform vec3 u_camPos;
  uniform float u_textureIndex;
  uniform float u_isBloomPass;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_bloomTexture;
  uniform samplerCube u_CubeMap;
  const float glow = 2.0;

  float getLightAmount() {
    vec3 l = normalize(u_lightPos - v_Position);
    float df = clamp(dot(v_normalOut, l), 0.0, 1.0);
    return df;
  }

  vec3 blur(vec4 color) {
    vec3 result = vec3(0.0);
    for (int i = -glow; i <= glow; i++) {
        result += texture(u_bloomTexture, v_UV + vec2(i * offset, 0)).rgb;
    }
    return result;
  }

  void main() {
    if(u_isBloomPass == 1.0) {
      mediump float nDotL = max(0.5, (dot(normalize(v_normalOut.xyz), u_lightPos.xyz) * 1.25));
      vec3 color = texture2D(u_Sampler0, v_UV).xyz * vec3(nDotL) * tint;
      float brightness = dot(color, vec3(0.2126, 0.7152, 0.0722));
      gl_FragColor = brightness > 1.0 ? vec4(color, 1.0) : vec4(vec3(0.0), 1.0);
      return;
    }

    //mediump float nDotL = max(0.5, (dot(normalize(v_normalOut.xyz), u_lightPos.xyz) * 1.25));
    
    mediump float nDotL = dot(normalize(v_normalOut.xyz), u_lightPos.xyz);
    if(u_textureIndex == 0.0) {
      gl_FragColor = vec4(u_FragColor.xyz * vec3(nDotL) * tint, 1.0);;
    }
    if(u_textureIndex == 1.0) {
      // gl_FragColor = vec4(texture2D(u_Sampler0, v_UV).xyz * vec3(nDotL) * tint, 1.0);
      float lightAmount = getLightAmount();
      vec3 clr = texture2D(u_Sampler0, v_UV).xyz;
      // clr += glow * mix(0.45, 1.0, clamp(16.5, 0.0, 1.0));
      // clr *= (0.4 +  pal(clr.r * 0.33 + clr.g * 0.33 + clr.b * 0.33) * 0.6);
      // clr = pow(clr, vec3(4.0));
      gl_FragColor = vec4(clr, 1.0);
    }
    if(u_textureIndex == 2.0) {
      gl_FragColor = vec4(textureCube(u_CubeMap, normalize(v_Position)).xyz + vec3(0.15), 1.0);
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
let u_camPos;
let u_isBloomPass;

let g_cam = null;
let g_Sky = null;
let g_Ground = null;
let g_mapObj = null;

let g_obj = null;
let g_wire = null;

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

  // Storage location of textureIndex
  u_camPos = gl.getUniformLocation(gl.program, 'u_camPos');
  if (!u_camPos) {
    console.log('Failed to get the storage location of u_camPos');
    return;
  }

  // Storage location of bloom flip
  u_isBloomPass = gl.getUniformLocation(gl.program, 'u_isBloomPass');
  if (!u_isBloomPass) {
    console.log('Failed to get the storage location of u_isBloomPass');
    return;
  }
}

// could not be bothered calculating these myself LOL - math from the textbook on calculating normals of a triangle
function createCubeNormals() {
  let out = [];
  for(var i = 0; i < cubeArray.length; i+= 9) {
    var vec1 = new Vector3([cubeArray[i], cubeArray[i + 1], cubeArray[i + 2]]);
    var vec2 = new Vector3([cubeArray[i + 3], cubeArray[i + 4], cubeArray[i + 5]]);
    var vec3 = new Vector3([cubeArray[i + 6], cubeArray[i + 7], cubeArray[i + 8]]);
    if(i >= 108) {
      vec3 = new Vector3([cubeArray[i], cubeArray[i + 1], cubeArray[i + 2]]);
      vec2 = new Vector3([cubeArray[i + 3], cubeArray[i + 4], cubeArray[i + 5]]);
      vec1 = new Vector3([cubeArray[i + 6], cubeArray[i + 7], cubeArray[i + 8]]);
    }

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

function sendTextureToGLSL(gl, n, texture, u_Sampler, image) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  gl.uniform1i(u_Sampler, 0);
}

function initTextures(gl, n) {
  return new Promise((resolve, reject) => {
    var texture = gl.createTexture();
    if (!texture) return reject("Failed to create texture object");

    u_Sampler0 = gl.getUniformLocation(gl.program, "u_Sampler0");
    if (!u_Sampler0) return reject("Failed to get sampler location");

    var image = new Image();
    image.onload = function () {
      sendTextureToGLSL(gl, n, texture, u_Sampler0, image);
      resolve();
    };
    image.onerror = () => reject("Failed to load texture image");
    image.src = "textures/Plug.png";
  });
}

// https://webglfundamentals.org/webgl/lessons/webgl-environment-maps.html
function initCubeMap(gl) {
  return new Promise((resolve, reject) => {
    const cubeMap = gl.createTexture();
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);

    const faces = [
      { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, url: 'skybox2/right.jpg' },
      { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, url: 'skybox2/left.jpg' },
      { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, url: 'skybox2/top.jpg' },
      { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, url: 'skybox2/bottom.jpg' },
      { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, url: 'skybox2/front.jpg' },
      { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, url: 'skybox2/back.jpg' },
    ];

    let loadedImages = 0;
    faces.forEach(({ target, url }) => {
      const image = new Image();
      image.onload = () => {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);
        gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        loadedImages++;
        if (loadedImages === 6) {
          gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
          gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

          const u_CubeMap = gl.getUniformLocation(gl.program, 'u_CubeMap');
          gl.activeTexture(gl.TEXTURE1);
          gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);
          gl.uniform1i(u_CubeMap, 1);
          resolve();
        }
      };
      image.onerror = () => reject(`Failed to load ${url}`);
      image.src = url;
    });
  });
}

let bloomFrameBuffer;
let bloomTexture;
let targetTextureWidth;
let targetTextureHeight;

// https://webglfundamentals.org/webgl/lessons/webgl-render-to-texture.html
function createBloomBuffer() {
  // create to render to
  bloomTexture = gl.createTexture();
  targetTextureWidth = canvas.width;
  targetTextureHeight = canvas.height;
  gl.bindTexture(gl.TEXTURE_2D, bloomTexture);

  // define size and format of level 0
  const level = 0;
  const internalFormat = gl.RGBA;
  const border = 0;
  const format = gl.RGBA;
  const type = gl.UNSIGNED_BYTE;
  const data = null;
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                targetTextureWidth, targetTextureHeight, border,
                format, type, data);

  // set the filtering so we don't need mips
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  bloomFrameBuffer = gl.createFrameBuffer();
  gl.bindFrameBuffer(gl.FRAMEBUFFER, bloomFrameBuffer); 
  const attachmentPoint = gl.COLOR_ATTACHMENT0;
  gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, bloomTexture, level);
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

  var normalBuffer = gl.createBuffer();
  if(!normalBuffer) {
    console.log("Failed to create the normal buffer object");
    return -1;
  }
  
  g_obj.startVertex = 36;
  g_obj.numTris = 1660;
  for(let v of g_obj.vertices) {
    cubeArray.push(v);
  }
  for(let uv of g_obj.uvs) {
    uvMap.push(uv);
  }

  g_wire.startVertex = 5016;
  g_wire.numTris = 124;
  for(let v of g_wire.vertices) {
    cubeArray.push(v);
  }
  for(let uv of g_wire.uvs) {
    uvMap.push(uv);
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

  let normalsArray = createCubeNormals();

  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalsArray), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);

  // Enable assignment to a_Normal variable;
  gl.enableVertexAttribArray(a_Normal);
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

async function main() {
  setupWebGL();
  connectVariablesToGLSL();

  try {
    await initTextures(gl, 0);
    await initCubeMap(gl);

    await new Promise(resolve => {
      g_obj = new OBJLOADER('objs/plug.obj', resolve);
    })
    await new Promise(resolve => {
        g_wire = new OBJLOADER('objs/wire.obj', resolve);
    });
  } catch (e) {
    console.error("Resource loading failed:", e);
    return;
  }

  createAttachCubeVertexBuffer();

  createBloomBuffer();
  
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

let rotationAngle = 0;
let g_previousTime;

function renderAllShapes() {
  handleKeys();

  let now = performance.now();
  let nowSeconds = now / 1000;
  g_time = nowSeconds;
  let frameTime = now - g_startTime;

  if(g_previousTime) {
    rotationAngle += (g_time - g_previousTime) * 70;
    if(rotationAngle > 360) {
      rotationAngle %= 360;
    }
    g_previousTime = g_time;
  } else g_previousTime = g_time;

  g_cam.updateCamera();
  gl.uniform3f(u_camPos, g_cam.eye.elements[0], g_cam.eye.elements[1], g_cam.eye.elements[2])

  // Set projection matrix
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, g_cam.projectionMatrix.elements);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.uniformMatrix4fv(u_ViewMatrix, false, g_cam.viewMatrix.elements);
  {
    gl.uniform1i(u_isBloomPass, 1.0);
    gl.bindFrameBuffer(gl.FRAMEBUFFER, bloomFrameBuffer);

    gl.viewport(0, 0, targetTextureWidth, targetTextureHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    g_Sky.render(2.0);
    g_Ground.render(0.0);
    g_mapObj.render();
    g_obj.render(new Matrix4().translate(0, 5, 0).rotate(rotationAngle, 0, 1, 0).scale(5, 5, 5), 1);
    g_wire.render(new Matrix4().translate(0, 5, 0).rotate(rotationAngle, 0, 1, 0).scale(5, 5, 5), 0);
  }
  {
    gl.bindFrameBuffer(gl.FRAMEBUFFER, null);
    gl.uniform1i(u_isBloomPass, 0.0);

    g_Sky.render(2.0);
    g_Ground.render(0.0);
    g_mapObj.render();
    g_obj.render(new Matrix4().translate(0, 5, 0).rotate(rotationAngle, 0, 1, 0).scale(5, 5, 5), 1);
    g_wire.render(new Matrix4().translate(0, 5, 0).rotate(rotationAngle, 0, 1, 0).scale(5, 5, 5), 0);
  }

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