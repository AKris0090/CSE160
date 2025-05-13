// BIG FILE TO CONTAIN ALL NECESSARY SHADER PROGRAMS

var VSHADER_SOURCE = // color / bloom vertex shader
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
    } else { // cubemap (no translation - remove last column)
      gl_Position = u_ProjectionMatrix * mat4(mat3(u_ViewMatrix)) * u_ModelMatrix * a_Position;
    }
  }`

var FSHADER_SOURCE = // color / bloom fragment shader
`precision mediump float;
varying vec2 v_UV;
varying vec3 v_Position;
varying vec3 v_Normal;

uniform vec4 u_FragColor;
uniform float u_textureIndex;
uniform float u_isBloom;
uniform float u_Time;
uniform sampler2D u_Sampler0;
uniform sampler2D u_Sampler1;
uniform sampler2D u_Sampler2;
uniform samplerCube u_CubeMap;

vec3 stretchColor(vec3 color, float contrast) {
  return clamp((color - 0.5) * contrast + 0.5, 0.0, 1.0);
}

void main() {
  mediump float rNdotL = dot(normalize(v_Normal), vec3(0.5, 0.5, 0)) + dot(normalize(v_Normal), vec3(0.0, -1.0, 0));
  if(u_textureIndex == 0.0) {
    mediump float ndotL = max(0.3, dot(normalize(v_Normal), vec3(0.5, 0.5, 0))) * (((sin(u_Time) + 1.0) / 2.0) + 0.5);
    gl_FragColor = vec4((u_FragColor * vec4(ndotL) * vec4(1.0, 0.75, 0.75, 1.0)).xyz, 1.0);
  }
  if(u_textureIndex == 1.0) {
    mediump float ndotL = max(0.2, dot(normalize(v_Normal), vec3(0.5, 0.5, 0))) * (((sin(u_Time) + 1.0) / 2.0) + 0.5);
    gl_FragColor = vec4(texture2D(u_Sampler0, v_UV).xyz * stretchColor(vec3(ndotL), 2.0) * vec3(2.0), 1.0);
  }
  if(u_textureIndex == 2.0) {
    mediump float ndotL = dot(normalize(v_Normal), vec3(-1, -0.35, 0.5));
    gl_FragColor = vec4(texture2D(u_Sampler1, v_UV).xyz * vec3(ndotL) * vec3(0.75), 1.0);
  }
  if(u_textureIndex == 2.5) {
    mediump float ndotL = dot(normalize(v_Normal), vec3(-1, -0.35, 0.5));
    gl_FragColor = vec4(texture2D(u_Sampler1, v_UV).xyz * vec3(ndotL), 1.0);
    gl_FragColor = gl_FragColor * vec4((sin(u_Time) + 1.0) / 2.0);
  }
  if(u_textureIndex == 3.0) {
    gl_FragColor = vec4(texture2D(u_Sampler2, v_UV).xyz, 1.0);
  }
  if(u_textureIndex == 4.0) {
    vec4 color = textureCube(u_CubeMap, normalize(v_Position)) * (((sin(u_Time) + 1.0) / 2.0) + 0.5);
    gl_FragColor = vec4(stretchColor(color.xyz, 2.0), 1.0);
  }
  if(u_isBloom == 1.0) {
    if(rNdotL > 0.2) {
      gl_FragColor = vec4(gl_FragColor.rgb, 1.0);
    } else {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
  }
}
`

// https://stackoverflow.com/questions/24104939/rendering-a-fullscreen-quad-using-webgl
var VSHADER_SOURCE2 = // fullscreen quad vertex shader
  `precision mediump float;
  attribute vec2 a_Position;
  varying vec2 v_UV;

  const vec2 scale = vec2(0.5, 0.5);

  void main() {
    v_UV = a_Position * scale + scale;
    gl_Position = vec4(a_Position, 0.0, 1.0);
  }
  `

var FSHADER_SOURCE2 = // tonemapping fragment shader
  `precision mediump float;

  uniform sampler2D u_colorImage;
  uniform sampler2D u_bloomSampler;
  uniform vec2 u_canvasWH;
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

  const float r = 3.0;

  // https://stackoverflow.com/questions/64837705/opengl-blurring
  vec4 blur() {
    float rr=r*r,w,w0;
    w0=0.3780/pow(r,1.975);
    vec2 p;
    vec4 col=vec4(0.0,0.0,0.0,0.0);
    float dx = (1.0 / u_canvasWH.x) + 0.00075;
    p.x = v_UV.x + (-r * dx);
    for (float x = -r; x <= r; x++) {
      float xx = x * x;
      float dy = (1.0 / u_canvasWH.y) + 0.00075;
      p.y = v_UV.y + (-r * dy);
      for (float y = -r; y <= r; y++) {
        float yy = y * y;
        if (xx + yy <= rr) {
          w = w0 * exp((-xx - yy) / (2.0 * rr));
          col += texture2D(u_bloomSampler, p) * w;
        }
        p.y += dy;
      }
      p.x += dx;
    }
    return col;
  }

  // https://www.shadertoy.com/view/lsKSWR
  float vig() {
    vec2 uv = gl_FragCoord.xy / u_canvasWH;
    uv *= 1.0 - uv.yx;
    float v = uv.x * uv.y * 13.0;
    v = pow(v, 0.1);
    return v;
  }

  void main() {
    vec4 b = blur();
    float v = vig();

    vec3 frg = (Posterize(texture2D(u_colorImage, v_UV)).xyz + (blur()).xyz) * vec3(v);
    // exposure tonemapping - https://learnopengl.com/Advanced-Lighting/HDR
    gl_FragColor = vec4(vec3(1.0) - exp(-frg * 2.5), 1.0);
  }
`