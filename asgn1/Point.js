class Point {
    constructor(xy, c, s) {
        this.m_pos = xy;
        this.m_color = c;
        this.m_size = s;
    }
  
    render() {
        var xy = this.m_pos;
        var rgba = this.m_color;
        var size = this.m_size;

        gl.disableVertexAttribArray(a_Position);

        gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniform1f(u_pointSize, size);
        gl.drawArrays(gl.POINTS, 0, 1);
    }
  }