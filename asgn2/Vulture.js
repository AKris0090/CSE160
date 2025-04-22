class Vulture {
    constructor() {
    }
  
    render() {
        renderVulture(false);
    }
}

function applyColor(rgba) {
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
}

function updateVultureAnimation() {
    g_leftWingAngle = (Math.sin(g_seconds * 3) * 30) + 20;
    g_wingFrontBackAngle = (Math.cos(g_seconds * 3) * 50);
}

let g_topBeakAngle = 14;
let g_bottomBeakAngle = 10;

let g_headX = 180;
let g_headY = 19.2;

let g_leftWingAngle = 70;
let g_elbowAngle = -165;
let g_wristAngle = 80;
let g_wingFrontBackAngle = 0;

let g_legAngle = -90;
let g_shinAngle = -20;

let identity = new Matrix4();

let g_tailAngle = 0;

let bodyColor = [1, 0.85, 0.3, 1.0];
let wingColor = [0, 0.5, 0.5, 1.0];
let headColor = [0.98, 0.85, 0.85, 1.0];
let beakColor = [0.25, 0.75, 0.75, 1.0];
let bottomBeakColor = [0.75, 0.25, 0.25, 1.0]
let featherColor = [0.7, 0.32, 1, 1.0]
let secondaryFeatherColor = [1, 0.62, 0, 1.0]
let primaryFeatherColor = [1, 0.45, 0.45, 1.0]

let t = g_leftWingAngle / 80;

function renderVulture() {
    if(g_animated) {
        updateVultureAnimation();
    }
    t = g_leftWingAngle / 80;

    var m = new Matrix4();

    drawBody(m);

    // change head direction
    drawHead(m);

    drawWing(m, 1);
    drawWing(m, -1);

    drawLeg(m);
}

function drawShin(root) {
    let shin = new Matrix4();
    shin.set(root);

    shin.translate(1.85, -0.25, 0).rotate(g_shinAngle, 0, 0, 1);
    // TODO: DRAW FOOT - ONE JOINT TO CONTROL GRIP
    shin.scale(1.05, 0.25, 0.25);
    drawAltCube(shin);
}

function drawLeg(root) {
    applyColor(primaryFeatherColor);

    let thigh = new Matrix4();

    thigh.set(root);
    thigh.translate(-2.571, -0.621, -0.563).rotate(g_legAngle, 0, 0, 1)
    drawShin(thigh);
    thigh.scale(1.168 * 2, 0.593 * 2, 0.39 * 2);
    drawAltCube(thigh);

    thigh.set(root);
    thigh.translate(-2.571, -0.621, 0.563).rotate(g_legAngle, 0, 0, 1);
    drawShin(thigh);
    thigh.scale(1.168 * 2, 0.593 * 2, 0.39 * 2);
    drawAltCube(thigh);
}

function drawWing(root, mirror) {
    applyColor(wingColor);

    let shoulder = new Matrix4().set(root);
    if(mirror == -1) {
        shoulder.scale(1, 1, -1); // reflect across Z
    }

    shoulder.translate(-2.5, 0.85, 0.65).rotate(-40, 0, 0, 1).rotate(g_leftWingAngle, 0, 1, 0).rotate(lerpVal(g_wingFrontBackAngle, 0, t), 1, 0, 0);
    
    drawTopWing(shoulder);

    shoulder.scale(0.2, 0.082, 0.2);
    drawCube(shoulder);
}

function drawFlightFeather(root, angle, angle2, length, width, angle3 = 0, height = 0.2, altColor = false) {
    if(altColor) {
        applyColor(wingColor);
    } else {
        applyColor(featherColor);
    }
    let feather = new Matrix4();
    feather.set(root);
    feather.rotate(angle, 0, 1, 0).rotate(angle2, 0, 0, 1).rotate(angle3, 1, 0, 0).scale(length * 6, height, width);
    drawAltCube(feather);
}

function drawSecondaryFeather(root, angle, angle2, length, width) {
    applyColor(secondaryFeatherColor);
    let feather = new Matrix4();
    feather.set(root);
    feather.rotate(angle, 0, 1, 0).rotate(angle2, 0, 0, 1).scale(length * 4, 1.1, width);
    drawAltCube(feather);
}

function drawPrimaryFeather(root, angle, angle2, angle3, length, width, height = 0.75) {
    applyColor(primaryFeatherColor);
    let feather = new Matrix4();
    feather.set(root);
    feather.rotate(angle3, 0, 0, 1).rotate(angle, 0, 1, 0).rotate(angle2, 1, 0, 0).scale(length * 2, height, width);
    drawAltCube(feather);
}

// TODO: FIX FOREARM TOP PRIMARY FEATHERS CLIPPING?

// TODO: LEGS

// TODO: FACE DECOR

// TODO PERFORMANCE: INSTANTIATE ALL MATRICES AT TOP? to remove any need of new keyword

function drawTopWing(root) {
    let topWing = new Matrix4();

    // top primary feathers
    topWing.set(root);
    topWing.translate(0, 0.15, -0.2);
    drawPrimaryFeather(topWing, lerpVal(0, -60, t), lerpVal(-5, -30, t), lerpVal(0, 2, t), 1, 0.75, 0.15);
    topWing.translate(0, 0, .65);
    drawPrimaryFeather(topWing, lerpVal(0, -60, t), lerpVal(-5, -10, t), lerpVal(0, 6, t), 1, 0.75, 0.15);
    topWing.translate(0, 0, .65);
    drawPrimaryFeather(topWing, lerpVal(0, -60, t), lerpVal(-5, 0, t), lerpVal(0, 13, t), 1, 0.75, 0.15);

    // bottom primary feathers
    topWing.set(root);
    topWing.translate(0, -0.09, -0.2);
    drawPrimaryFeather(topWing, lerpVal(0, -60, t), lerpVal(-5, -30, t), lerpVal(0, 2, t), 0.75, 0.75, 0.15);
    topWing.translate(0, 0, .65);
    drawPrimaryFeather(topWing, lerpVal(0, -60, t), lerpVal(-5, -10, t), lerpVal(0, 6, t), 0.75, 0.75, 0.15);
    topWing.translate(0, 0, .65);
    drawPrimaryFeather(topWing, lerpVal(0, -60, t), lerpVal(-5, 0, t), lerpVal(0, 11, t), 0.8, 0.75, 0.15);

    // secondary flight feathers
    topWing.set(root);
    topWing.translate(0, 0.05, -0.2).scale(1, 0.25, 1);
    drawSecondaryFeather(topWing, lerpVal(0, -60, t), lerpVal(0, -50, t), .5, 0.5);
    topWing.translate(0, 0, .65);
    drawSecondaryFeather(topWing, lerpVal(0, -60, t), lerpVal(0, -50, t), .55, 0.5);
    topWing.translate(0, 0, .65);
    drawSecondaryFeather(topWing, lerpVal(0, -60, t), lerpVal(0, -50, t), .6, 0.5);

    // flight feathers
    topWing.set(root);
    topWing.translate(0, 0.15, -0.2).scale(1, 0.25, 1);
    drawFlightFeather(topWing, lerpVal(0, -60, t), lerpVal(0, -50, t), .5, 0.5);
    topWing.translate(0, 0, .65);
    drawFlightFeather(topWing, lerpVal(0, -60, t), lerpVal(0, -50, t), .55, 0.5);
    topWing.translate(0, 0, .65);
    drawFlightFeather(topWing, lerpVal(0, -60, t), lerpVal(0, -50, t), .6, 0.5);

    applyColor(wingColor);
    topWing.set(root);
    topWing.translate(0, 0, -1).scale(0.2, 0.2, 1).translate(0, 0, 1.25);
    drawCube(topWing);

    topWing.scale(5, 5, 1);
    drawElbow(root);
}

function drawForeArm(root) {
    let foreArm = new Matrix4();

    // top primary feathers
    foreArm.set(root);
    foreArm.translate(-0.25, 1.05, 1);
    drawPrimaryFeather(foreArm, lerpVal(5, 90, t), lerpVal(-5, -50, t), lerpVal(0, -50, t), 5.5, 2.5);
    foreArm.translate(0, 0, 2.5);
    drawPrimaryFeather(foreArm, lerpVal(5, 85, t), lerpVal(-5, -10, t), lerpVal(0, -20, t), 5.5, 2.5);
    foreArm.translate(0, 0, 2.5);
    drawPrimaryFeather(foreArm, lerpVal(5, 80, t), lerpVal(-5, 0, t), lerpVal(0, -10, t), 5.5, 2.5);
    foreArm.translate(0, 0, 2.5);
    drawPrimaryFeather(foreArm, lerpVal(5, 75, t), lerpVal(-5, 30, t), lerpVal(0, -30, t), 5.75, 2.5);
    foreArm.translate(0, 0, 2.5);
    drawPrimaryFeather(foreArm, lerpVal(5, 70, t), lerpVal(-5, 60, t), lerpVal(0, -45, t), 6, 2.5);

    // bottom primary feathers
    foreArm.set(root);
    foreArm.translate(-0.25, -0.5, 1);
    drawPrimaryFeather(foreArm, lerpVal(10, 90, t), lerpVal(0, -50, t), 0, 4.5, 2.4);
    foreArm.translate(0, 0, 2.5);
    drawPrimaryFeather(foreArm, lerpVal(10, 90, t), lerpVal(0, -50, t), 0, 4.5, 2.4);
    foreArm.translate(0, 0, 2.5);
    drawPrimaryFeather(foreArm, lerpVal(10, 90, t), lerpVal(0, -50, t), 0, 4.75, 2.4);
    foreArm.translate(0, 0, 2.5);
    drawPrimaryFeather(foreArm, lerpVal(10, 90, t), lerpVal(0, -50, t), 0, 5, 2.4);
    foreArm.translate(0, 0, 2.5);
    drawPrimaryFeather(foreArm, lerpVal(10, 90, t), lerpVal(0, -50, t), 0, 5.5, 2.4);

    // secondary flight feathers
    foreArm.set(root);
    foreArm.translate(-0.25, 0.75, 1);
    drawSecondaryFeather(foreArm, lerpVal(10, 90, t), lerpVal(0, -50, t), 3.5, 2.4, lerpVal(0, 90, t));
    foreArm.translate(0, 0, 2.5);
    drawSecondaryFeather(foreArm, lerpVal(10, 90, t), lerpVal(0, -50, t), 3.6, 2.4, lerpVal(0, 90, t));
    foreArm.translate(0, 0, 2.5);
    drawSecondaryFeather(foreArm, lerpVal(10, 90, t), lerpVal(0, -50, t), 3.8, 2.4, lerpVal(0, 90, t));
    foreArm.translate(0, 0, 2.5);
    drawSecondaryFeather(foreArm, lerpVal(10, 90, t), lerpVal(0, -50, t), 3.85, 2.4, lerpVal(0, 90, t));
    foreArm.translate(0, 0, 2.5);
    drawSecondaryFeather(foreArm, lerpVal(10, 90, t), lerpVal(0, -50, t), 3.9, 2.4, lerpVal(0, 90, t));

    // flight feathers
    foreArm.set(root);
    foreArm.translate(-0.25, 1.05, 1);
    drawFlightFeather(foreArm, lerpVal(10, 90, t), lerpVal(0, -50, t), 3.5, 2.4, lerpVal(0, 90, t));
    foreArm.translate(0, 0, 2.5);
    drawFlightFeather(foreArm, lerpVal(10, 90, t), lerpVal(0, -50, t), 3.6, 2.4, lerpVal(0, 90, t));
    foreArm.translate(0, 0, 2.5);
    drawFlightFeather(foreArm, lerpVal(10, 90, t), lerpVal(0, -50, t), 3.8, 2.4, lerpVal(0, 90, t));
    foreArm.translate(0, 0, 2.5);
    drawFlightFeather(foreArm, lerpVal(10, 90, t), lerpVal(0, -50, t), 3.85, 2.4, lerpVal(0, 90, t));
    foreArm.translate(0, 0, 2.5);
    drawFlightFeather(foreArm, lerpVal(10, 90, t), lerpVal(0, -50, t), 3.9, 2.4, lerpVal(0, 90, t));

    applyColor(wingColor);
    foreArm.set(root).translate(0, 0, -1.5).scale(1, 1, 7).translate(0, 0, 1);
    drawCube(foreArm);
}

function drawElbow(root) {
    let elbow = new Matrix4();
    elbow.set(root).translate(0, 0, 1.25).rotate((-2.0567 * g_leftWingAngle -11.6667), 0, 1, 0).rotate((0.4167 * g_leftWingAngle - 3.333), 1, 0, 0).scale(0.185, 0.185, 0.26);

    drawForeArm(elbow);
    drawCube(elbow);
    elbow.scale(5.4054, 5.4054, 3.846);
    drawWrist(elbow);
}

function drawHand(root) {
    let hand = new Matrix4();
    hand.set(root);

    // draw primary flight feathers
    hand.translate(0.1, 0.6, 0.1);
    drawFlightFeather(hand, lerpVal(-90, -90, t), 0, 3.3, 2);
    hand.translate(0, 0, 0.1);
    drawFlightFeather(hand, lerpVal(-80, -88, t), 0, 3.35, 2);
    hand.translate(0, 0, 0.1);
    drawFlightFeather(hand, lerpVal(-70, -86, t), 0, 3.4, 2);
    hand.translate(0, 0, 0.1);
    drawFlightFeather(hand, lerpVal(-60, -84, t), 0, 3.45, 2);
    hand.translate(0, 0, 0.1);
    drawFlightFeather(hand, lerpVal(-50, -82, t), 0, 3.5, 2, lerpVal(0, -20, t));
    hand.translate(0, 0, 0.1);
    drawFlightFeather(hand, lerpVal(-40, -80, t), lerpVal(0, -0.5, t), 3.55, 2, lerpVal(0, -30, t));
    hand.translate(0, 0, 0.1);
    drawFlightFeather(hand, lerpVal(-31, -76, t), lerpVal(0, -2, t), 3.6, 2, lerpVal(0, -40, t));
    hand.translate(0, 0, 0.1);
    drawFlightFeather(hand, lerpVal(-23, -72, t), lerpVal(0, -4, t), 3.65, 2, lerpVal(0, -50, t));
    hand.translate(0, 0, 0.1);
    drawFlightFeather(hand, lerpVal(-15, -68, t), lerpVal(0, -6, t), 3.7, 2, lerpVal(0, -60, t));

    // secondary flight feathers
    hand.set(root);
    hand.translate(0.1, 0.5, 0.1);
    drawSecondaryFeather(hand, lerpVal(-90, -110, t), 0, 2.5, 2);
    hand.translate(0, 0, 0.1);
    drawSecondaryFeather(hand, lerpVal(-80, -100, t), 0, 2.5, 2);
    hand.translate(0, 0, 0.1);
    drawSecondaryFeather(hand, lerpVal(-70, -90, t), 0, 2.75, 2);
    hand.translate(0, 0, 0.1);
    drawSecondaryFeather(hand, lerpVal(-56, -85, t), 0, 3, 2);
    hand.translate(0, 0, 0.1);
    drawSecondaryFeather(hand, lerpVal(-43, -78, t), 0, 3.35, 2);
    hand.translate(0, 0, 0.1);
    drawSecondaryFeather(hand, lerpVal(-30, -74, t), 0, 3.55, 2);
    hand.translate(0, 0, 0.1);
    drawSecondaryFeather(hand, lerpVal(-15, -72, t), 0, 3.85, 2);

    // top primary feathers
    hand.set(root);
    hand.translate(-0.25, 1.05, 0.1);
    drawPrimaryFeather(hand, lerpVal(-90, -120, t), 0, 0, 2.5, 1.25);
    hand.translate(0, 0, 0.1);
    drawPrimaryFeather(hand, lerpVal(-70, -105, t), 0, 0, 3.25, 1.5);
    hand.translate(0, 0, 0.1);
    drawPrimaryFeather(hand, lerpVal(-50, -90, t), 0, 0, 4.5, 1.75);
    hand.translate(0, 0, 0.1);
    drawPrimaryFeather(hand, lerpVal(-31, -80, t), 0, 0, 5.5, 2);
    hand.translate(0, 0, 0.1);
    drawPrimaryFeather(hand, lerpVal(-15, -70, t), 0, 0, 6, 2);

    // bottom primary feathers
    hand.set(root);
    hand.translate(-0.25, -0.5, 0.1);
    drawPrimaryFeather(hand, lerpVal(-90, -120, t), 0, 0, 2.5, 1.25);
    hand.translate(0, 0, 0.1);
    drawPrimaryFeather(hand, lerpVal(-70, -105, t), 0, 0, 3.25, 1.5);
    hand.translate(0, 0, 0.1);
    drawPrimaryFeather(hand, lerpVal(-50, -90, t), 0, 0, 4.5, 1.75);
    hand.translate(0, 0, 0.1);
    drawPrimaryFeather(hand, lerpVal(-31, -80, t), 0, 0, 5.5, 2);
    hand.translate(0, 0, 0.1);
    drawPrimaryFeather(hand, lerpVal(-15, -70, t), 0, 0, 6, 2);

    hand.set(root).translate(-1, 0, 6.5);
    hand.scale(2, 2, 12)
    applyColor(wingColor);
    drawAltCube(hand);
}

function drawWrist(root) {
    let wrist = new Matrix4();
    wrist.set(root).translate(0, 0, 3).rotate((2 * g_leftWingAngle + 30), 0, 1, 0).rotate((0.4167 * g_leftWingAngle - 3.333), 1, 0, 0).rotate(0.85 * g_leftWingAngle, 0, 0, 1).scale(0.185, 0.185, 0.26);
    
    drawHand(wrist);
    drawCube(wrist);
}

function drawBody(root) {
    applyColor(bodyColor);

    let body = new Matrix4();

    // chest
    body.set(root)
    body.translate(-3.272, -0.238, 0).rotate(29.5, 0, 0, 1).scale(1.162, 1.0, 0.85);
    drawCube(body);

    // rear
    body.set(root);
    body.translate(-2.013, -1.122, 0).rotate(75.9, 0, 0, 1).scale(0.984, 1.601, 0.753);
    drawCube(body);

    // top chest
    body.set(root);
    body.translate(-4.07, 0.612, 0).rotate(1.7, 0, 0, 1).scale(0.76, 0.758, 0.603);
    drawCube(body);

    // bottom neck
    body.set(root);
    body.translate(-4.24, 1.453, 0).rotate(-16.9, 0, 0, 1).scale(0.467, 0.376, 0.458);
    drawCube(body);

    // chin
    body.set(root);
    body.translate(-3.745, 1.103, 0).rotate(12.1, 0, 0, 1).scale(0.673, 1.936, 0.333);
    drawCube(body);

    // back body
    body.set(root);
    body.translate(-3.272, -0.238, 0).rotate(29.5, 0, 0, 1).scale(1.369, 0.601, 0.573);
    drawCube(body);

    // back neck
    body.set(root);
    body.translate(-3.3, 1.798, 0).rotate(18.4, 0, 0, 1).scale(0.417, 1.594, 0.417);
    drawCube(body);

    // brown back body
    body.set(root);
    body.translate(-2.575, 0.381, 0).rotate(30, 0, 0, 1).scale(0.673, 1.594, 0.417);
    drawCube(body);

    // tailbone
    body.set(root);
    body.translate(-0.225, -1.642, 0).rotate(75.9, 0, 0, 1).scale(0.545, 0.887, 0.417);
    drawCube(body);

    // bottom tail feathers
    body.set(root);
    let t2 = g_tailAngle / 50;
    body.translate(-1, -1.35, .5);
    drawFlightFeather(body, lerpVal(7, g_tailAngle * -17, t2), lerpVal(-25, -70, t2), 0.4, 0.5, 0, 0.1);
    drawFlightFeather(body, lerpVal(5, g_tailAngle * -13, t2), lerpVal(-20, -60, t2), 0.6, 0.5, 0, 0.1);
    body.translate(-.1, 0.45, -.25);
    drawFlightFeather(body, lerpVal(2, g_tailAngle * -7, t2), lerpVal(-22, -50, t2), 0.7, 0.5, 0, 0.1);
    body.translate(-.1, 0.45, -.25);
    drawFlightFeather(body, lerpVal(0, g_tailAngle * 0, t2), lerpVal(-25, -50, t2), 0.8, 0.5, 0, 0.1);
    body.translate(.1, -0.45, -.25);
    drawFlightFeather(body, lerpVal(-2, g_tailAngle * 7, t2), lerpVal(-22, -50, t2), 0.7, 0.5, 0, 0.1);
    body.translate(.1, -0.45, -.25);
    drawFlightFeather(body, lerpVal(-5, g_tailAngle * 13, t2), lerpVal(-20, -60, t2), 0.6, 0.5, 0, 0.1);
    drawFlightFeather(body, lerpVal(-7, g_tailAngle * 17, t2), lerpVal(-25, -70, t2), 0.4, 0.5, 0, 0.1);

    // top tail feathers
    body.set(root);
    body.translate(-1, -0.85, .5);
    drawFlightFeather(body, lerpVal(5, g_tailAngle * -15, t2), lerpVal(-20, -60, t2), 0.4, 0.5, 0, 0.1, true);
    body.translate(-.1, 0.3, -.25);
    drawFlightFeather(body, lerpVal(2, g_tailAngle * -7, t2), lerpVal(-22, -50, t2), 0.5, 0.5, 0, 0.1, true);
    body.translate(-.1, 0.3, -.25);
    drawFlightFeather(body, lerpVal(0, g_tailAngle * 0, t2), lerpVal(-25, -50, t2), 0.6, 0.5, 0, 0.1, true);
    body.translate(.1, -0.3, -.25);
    drawFlightFeather(body, lerpVal(-2, g_tailAngle * 7, t2), lerpVal(-22, -50, t2), 0.5, 0.5, 0, 0.1, true);
    body.translate(.1, -0.3, -.25);
    drawFlightFeather(body, lerpVal(-5, g_tailAngle * 15, t2), lerpVal(-20, -60, t2), 0.4, 0.5, 0, 0.1, true);
}

function drawHead(root) {
    let body = new Matrix4();
    body.set(root)
    body.translate(-3.256, 3.07, 0).rotate(g_headY, 0, 0, 1).rotate(g_headX, 0, 1, 0)
    body.scale(-1, 1, 1);
    body.translate(-0.75, 0, 0);
    drawTopBeak(body);
    drawBottomBeak(body);
    body.translate(0.75, 0, 0);

    applyColor(headColor);
    //body.scale(0.860, 0.507, 0.381);
    body.scale(-1, 1, 1);
    body.scale(0.860 * 2, 0.507 * 2, 0.35 * 2);
    drawAltCube(body);
}

function drawTopBeak(root) {
    applyColor(beakColor);

    let beak = new Matrix4();

    // draw main top beak
    beak.set(root);
    beak.translate(-.5, 0, 0).rotate(g_topBeakAngle, 0, 0, 1).translate(-0.544, 0.103, 0);

    // drawk all children of top beak
    drawTopBeakParts(beak);
    beak.scale(0.525, 0.146, 0.176);
    drawCube(beak);
}

function drawBottomBeak(root) {
    applyColor(bottomBeakColor);

    let beak = new Matrix4();

    beak.set(root);
    beak.translate(-.5, 0, 0).rotate(g_bottomBeakAngle, 0, 0, 1).translate(-.51, -0.18, 0);
    drawBottomBeakParts(beak);
    beak.scale(0.525, 0.076, 0.107);
    drawCube(beak);
}

function drawBottomBeakParts(root) {
    let parts = new Matrix4();

    // bottom beak pike
    parts.set(root);
    parts.translate(-0.501, 0.063, 0).rotate(-42.1, 0, 0, 1).scale(0.068, 0.029, 0.044);
    drawCube(parts);

    // bottom beak chin
    parts.set(root);
    parts.translate(0.1, -0.08, 0).rotate(-46.8, 0, 0, 1).scale(0.213, 0.151, 0.06);
    drawCube(parts);
}

function drawTopBeakParts(root) {
    let parts = new Matrix4();
    
    // front top beak
    parts.set(root);
    parts.translate(-0.547, -0.134, 0).rotate(-29.8, 0, 0, 1).scale(0.112, 0.195, 0.146);
    drawCube(parts);

    // peak pike
    parts.set(root);
    parts.translate(-0.652, -0.332, 0).rotate(-3.24, 0, 0, 1).scale(0.052, 0.091, 0.063);
    drawCube(parts);

    // top of top beak
    parts.set(root);
    parts.translate(-0.05, 0.1, 0).rotate(15.4, 0, 0, 1).scale(0.366, 0.156, 0.084);
    drawCube(parts);
}

// helper functions
function lerpVal(a, b, t) {
    return a * (1-t) + b * t;
}

function lerp(a, b, t) {
    return (b - a) * t + a;
}

function lerpVector(a, b, t) {
    let ret = new Vector3();
    ret.elements[0] = lerp(a.elements[0], b.elements[0], t);
    ret.elements[1] = lerp(a.elements[1], b.elements[1], t);
    ret.elements[2] = lerp(a.elements[2], b.elements[2], t);
    return ret;
}

function easeOutLerp(a, b, t) {
    if (t === 0) return a;
    if (t === 1) return b;
  
    if (t < 0.5) {
      t = Math.pow(1.5, 20 * t - 10) / 2;
    } else {
      t = t;
    }
  
    return a + (b - a) * t;
}