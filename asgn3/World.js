// Arjun Krishnan
//akrish29@ucsc.edu

//Notes to Grader:
//My submission's special features are notes in the <p> and <li> tags below the canvas. I hope you enjoy my project!

// CREDITS:
// - Eye model: https://sketchfab.com/3d-models/eye-implant-e988ba5725fe4111b82f945a068c7c81, with modifications (textures, model)

var VSHADER_SOURCE =
  `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec3 v_Normal;
  varying vec2 v_UV;
  varying vec3 v_Position;
  uniform float u_textureIndex;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;

  void main() {
    v_UV = a_UV;
    v_Position = a_Position.xyz;
    v_Normal = mat3(u_ModelMatrix) * a_Normal.xyz;
    if(u_textureIndex < 4.0) {
      gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
    } else {
      gl_Position = u_ProjectionMatrix * mat4(mat3(u_ViewMatrix)) * u_ModelMatrix * a_Position;
    }
  }`

var FSHADER_SOURCE =
  `precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Position;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform float u_textureIndex;
  uniform float u_Time;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform samplerCube u_CubeMap;

  const vec3 tint = vec3(1.0, 0.75, 0.75);

  vec4 Posterize(vec4 inputColor){
    float gamma = 0.3;
    float numColors = 8.0;

    vec3 c = inputColor.rgb;
    c = pow(c, vec3(gamma, gamma, gamma));
    c = c * numColors;
    c = floor(c);
    c = c / numColors;
    c = pow(c, vec3(1.0/gamma));

    return vec4(c, inputColor.a);
  }

  vec3 stretchColor(vec3 color, float contrast) {
    return clamp((color - 0.5) * contrast + 0.5, 0.0, 1.0);
  }

  void main() {
    if(u_textureIndex == 0.0) {
      mediump float ndotL = max(0.3, dot(normalize(v_Normal), vec3(0.5, 0.5, 0))) * (((sin(u_Time) + 1.0) / 2.0) + 0.5);
      gl_FragColor = vec4((u_FragColor * vec4(ndotL) * vec4(tint, 1.0)).xyz, 1.0);
    }
    if(u_textureIndex == 1.0) {
      mediump float ndotL = max(0.2, dot(normalize(v_Normal), vec3(0.5, 0.5, 0))) * (((sin(u_Time) + 1.0) / 2.0) + 0.5);
      gl_FragColor = vec4(texture2D(u_Sampler0, v_UV).xyz * stretchColor(vec3(ndotL), 2.0), 1.0);
      gl_FragColor = Posterize(gl_FragColor);
    }
    if(u_textureIndex == 2.0) {
      mediump float ndotL = dot(normalize(v_Normal), vec3(-1, -0.35, 0.5));
      gl_FragColor = vec4(texture2D(u_Sampler1, v_UV).xyz * vec3(ndotL), 1.0);
      gl_FragColor = Posterize(gl_FragColor) * vec4(2.0);
    }
    if(u_textureIndex == 2.5) {
      mediump float ndotL = dot(normalize(v_Normal), vec3(-1, -0.35, 0.5));
      gl_FragColor = vec4(texture2D(u_Sampler1, v_UV).xyz * vec3(ndotL), 1.0);
      gl_FragColor = Posterize(gl_FragColor) * vec4((sin(u_Time) + 1.0) / 2.0);
    }
    if(u_textureIndex == 3.0) {
      gl_FragColor = vec4(texture2D(u_Sampler2, v_UV).xyz, 1.0);
      gl_FragColor = Posterize(gl_FragColor);
    }
    if(u_textureIndex == 4.0) {
      vec4 color = textureCube(u_CubeMap, normalize(v_Position)) * (((sin(u_Time) + 1.0) / 2.0) + 0.5);
      gl_FragColor = vec4(stretchColor(color.xyz, 2.0), 1.0);
      gl_FragColor = Posterize(gl_FragColor);
    }
  }`

let canvas;
let gl;

let a_Position;
let a_UV;
let a_Normal;
let u_Time;
let u_FragColor;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_textureIndex;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;

let g_cam = null;
let g_Sky = null;
let g_Ground = null;
let g_mapObj = null;

let g_obj = null;
let g_wire = null;
let g_eye = null;
let g_socket = null;
let g_field = null;

let fields = [];

function drawFields() {

}

var g_startTime = performance.now() / 1000.0;

function setupWebGL() {
    canvas = document.getElementById('webgl');
    canvas.width = window.innerWidth * 0.98;
    canvas.height = window.innerHeight * 0.94;

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
  u_Time = gl.getUniformLocation(gl.program, 'u_Time');
  if (!u_Time) {
    console.log('Failed to get the storage location of u_Time');
    return;
  }
}

function sendTextureToGLSL(gl, texture, sampler, image, textureUnit) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl[`TEXTURE${textureUnit}`]);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  gl.uniform1i(sampler, textureUnit);
}

let texture;
let g_eyeTexture;
let g_socketTexture;

function initTextures(gl) {
  return new Promise((resolve, reject) => {
    texture = gl.createTexture();
    if (!texture) return reject("Failed to create texture object");

    u_Sampler0 = gl.getUniformLocation(gl.program, "u_Sampler0");
    if (!u_Sampler0) return reject("Failed to get sampler location");

    var image = new Image();
    image.onload = function () {
      sendTextureToGLSL(gl, texture, u_Sampler0, image, 0);
      resolve();
    };
    image.onerror = () => reject("Failed to load texture image");
    image.src = "textures/Plug.png";
  });
}

function initEyeTextures(gl) {
  return new Promise((resolve, reject) => {
    g_eyeTexture = gl.createTexture();
    if (!g_eyeTexture) return reject("Failed to create texture object");

    u_Sampler1 = gl.getUniformLocation(gl.program, "u_Sampler1");
    if (!u_Sampler1) return reject("Failed to get sampler location");

    var image = new Image();
    image.onload = function () {
      sendTextureToGLSL(gl, g_eyeTexture, u_Sampler1, image, 1);
      resolve();
    };
    image.onerror = () => reject("Failed to load texture image");
    image.src = "textures/eye.png";
  });
}

function initSocketTexture(gl) {
  return new Promise((resolve, reject) => {
    g_socket = gl.createTexture();
    if (!g_socket) return reject("Failed to create texture object");

    u_Sampler2 = gl.getUniformLocation(gl.program, "u_Sampler2");
    if (!u_Sampler2) return reject("Failed to get sampler location");

    var image = new Image();
    image.onload = function () {
      sendTextureToGLSL(gl, g_socket, u_Sampler2, image, 2);
      resolve();
    };
    image.onerror = () => reject("Failed to load texture image");
    image.src = "textures/socket.png";
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
          gl.activeTexture(gl.TEXTURE3);
          gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);
          gl.uniform1i(u_CubeMap, 3);
          resolve();
        }
      };
      image.onerror = () => reject(`Failed to load ${url}`);
      image.src = url;
    });
  });
}

let normalBuffer;

// could not be bothered calculating these myself LOL - math from the textbook on calculating normals of a triangle
function createCubeNormals() {
  let out = [];
  for(var i = 0; i < cubeArray.length; i+= 9) {
    var vec2 = new Vector3([cubeArray[i], cubeArray[i + 1], cubeArray[i + 2]]);
    var vec3 = new Vector3([cubeArray[i + 3], cubeArray[i + 4], cubeArray[i + 5]]);
    var vec1 = new Vector3([cubeArray[i + 6], cubeArray[i + 7], cubeArray[i + 8]]);

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
  g_obj.numTris = 1748;
  for(let v of g_obj.vertices) {
    cubeArray.push(v);
  }
  for(let uv of g_obj.uvs) {
    uvMap.push(uv);
  }

  g_wire.startVertex = 5280;
  g_wire.numTris = 124;
  for(let v of g_wire.vertices) {
    cubeArray.push(v);
  }
  for(let uv of g_wire.uvs) {
    uvMap.push(uv);
  }

  g_eye.startVertex = 5652;
  g_eye.numTris = 5032;
  for(let v of g_eye.vertices) {
    cubeArray.push(v);
  }
  for(let uv of g_eye.uvs) {
    uvMap.push(uv);
  }

  g_socket.startVertex = 20748;
  g_socket.numTris = 1724;
  for(let v of g_socket.vertices) {
    cubeArray.push(v);
  }
  for(let uv of g_socket.uvs) {
    uvMap.push(uv);
  }

  g_field.startVertex = 25920;
  g_field.numTris = 494;
  for(let v of g_field.vertices) {
    cubeArray.push(v);
  }
  for(let uv of g_field.uvs) {
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

  let normals = createCubeNormals();

  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_UV variable
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
    await initTextures(gl);
    await initEyeTextures(gl);
    await initSocketTexture(gl);
    await initCubeMap(gl);

    await new Promise(resolve => {
      g_obj = new OBJLOADER('objs/plug.obj', resolve);
    })
    await new Promise(resolve => {
      g_wire = new OBJLOADER('objs/wire.obj', resolve);
    });

    await new Promise(resolve => {
      g_eye = new OBJLOADER('objs/eye.obj', resolve);
    })

    await new Promise(resolve => {
      g_socket = new OBJLOADER('objs/socket.obj', resolve);
    })

    await new Promise(resolve => {
      g_field = new OBJLOADER('objs/field.obj', resolve);
    })
  } catch (e) {
    console.error("Resource loading failed:", e);
    return;
  }

  createAttachCubeVertexBuffer();
  
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

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

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

  document.addEventListener('resize', (event) => {
    canvas.width = window.innerWidth * 0.98;
    canvas.height = window.innerHeight * 0.94;
    g_cam.projectionMatrix = new Matrix4().setPerspective(g_cam.fov, canvas.width/canvas.height, 0.1, 1000);
  })

  requestAnimationFrame(tick);
}

let rotationAngle = 0;
let g_previousTime;
let heightM = 2;
const toDeg = 180 / Math.PI;

function renderAllShapes() {
  handleKeys();

  let now = performance.now();
  let nowSeconds = now / 1000;
  let frameTime = now - g_startTime;
  let g_time = nowSeconds;

  gl.uniform1f(u_Time, now / 1000.0);

  if(g_previousTime) {
    rotationAngle += (g_time - g_previousTime) * 70;
    if(rotationAngle > 360) {
      rotationAngle %= 360;
    }
    g_previousTime = g_time;
  } else g_previousTime = g_time;

  g_cam.updateCamera();

  // Set projection matrix
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, g_cam.projectionMatrix.elements);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.uniformMatrix4fv(u_ViewMatrix, false, g_cam.viewMatrix.elements);
  g_Sky.render(4.0);
  g_Ground.render(0.0);
  g_mapObj.render();


  let side = 5;
  for(let h = 0; h < heightM; h++) {
      mat.setIdentity().translate(0, (13 * (h)) + 4, 0).rotate(heightM == 2? rotationAngle : -rotationAngle, 0, 1, 0).scale(side, 5, 5);
      g_wire.render(mat, 0.0);
      side *= -1;
  }
  if (heightM > 0) {
      mat.setIdentity().translate(0, ((12) * (heightM)), 0).rotate(heightM == 2? rotationAngle : -rotationAngle, 0, 1, 0).scale(heightM%2==0? -5:5, 5, heightM%2==0? -5:5);
      g_obj.render(mat, 1.0);
  }

  let f = new Vector3(g_cam.eye.elements).sub(new Vector3([0, 300, 0])).normalize();
  let yaw = Math.atan2(f.elements[0], f.elements[2]) * toDeg;
  let pitch = Math.atan2(-f.elements[1], Math.hypot(f.elements[0], f.elements[2])) * toDeg - 90;
  mat.setIdentity().translate(0, 300, 0).rotate(yaw, 0, 1, 0).rotate(pitch, 1, 0, 0).scale(2, 2, 2);
  g_eye.render(mat, 2.0);
  g_field.render(new Matrix4().translate(0,175,0).rotate(rotationAngle, 0, 1, 0).scale(25, 25, 25), 2.5);

  sendTextToHTML("ms: " + frameTime.toFixed(0) + " fps: " + (1000 / frameTime).toFixed(0));
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