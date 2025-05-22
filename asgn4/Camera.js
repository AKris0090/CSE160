class Camera {
    constructor() {
        this.fov = 90;
        this.speed = 0.25;
        this.rot = 5;
        this.eye = new Vector3([15, 2, 15]);
        this.at = new Vector3([0, 0, -1]);
        this.up = new Vector3([0, 1, 0]);
        this.viewMatrix = new Matrix4().setLookAt(this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],  this.at.elements[0], this.at.elements[1], this.at.elements[2],  this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        this.projectionMatrix = new Matrix4().setPerspective(this.fov, canvas.width/canvas.height, 0.1, 1000);
    }

    moveForward() {
        let f = new Vector3().set(this.at).sub(this.eye).normalize().mul(this.speed);
        this.eye.add(f);
        this.at.add(f);
    }

    moveBack() {
        let f = new Vector3().set(this.at).sub(this.eye).normalize().mul(this.speed);
        this.eye.sub(f);
        this.at.sub(f);
    }

    moveLeft() {
        let f = new Vector3().set(this.at).sub(this.eye);
        let s = Vector3.cross(this.up, f).normalize().mul(this.speed);
        this.eye.add(s);
        this.at.add(s);
    }

    moveRight() {
        let f = new Vector3().set(this.at).sub(this.eye);
        let s = Vector3.cross(f, this.up).normalize().mul(this.speed);
        this.eye.add(s);
        this.at.add(s);
    }

    moveUp() {
        let f = new Vector3().set(this.at).sub(this.eye);
        let s = Vector3.cross(f, this.up).normalize()
        let u = Vector3.cross(s, f).normalize().mul(this.speed);
        this.eye.add(u);
        this.at.add(u);
    }

    moveDown() {
        let f = new Vector3().set(this.at).sub(this.eye);
        let s = Vector3.cross(this.up, f).normalize()
        let u = Vector3.cross(f, s).normalize().mul(this.speed);
        this.eye.sub(u);
        this.at.sub(u);
    }

    panLeft(amount = this.rot) {
        let f = new Vector3().set(this.at).sub(this.eye);
        let rotationMatrix = new Matrix4().setRotate(amount, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let f_prime = rotationMatrix.multiplyVector3(f);
        this.at = new Vector3().set(this.eye).add(f_prime);
    }

    panRight(amount = -this.rot) {
        let f = new Vector3().set(this.at).sub(this.eye);
        let rotationMatrix = new Matrix4().setRotate(amount, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let f_prime = rotationMatrix.multiplyVector3(f);
        this.at = new Vector3().set(this.eye).add(f_prime);
    }

    panUp(amount) {
        let f = new Vector3().set(this.at).sub(this.eye);
        let r = Vector3.cross(this.up, f);
        let rotationMatrix = new Matrix4().setRotate(amount, r.elements[0], r.elements[1], r.elements[2]);
        let f_prime = rotationMatrix.multiplyVector3(f);
        this.at = new Vector3().set(this.eye).add(f_prime);
    }

    updateCamera() {
        this.viewMatrix.setLookAt(this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],  this.at.elements[0], this.at.elements[1], this.at.elements[2],  this.up.elements[0], this.up.elements[1], this.up.elements[2]);    }
}