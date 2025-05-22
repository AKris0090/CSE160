let lightPurple = [0.761, 0.5, 1, 0.25];

class Area {
    constructor() {
        this.matrix = new Matrix4();
        this.matrix.rotate(45, 0, 1, 0).scale(2, 2, 2);
        this.newM = new Matrix4();
    }
  
    render() {
        applyColor([0.5, 0.5, 0.5, 1.0]);

        this.newM.set(this.matrix).translate(-1.5, -3, -1.5).scale(2, 1, 2);
        drawCube(this.newM);
        this.newM.set(this.matrix);
        this.newM.translate(-13.25, 0, -13.25).scale(2, 7, 2);
        drawCube(this.newM);
        applyColor([98/255,188/255,47/255, 1.0]);
    }
}