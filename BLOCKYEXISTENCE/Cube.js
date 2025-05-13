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

let fsquadVertices = [
    1.0,  1.0,
    -1.0,  1.0,
    -1.0, -1.0,
    -1.0, -1.0,
     1.0, -1.0,
     1.0,  1.0
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

function applyColor(rgba) {
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
}

class Cube {
    constructor() {
        this.m_matrix = new Matrix4();
    }
  
    render(ind) {
        drawCube(this.m_matrix, ind);
    }
}

function drawCube(m, textureIndex) {
    applyColor([0, 0, 0, 1]);
    gl.uniform1f(u_textureIndex, textureIndex);
    gl.uniformMatrix4fv(u_ModelMatrix, false, m.elements);
    gl.drawArrays(gl.TRIANGLES, 0, 36);
}