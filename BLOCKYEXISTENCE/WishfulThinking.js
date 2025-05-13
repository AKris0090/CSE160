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
    }
    if(u_textureIndex == 2.0) {
      mediump float ndotL = dot(normalize(v_Normal), vec3(-1, -0.35, 0.5));
      gl_FragColor = vec4(texture2D(u_Sampler1, v_UV).xyz * vec3(ndotL), 1.0);
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
  }`