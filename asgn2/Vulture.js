class Vulture {
    constructor() {
    }
  
    render() {
        renderVulture();
    }
}

function applyColor(rgba) {
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
}

let bodyColor = [1, 0.85, 0.3, 1.0];
let wingColor = [0, 0.5, 0.5, 1.0];

function updateVultureAnimation() {

}

function renderVulture() {
    var m = new Matrix4();
    drawBody(m);
}

let identity = new Matrix4();

function drawBody(root) {
    applyColor(bodyColor);

    let body = new Matrix4();
    body.translate(-1.7474, -0.66956, 0);
    body.rotate(-19, 0, 0, 1);
    body.scale(2.2, 1.291, 1.0);
    drawCube(body);

    drawWing(root);

    applyColor(bodyColor);

    body.set(root);
    body.translate(-3.5, 0.55525, 0);
    body.rotate(-85, 0, 0, 1);
    body.scale(1.5, 0.929, 0.720);
    drawCube(body);

    body.set(root);
    body.translate(-3.821, 2.417, 0);
    body.rotate(-47.5, 0, 0, 1);
    body.scale(0.984, 0.577, 0.477);
    drawCube(body);
}

function drawWing(body) {
    applyColor(wingColor);

    let shoulder = new Matrix4().set(body);
    shoulder.translate(0, -0.1, 1);
    shoulder.rotate(-45, 0, 1, 0);
    shoulder.scale(0.4, 0.15, 1.25);
    drawCube(shoulder);
}