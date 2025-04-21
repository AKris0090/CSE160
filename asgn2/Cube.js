const cubeVertices = new Float32Array([
    -1, -1,  1,   1,  1,  1,   1, -1,  1,
    -1, -1,  1,  -1,  1,  1,   1,  1,  1,
    -1, -1, -1,   1, -1, -1,   1,  1, -1,
    -1, -1, -1,   1,  1, -1,  -1,  1, -1,
    -1,  1, -1,   1,  1, -1,   1,  1,  1,
    -1,  1, -1,   1,  1,  1,  -1,  1,  1,
    -1, -1, -1,   1, -1,  1,   1, -1, -1,
    -1, -1, -1,  -1, -1,  1,   1, -1,  1,
     1, -1, -1,   1, -1,  1,   1,  1,  1,
     1, -1, -1,   1,  1,  1,   1,  1, -1,
    -1, -1, -1,  -1,  1,  1,  -1, -1,  1,
    -1, -1, -1,  -1,  1, -1,  -1,  1,  1,

    0, -0.5,  0.5,   1,  0.5,  0.5,   1, -0.5,  0.5,
    0, -0.5,  0.5,   0,  0.5,  0.5,   1,  0.5,  0.5,
    0, -0.5, -0.5,   1, -0.5, -0.5,   1,  0.5, -0.5,
    0, -0.5, -0.5,   1,  0.5, -0.5,   0,  0.5, -0.5,
    0,  0.5, -0.5,   1,  0.5, -0.5,   1,  0.5,  0.5,
    0,  0.5, -0.5,   1,  0.5,  0.5,   0,  0.5,  0.5,
    0, -0.5, -0.5,   1, -0.5,  0.5,   1, -0.5, -0.5,
    0, -0.5, -0.5,   0, -0.5,  0.5,   1, -0.5,  0.5,
    1, -0.5, -0.5,   1, -0.5,  0.5,   1,  0.5,  0.5,
    1, -0.5, -0.5,   1,  0.5,  0.5,   1,  0.5, -0.5,
    0, -0.5, -0.5,   0,  0.5,  0.5,   0, -0.5,  0.5,
    0, -0.5, -0.5,   0,  0.5, -0.5,   0,  0.5,  0.5,
]);

class Cube {
    constructor() {
        this.m_color = [1.0, 1.0, 1.0, 1.0];
        this.m_matrix = new Matrix4();
    }
  
    render() {
        drawCube(this.m_matrix, this.m_color);
    }
}

function drawCube(m) {
    gl.uniformMatrix4fv(u_ModelMatrix, false, m.elements);
    gl.drawArrays(gl.TRIANGLES, 0, 36);
}

function drawAltCube(m) {
    gl.uniformMatrix4fv(u_ModelMatrix, false, m.elements);
    gl.drawArrays(gl.TRIANGLES, 36, 36);
}

function drawFeather(m) {
    // var newNewM = new Matrix4().set(m);
    // var newM = new Matrix4();
    // newM.scale(0.15, 1, 0.15);
    // drawCube(newNewM.multiply(newM));
    drawCube(m);
    // m.setTranslate(0, -3, 0);
    // m.scale(0.25, 1.5, 0.25);
    // newM.multiply(m);
    // gl.uniformMatrix4fv(u_ModelMatrix, false, newM.elements);
    // gl.drawArrays(gl.TRIANGLES, 36, 12);
}