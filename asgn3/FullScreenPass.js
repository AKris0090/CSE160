var FS_VSHADER =
  `
  precision mediump float;
  attribute vec4 a_Position;
  const vec2 scale = vec2(0.5, 0.5);

  void main() {
    v_UV = a_Position.xy * scale + scale;
    gl_Position = vec4(a_Position.xy, 0.0, 1.0);
  }`

var FSHADER_SOURCE =
  `precision mediump float;

  varying vec2 v_UV;
  uniform sampler2D u_bloomTexture;

  void main() {
    gl_FragColor = texture2D(u_bloomTexture, v_UV);
  }`

class FullScreen {
    
}