let lightPurple = [0.761, 0.5, 1, 0.25];

class Area {
    constructor() {
        this.matrix = new Matrix4();
        this.matrix.rotate(45, 0, 1, 0).scale(2, 2, 2);
        this.newM = new Matrix4();
    }
  
    render() {
        applyColor(lightPurple);

        this.newM.set(this.matrix).translate(-1.5, -3, -1.5).scale(2, 1, 2);
        drawCube(this.newM);
        this.newM.set(this.matrix);
        this.newM.translate(-7.25, 0, -7.25).scale(2, 3, 2);
        drawCube(this.newM);
        //drawIcoSphere(this.newM);
    }
}