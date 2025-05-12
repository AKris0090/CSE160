// https://stackoverflow.com/questions/24104939/rendering-a-fullscreen-quad-using-webgl
var VSHADER_SOURCE2 =
  `precision mediump float;
  attribute vec2 a_Position;
  varying vec2 v_UV;

  const vec2 scale = vec2(0.5, 0.5);

  void main() {
    v_UV = a_Position * scale + scale;;
    gl_Position = vec4(a_Position, 0.0, 1.0);
  }
  `

var FSHADER_SOURCE2 =
  `precision mediump float;

  uniform sampler2D u_colorImage;
  varying vec2 v_UV;

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

  void main() {
    gl_FragColor = Posterize(texture2D(u_colorImage, v_UV)) * vec4(1.35);
  }
`

let fsquadVertices = [
    1.0,  1.0,
    -1.0,  1.0,
    -1.0, -1.0,
    -1.0, -1.0,
     1.0, -1.0,
     1.0,  1.0
];

// https://www.geeksforgeeks.org/getting-started-with-webgl/
class REALPROGRAMCUZTHEOLDISUSELESS {
    constructor(vs, fs) {
        this.VBO = null;
        var ret = initS(gl, vs, fs);
        this.program = ret.pr;
        if (!ret.res) {
            console.log('Failed to intialize shaders 2.');
            return;
        }
    }

    createFSQuadBuffers() {
        this.VBO = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VBO);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fsquadVertices), gl.DYNAMIC_DRAW);
    }
}

// cuon-utils.js (c) 2012 kanda and matsuda
/**
 * Create a program object and make current
 * @param gl GL context
 * @param vshader a vertex shader program (string)
 * @param fshader a fragment shader program (string)
 * @return true, if the program object was created and successfully made current 
 */
function initS(gl, vshader, fshader) {
  var program = initProg(gl, vshader, fshader);
  if (!program) {
    console.log('Failed to create program');
    return {pr: null, res: false};
  }

  return {pr: program, res: true};
}

/**
 * Create the linked program object
 * @param gl GL context
 * @param vshader a vertex shader program (string)
 * @param fshader a fragment shader program (string)
 * @return created program object, or null if the creation has failed
 */
function initProg(gl, vshader, fshader) {
  // Create shader object
  var vertexShader = loadS(gl, gl.VERTEX_SHADER, vshader);
  var fragmentShader = loadS(gl, gl.FRAGMENT_SHADER, fshader);
  if (!vertexShader || !fragmentShader) {
    return null;
  }

  // Create a program object
  var program = gl.createProgram();
  if (!program) {
    return null;
  }

  // Attach the shader objects
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  // Link the program object
  gl.linkProgram(program);

  // Check the result of linking
  var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linked) {
    var error = gl.getProgramInfoLog(program);
    console.log('Failed to link program: ' + error);
    gl.deleteProgram(program);
    gl.deleteShader(fragmentShader);
    gl.deleteShader(vertexShader);
    return null;
  }
  return program;
}

/**
 * Create a shader object
 * @param gl GL context
 * @param type the type of the shader object to be created
 * @param source shader program (string)
 * @return created shader object, or null if the creation has failed.
 */
function loadS(gl, type, source) {
  // Create shader object
  var shader = gl.createShader(type);
  if (shader == null) {
    console.log('unable to create shader');
    return null;
  }

  // Set the shader program
  gl.shaderSource(shader, source);

  // Compile the shader
  gl.compileShader(shader);

  // Check the result of compilation
  var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!compiled) {
    var error = gl.getShaderInfoLog(shader);
    console.log('Failed to compile shader: ' + error);
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}