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