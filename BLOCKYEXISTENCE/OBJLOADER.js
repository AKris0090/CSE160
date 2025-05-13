class OBJLOADER {
    constructor(filepath, onLoaded) {
        this.vertices = [];
        this.uvs = [];
        this.startVertex = 0;
        this.numTris = 0;
        fetch(filepath).then(res=>res.text()).then(objText=> {
            this.parseOBJ(objText);
            if(onLoaded) onLoaded();
        })
    }

    // One big function to populate all vertices - thank you chatgpt for pseudocode
    // Modified to store vertices instead of triangles and repeat vertices instead of indices
    parseOBJ(objText) {
        var positions = [];
        var uvs = [];

        var lines = objText.split('\n');
        for (let line of lines) {
            line = line.trim();
            if (line.startsWith('v ')) {
                var [, x, y, z] = line.split(/\s+/);
                positions.push([parseFloat(x), parseFloat(y), parseFloat(z)]);
            } else if (line.startsWith('vt ')) {
                var [, u, v] = line.split(/\s+/);
                uvs.push([parseFloat(u), parseFloat(v)]);
            } else if (line.startsWith('f ')) {
                var [, v1, v2, v3] = line.split(/\s+/);
                var indices = [v1, v2, v3].map(v => {
                    var [vertexIndex, uvIndex] = v.split('/').map(i => parseInt(i, 10) - 1);
                    return { vertexIndex, uvIndex };
                });

                for (var { vertexIndex, uvIndex } of indices) {
                    var [a, b, c] = positions[vertexIndex];
                    this.vertices.push(a, b, c);

                    if (uvIndex >= 0 && uvs[uvIndex]) {
                        var [u, v] = uvs[uvIndex];
                        this.uvs.push(u, v);
                    } else {
                        this.uvs.push(0, 0);
                    }
                }
                this.numTris++;
            }
        }
    }

    render(m, texIndex) {
        applyColor([0.5, 0.5, 0.5, 1.0]);
        gl.uniform1f(u_textureIndex, texIndex);
        gl.uniformMatrix4fv(u_ModelMatrix, false, m.elements);

        gl.drawArrays(gl.TRIANGLES, this.startVertex, this.numTris * 3);
    }
}