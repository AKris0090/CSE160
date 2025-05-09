let cubeArray = [
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
];

const uvMap = [
    0, 0,   1, 1,   1, 0,
    0, 0,   0, 1,   1, 1,
    0, 0,   1, 0,   1, 1,
    0, 0,   1, 1,   0, 1,
    0, 0,   1, 0,   1, 1,
    0, 0,   1, 1,   0, 1,
    0, 0,   1, 1,   1, 0,
    0, 0,   0, 1,   1, 1,
    0, 0,   1, 0,   1, 1,
    0, 0,   1, 1,   0, 1,
    0, 0,   0, 1,   1, 0,
    0, 0,   1, 1,   0, 1,
];

let cubeVertices = null;

class Cube {
    constructor() {
        this.m_matrix = new Matrix4();
    }
  
    render(ind) {
        drawCube(this.m_matrix, ind);
    }
}

function drawCube(m, textureIndex) {
    gl.uniform1f(u_textureIndex, textureIndex);
    gl.uniformMatrix4fv(u_ModelMatrix, false, m.elements);
    gl.drawArrays(gl.TRIANGLES, 0, 36);
}

function drawMapCube(m, textureIndex) {
    gl.uniform1f(u_textureIndex, textureIndex);
    gl.uniformMatrix4fv(u_ModelMatrix, false, m.elements);
    gl.drawArrays(gl.TRIANGLES, 0, 36);
}