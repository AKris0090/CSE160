// https://www.geeksforgeeks.org/getting-started-with-webgl/
// I dont understand why the cuon-utils library insists on binding the shader program for us. Give me autonomy, you monster
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

    // second buffer for full screen quad
    createFSQuadBuffers() {
        this.VBO = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VBO);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fsquadVertices), gl.DYNAMIC_DRAW);
    }
}