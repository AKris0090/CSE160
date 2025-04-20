const cubeVertices = new Float32Array([
    0,0,0, 1,1,0, 1,0,0,
    0,0,0, 0,1,0, 1,1,0,
    0,0,1, 1,0,1, 1,1,1,
    0,0,1, 1,1,1, 0,1,1,
    0,1,0, 0,1,1, 1,1,1,
    0,1,0, 1,1,1, 1,1,0,
    0,0,0, 1,0,1, 1,0,0,
    0,0,0, 0,0,1, 1,0,1,
    0,0,0, 0,1,0, 0,1,1,
    0,0,0, 0,1,1, 0,0,1,
    1,0,0, 1,1,0, 1,1,1,
    1,0,0, 1,1,1, 1,0,1,
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

function drawCube(m, rgba) {
    gl.uniformMatrix4fv(u_ModelMatrix, false, m.elements);

    gl.uniform4f(u_FragColor, rgba[0] * .6, rgba[1] * .6, rgba[2] * .6, rgba[3]);
    drawTriangle3D(0);

    gl.uniform4f(u_FragColor, rgba[0] * .9, rgba[1] * .9, rgba[2] * .9, rgba[3]);
    drawTriangle3D(12);

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    drawTriangle3D(24);
}