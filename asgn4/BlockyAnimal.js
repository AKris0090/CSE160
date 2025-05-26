// Arjun Krishnan
//akrish29@ucsc.edu

//Notes to Grader:
//My submission's special features are notes in the <p> and <li> tags below the canvas. I hope you enjoy my project!

var VSHADER_SOURCE =
  `precision mediump float;
  attribute vec4 a_Position;
  attribute vec4 a_Normal;

  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform vec3 u_lightPos;
  uniform vec3 u_lightPos2;
  varying vec3 v_normalOut;
  varying vec3 v_lightPosOut;
  varying vec3 v_lightPosOut2;
  varying vec3 v_vertexPos;

  void main() {
    v_normalOut = normalize(mat3(u_ModelMatrix) * a_Normal.xyz);
    v_vertexPos = (u_ModelMatrix * a_Position).xyz;
    v_lightPosOut = u_lightPos - v_vertexPos;
    v_lightPosOut2 = u_lightPos2 - v_vertexPos;
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

var FSHADER_SOURCE =
  `precision mediump float;

  const float ambientCoefficient = 0.2;
  const float specularCoefficient = 64.0;

  varying vec3 v_normalOut;
  varying vec3 v_vertexPos;
  uniform vec3 u_camPos;
  uniform vec4 u_FragColor;

  varying vec3 v_lightPosOut;
  uniform vec3 u_lightColor;
  uniform vec3 u_lightPos;

  varying vec3 v_lightPosOut2;
  uniform vec3 u_lightColor2;
  uniform vec3 u_spotDirection;
  uniform vec3 u_lightPos2;
  uniform float u_radius;

  uniform float u_displayType;

  void main() {
    if(u_displayType == 1.0) {
      vec3 lightDir = normalize(v_lightPosOut);

      vec3 lightDir2 = normalize(v_lightPosOut2);

      // diffuse component
      vec3 diffuse = u_lightColor * max(0.0, dot(v_normalOut, lightDir));

      vec3 diffuse2 = u_lightColor2 * max(0.0, dot(v_normalOut, lightDir2));
      
      // ambient component
      vec3 ambient = u_FragColor.xyz * ambientCoefficient;

      // specular component
      vec3 viewDir = normalize(u_camPos - v_vertexPos);
      vec3 ref = reflect(-lightDir, v_normalOut);
      float spec = max(0.0, dot(normalize(viewDir), ref));
      spec = pow(spec, specularCoefficient);
      vec3 specular = u_lightColor * spec;

      vec3 ref2 = reflect(-lightDir2, v_normalOut);
      float spec2 = max(0.0, dot(normalize(viewDir), ref2));
      spec2 = pow(spec2, specularCoefficient);
      vec3 specular2 = u_lightColor2 * spec2;

      vec3 spotDir = normalize(u_spotDirection);
      vec3 fragToLight = -normalize(v_lightPosOut2);

      float theta = dot(fragToLight, spotDir);
      float epsilon = 0.0; // for smooth edge
      float intensity = smoothstep(u_radius, u_radius, theta);

      diffuse2 *= intensity;
      specular2 *= intensity;

      gl_FragColor = vec4(u_FragColor.xyz * clamp((ambient + (diffuse + diffuse2) * 0.75 + (specular + specular2)), vec3(0.0), vec3(1.0)), 1.0);
    } else if (u_displayType == 0.0) {
      gl_FragColor = vec4(v_normalOut, 1.0); 
    } else {
      gl_FragColor = vec4(u_FragColor);
    }
  }`

let canvas;
let gl;

let a_Position;
let a_Normal;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_displayType;
let u_lightPos;
let u_lightColor;
let u_lightPos2;
let u_lightColor2;
let u_camPos;
let u_spotLightRadius;
let u_spotLightDirection;

let g_cam = null;
let g_spotLightRadius = 0.9;

let g_vulture;
let g_area;
let g_bone;
let g_lightPos = [0, 20, 0];
let g_spotLightPos = [-35, 30, 0];
let g_spotLightDir = [-35, 25, 0];
let g_spotLightColor = [1.0, 1.0, 1.0];
let g_lightColor = [1.0, 1.0, 1.0];

let g_currentTime = -1;
let g_time = -1;

let g_lightType = 1.0;

let upTop = false;
let scale = 0.2;

let lightAnimated = true;

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

let g_keysPressed = {};

function handleKeys() {
  if (g_keysPressed["w"]) g_cam.moveForward();
  if (g_keysPressed["a"]) g_cam.moveLeft();
  if (g_keysPressed["s"]) g_cam.moveBack();
  if (g_keysPressed["d"]) g_cam.moveRight();
  if (g_keysPressed["q"]) g_cam.moveDown();
  if (g_keysPressed["e"]) g_cam.moveUp();
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

  u_displayType = gl.getUniformLocation(gl.program, 'u_displayType');
  if (!u_displayType) {
    console.log('Failed to get the storage location of u_displayType');
    return;
  }

  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos) {
    console.log('Failed to get the storage location of u_lightPos');
    return;
  }

  u_lightColor = gl.getUniformLocation(gl.program, 'u_lightColor');
  if (!u_lightColor) {
    console.log('Failed to get the storage location of u_lightColor');
    return;
  }

  u_lightPos2 = gl.getUniformLocation(gl.program, 'u_lightPos2');
  if (!u_lightPos2) {
    console.log('Failed to get the storage location of u_lightPos2');
    return;
  }

  u_lightColor2 = gl.getUniformLocation(gl.program, 'u_lightColor2');
  if (!u_lightColor2) {
    console.log('Failed to get the storage location of u_lightColor2');
    return;
  }

  u_camPos = gl.getUniformLocation(gl.program, 'u_camPos');
  if (!u_camPos) {
    console.log('Failed to get the storage location of u_camPos');
    return;
  }

  u_spotLightRadius = gl.getUniformLocation(gl.program, 'u_radius');
  if (!u_spotLightRadius) {
    console.log('Failed to get the storage location of u_spotLightRadius');
    return;
  }

  u_spotLightDirection = gl.getUniformLocation(gl.program, 'u_spotDirection');
  if (!u_spotLightDirection) {
    console.log('Failed to get the storage location of u_spotLightDirection');
    return;
  }
}

let lightX = 0;
let lightY = 20;
let lightZ = 0;

function addActionsForHtmlUI() {
  document.getElementById('normals').onclick = function() { g_lightType = 0.0; };
  document.getElementById('light').onclick = function() { g_lightType = 1.0; };
  document.getElementById('color').onclick = function() { g_lightType = -1.0; };

  document.getElementById('lightAnim').onclick = function() { 
    if(lightAnimated) {
      g_lightPos = [0, 20, 0];
    } else {
      g_lightPos = [lightX, lightY, lightZ];
    }
    lightAnimated = !lightAnimated;
  };

  document.getElementById('pointRed')?.addEventListener('mousemove', function() { g_lightColor[0] = this.value / 255.0;});
  document.getElementById('pointGreen')?.addEventListener('mousemove', function() { g_lightColor[1] = this.value / 255.0;});
  document.getElementById('pointBlue')?.addEventListener('mousemove', function() { g_lightColor[2] = this.value / 255.0;});

  document.getElementById('pointX')?.addEventListener('mousemove', function() { lightX = this.value;});
  document.getElementById('pointY')?.addEventListener('mousemove', function() { lightY = this.value;});
  document.getElementById('pointZ')?.addEventListener('mousemove', function() { lightZ = this.value;});

  document.getElementById('spotRed')?.addEventListener('mousemove', function() { g_spotLightColor[0] = this.value / 255.0;});
  document.getElementById('spotGreen')?.addEventListener('mousemove', function() { g_spotLightColor[1] = this.value / 255.0;});
  document.getElementById('spotBlue')?.addEventListener('mousemove', function() { g_spotLightColor[2] = this.value / 255.0;});

  document.getElementById('spotX')?.addEventListener('mousemove', function() { g_spotLightPos[0] = this.value;});
  document.getElementById('spotY')?.addEventListener('mousemove', function() { g_spotLightPos[1] = this.value;});
  document.getElementById('spotZ')?.addEventListener('mousemove', function() { g_spotLightPos[2] = this.value;});

  document.getElementById('spotDX')?.addEventListener('mousemove', function() { g_spotLightDir[0] = this.value;});
  document.getElementById('spotDY')?.addEventListener('mousemove', function() { g_spotLightDir[1] = this.value;});
  document.getElementById('spotDZ')?.addEventListener('mousemove', function() { g_spotLightDir[2] = this.value;});

  document.getElementById('spotRad')?.addEventListener('mousemove', function() { g_spotLightRadius = this.value;});
}

// could not be bothered calculating these myself LOL - math from the textbook on calculating normals of a triangle
function createCubeNormals() {
  let out = [];
  for(var i = 0; i < cubeVertices.length; i+= 9) {
    var vec1 = new Vector3([cubeVertices[i], cubeVertices[i + 1], cubeVertices[i + 2]]);
    var vec3 = new Vector3([cubeVertices[i + 3], cubeVertices[i + 4], cubeVertices[i + 5]]);
    var vec2 = new Vector3([cubeVertices[i + 6], cubeVertices[i + 7], cubeVertices[i + 8]]);

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

// http://blog.andreaskahler.com/2009/06/creating-icosphere-mesh-in-code.html
function addIcoSphereVertices() {
  var t = (1.0 + Math.sqrt(5.0)) / 2.0;

  let verts = [
    [-1,  t,  0], [ 1,  t,  0], [-1, -t,  0], [ 1, -t,  0],
    [ 0, -1,  t], [ 0,  1,  t], [ 0, -1, -t], [ 0,  1, -t],
    [ t,  0, -1], [ t,  0,  1], [-t,  0, -1], [-t,  0,  1]
  ];

  verts = verts.map(v => {
    const len = Math.hypot(...v);
    return v.map(x => x / len);
  });

  let faces = [
    [0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],
    [1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],
    [3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],
    [4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]
  ];


  function getMiddlePoint(i1, i2) {
    let middlePointCache = {};
    const key = i1 < i2 ? `${i1}_${i2}` : `${i2}_${i1}`;
    if (middlePointCache[key] !== undefined) return middlePointCache[key];
    const v1 = verts[i1], v2 = verts[i2];
    const mid = [
      (v1[0] + v2[0]) / 2,
      (v1[1] + v2[1]) / 2,
      (v1[2] + v2[2]) / 2
    ];
    const len = Math.hypot(...mid);
    const norm = mid.map(x => x / len);
    verts.push(norm);
    const idx = verts.length - 1;
    middlePointCache[key] = idx;
    return idx;
  }

  for (let i = 0; i < 3; i++) {
    const newFaces = [];
    for (const [a, b, c] of faces) {
      const ab = getMiddlePoint(a, b);
      const bc = getMiddlePoint(b, c);
      const ca = getMiddlePoint(c, a);
      newFaces.push([a, ab, ca]);
      newFaces.push([b, bc, ab]);
      newFaces.push([c, ca, bc]);
      newFaces.push([ab, bc, ca]);
    }
    faces = newFaces;
  }
  g_icoTriangleCount = faces.length * 3;

  for (const [a, b, c] of faces) {
    cubeArray.push(...verts[c], ...verts[b], ...verts[a]);
  }
}

let g_icoTriangleCount;

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

  function onMouseMove(ev) {
    g_cam.panRight(-ev.movementX * scale);
    g_cam.panUp(ev.movementY * scale);
  }

  document.addEventListener('keydown', (ev) => {
    g_keysPressed[ev.key.toLowerCase()] = true;
  });

  document.addEventListener('keyup', (ev) => {
    g_keysPressed[ev.key.toLowerCase()] = false;
  });

  canvas.addEventListener('mousedown', function(ev) {
    if(ev.buttons == 1 && ev.shiftKey) {
      if(!upTop && !g_moving && !g_boneMoving) {
        g_moving = true;
        g_boneMoving = true;

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
  });

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

  // // Specify the color for clearing <canvas>
  // gl.clearColor(150/255,226/255,238/255, 1.0);
  gl.clearColor(0, 0, 0, 1.0);

  g_globalRotateMatrix = new Matrix4();
  g_vulture = new Vulture();
  g_area = new Area();
  g_bone = new Bone();
  g_cam = new Camera();
  
  requestAnimationFrame(tick);
}

function renderAllShapes() {
  handleKeys();
  g_cam.updateCamera();
  gl.uniform3fv(u_camPos, g_cam.eye.elements);

  let now = performance.now();
  let nowSeconds = now / 1000;

  let spotDirection = [
  g_spotLightDir[0] - g_spotLightPos[0],
  g_spotLightDir[1] - g_spotLightPos[1],
  g_spotLightDir[2] - g_spotLightPos[2]
  ];
  // Normalize
  let len = Math.hypot(...spotDirection);
  if (len > 0) spotDirection = spotDirection.map(x => x / len);

  let u_spotDirection = gl.getUniformLocation(gl.program, 'u_spotDirection');
  gl.uniform3fv(u_spotDirection, spotDirection);

  gl.uniform1f(u_spotLightRadius, g_spotLightRadius);
  gl.uniform3fv(u_lightPos2, g_spotLightPos);
  gl.uniform3fv(u_lightColor2, g_spotLightColor);

  if(lightAnimated) {
    g_lightPos = [0, 20, 0];
    g_lightPos[0] = (Math.sin(nowSeconds * 1.25) * 10) - 15;
    g_lightPos[2] = (Math.cos(nowSeconds * 1.25) * 10);
  } else {
    g_lightPos = [lightX, lightY, lightZ];
  }
  gl.uniform3fv(u_lightPos, g_lightPos);
  gl.uniform3fv(u_lightColor, g_lightColor);

  let frameTime = now - g_startTime;
  g_currentTime = nowSeconds;
  g_pauseTime = g_currentTime;

  // https://stackoverflow.com/questions/21603412/algorithm-3d-orbiting-camera-control-with-mouse-drag

  // get vp matrix by multiplying them, and multiply by model in shader
  var finalMat = new Matrix4().set(g_cam.projectionMatrix);
  finalMat.multiply(g_cam.viewMatrix);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, finalMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.uniform1f(u_displayType, g_lightType);

  g_area.render();
  g_vulture.render();
  drawIcoSphere(new Matrix4().translate(-4, 10, 0).scale(2, 2, 2));
  applyColor([0.75, 0.25, 0.25, 1.0]);
  drawIcoSphere(new Matrix4().translate(-15, -315, 0).scale(300, 300, 300));
  if(g_boneMoving) {
    g_bone.render();
  }

  gl.uniform1f(u_displayType, 2.0);
  applyColor([g_lightColor[0], g_lightColor[1], g_lightColor[2], 1.0]);
  drawAltCube(new Matrix4().translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]).scale(0.5, 0.5, 0.5));
  applyColor([1.0, 1.0, 1.0, 1.0]);
  drawAltCube(new Matrix4().translate(g_spotLightPos[0], g_spotLightPos[1], g_spotLightPos[2]).scale(0.5, 0.5, 0.5));
  drawAltCube(new Matrix4().translate(g_spotLightDir[0], g_spotLightDir[1], g_spotLightDir[2]).scale(0.5, 0.5, 0.5));

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
