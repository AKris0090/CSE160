class Area {
    constructor() {
        this.matrix = new Matrix4();
        this.matrix.rotate(45, 0, 1, 0).scale(2, 2, 2);
        this.newM = new Matrix4();
    }
  
    render() {
        this.newM.set(this.matrix);
        this.newM.translate(0, -3, 0);
        drawCube(this.newM);
    }
}