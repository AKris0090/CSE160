class Area {
    constructor() {
        this.matrix = new Matrix4();
        this.matrix.rotate(45, 0, 1, 0).scale(2, 2, 2);
        this.newM = new Matrix4();
    }
  
    render() {
        applyColor(headColor);
        this.newM.set(this.matrix);
        //drawIcoSphere(this.newM);
        this.newM.translate(-1, -3, -1);
        drawCube(this.newM);
        this.newM.set(this.matrix);
        this.newM.translate(-7.25, 0, -7.25).scale(1, 3, 1);
        drawCube(this.newM);
    }
}