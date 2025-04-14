var red = [1.0, 0.0, 0.0, 1.0];
var blue = [0.0, 0.0, 1.0, 1.0];

class Target {
    constructor(pos, size) {
        this.m_pos = pos;
        this.m_size = size;
        this.m_checkSize = size / 65;
        this.outerCircle = new Circle(pos, lightGray, size * 3, 24);
        this.middleCircle = new Circle(pos, red, size * 2, 24);
        this.innerCircle = new Circle(pos, blue, size, 24);
    }

    getDistance(xy, x2y2) {
        let dx = xy[0] - x2y2[0];
        let dy = xy[1] - x2y2[1];
        return Math.sqrt(dx * dx + dy * dy);
    }

    checkHit(xy) {
        if(this.getDistance(xy, this.m_pos) < this.m_checkSize) {
            return true;
        }
        return false;
    }
  
    render() {
        this.outerCircle.render();
        this.middleCircle.render();
        this.innerCircle.render();
    }
}