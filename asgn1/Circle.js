class Circle {
    constructor(xy, c, s, seg) {
        this.m_pos = xy;
        this.m_color = c;
        this.m_size = s;
        this.m_segments = seg;
    }
  
    render() {
        var xy = this.m_pos;
        var rgba = this.m_color;
        var size = this.m_size;

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        var d = size / 200.0;
        
        let alpha = 360 / this.m_segments;
        for(var angle = 0; angle < 360; angle = angle + alpha) {
            let centerPt = [xy[0], xy[1]];
            let v1Angle = angle;
            let v2Angle = angle + alpha;
            let v1 = [Math.cos(v1Angle * Math.PI / 180) * d, Math.sin(v1Angle * Math.PI / 180) * d];
            let v2 = [Math.cos(v2Angle * Math.PI / 180) * d, Math.sin(v2Angle * Math.PI / 180) * d];
            let p1 = [centerPt[0] + v1[0], centerPt[1] + v1[1]];
            let p2 = [centerPt[0] + v2[0], centerPt[1] + v2[1]];

            drawTriangle([xy[0], xy[1], p1[0], p1[1], p2[0], p2[1]]);
        }
    }
}