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

}

let g_topBeakAngle = 14;
let g_bottomBeakAngle = 10;
let g_headAngle = 0;
let g_leftWingAngle = 0;
let g_elbowAngle = -165;
let g_wristAngle = 80;

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
    t = g_leftWingAngle / 80;

    var m = new Matrix4();
    drawBody(m);

    // change head direction
    drawHead(m);

    m.set(identity);
    drawWing(m, 1);
    drawWing(m, -1);
}

let identity = new Matrix4();

function drawWing(root, mirror) {
    applyColor(wingColor);

    let shoulder = new Matrix4().set(root);
    if(mirror == -1) {
        shoulder.scale(1, 1, -1); // reflect across Z
    }

    shoulder.translate(-2.5, 1.15, 0.65).rotate(-40, 0, 0, 1).rotate(g_leftWingAngle, 0, 1, 0).rotate(lerpVal(-5, 0, t), 1, 0, 0);
    
    drawTopWing(shoulder);

    shoulder.scale(0.2, 0.082, 0.2);
    drawCube(shoulder);
}

function drawFlightFeather(root, angle, angle2, length, width, angle3 = 0) {
    applyColor(featherColor);
    let feather = new Matrix4();
    feather.set(root);
    feather.rotate(angle, 0, 1, 0).rotate(angle2, 0, 0, 1).rotate(angle3, 1, 0, 0).scale(length * 6, 0.2, width);
    drawAltCube(feather);
}

function drawSecondaryFeather(root, angle, angle2, length, width) {
    applyColor(secondaryFeatherColor);
    let feather = new Matrix4();
    feather.set(root);
    feather.rotate(angle, 0, 1, 0).rotate(angle2, 0, 0, 1).scale(length * 4, 0.5, width);
    drawAltCube(feather);
}

function drawPrimaryFeather(root, angle, angle2, angle3, length, width) {
    applyColor(primaryFeatherColor);
    let feather = new Matrix4();
    feather.set(root);
    feather.rotate(angle3, 0, 0, 1).rotate(angle, 0, 1, 0).rotate(angle2, 1, 0, 0).scale(length * 2, 0.75, width);
    drawAltCube(feather);
}

// TODO: MAKE PRIMARY THICKER AND GO BOTH WAYS OF WING

// TODO: LEGS

// TODO: TAIL

// TODO: FACE DECOR

// TODO PERFORMANCE: INSTANTIATE ALL MATRICES AT TOP? to remove any need of new keyword

function drawTopWing(root) {
    let topWing = new Matrix4();

    // top primary feathers
    topWing.set(root);
    topWing.translate(0, 0.15, -0.2).scale(1, 0.25, 1);
    drawPrimaryFeather(topWing, lerpVal(0, -60, t), lerpVal(-5, -50, t), 0, 1, 0.75);
    topWing.translate(0, 0, .65);
    drawPrimaryFeather(topWing, lerpVal(0, -60, t), lerpVal(-5, -10, t), 0, 1, 0.75);
    topWing.translate(0, 0, .65);
    drawPrimaryFeather(topWing, lerpVal(0, -60, t), lerpVal(-5, 0, t), 0, 1.1, 0.75);

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
    drawPrimaryFeather(foreArm, lerpVal(0, 90, t), lerpVal(-5, -50, t), lerpVal(0, -50, t), 5.25, 2.5);
    foreArm.translate(0, 0, 2.5);
    drawPrimaryFeather(foreArm, lerpVal(0, 85, t), lerpVal(-5, -10, t), lerpVal(0, -20, t), 5.75, 2.5);
    foreArm.translate(0, 0, 2.5);
    drawPrimaryFeather(foreArm, lerpVal(0, 80, t), lerpVal(-5, 0, t), lerpVal(0, -10, t), 6, 2.5);
    foreArm.translate(0, 0, 2.5);
    drawPrimaryFeather(foreArm, lerpVal(0, 75, t), lerpVal(-5, 30, t), lerpVal(0, -30, t), 6.25, 2.5);
    foreArm.translate(0, 0, 2.5);
    drawPrimaryFeather(foreArm, lerpVal(0, 70, t), lerpVal(-5, 60, t), lerpVal(0, -45, t), 6, 2.5);

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
    elbow.set(root).translate(0, 0, 1.25).rotate((-1.9167 * g_leftWingAngle -11.6667), 0, 1, 0).rotate((0.4167 * g_leftWingAngle - 3.333), 1, 0, 0).scale(0.185, 0.185, 0.26);

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
    drawFlightFeather(hand, lerpVal(-90, -90, t), 0, 4.5, 2);
    hand.translate(0, 0, 0.1);
    drawFlightFeather(hand, lerpVal(-80, -88, t), 0, 4.4, 2);
    hand.translate(0, 0, 0.1);
    drawFlightFeather(hand, lerpVal(-70, -86, t), 0, 4.3, 2);
    hand.translate(0, 0, 0.1);
    drawFlightFeather(hand, lerpVal(-60, -84, t), 0, 4.2, 2);
    hand.translate(0, 0, 0.1);
    drawFlightFeather(hand, lerpVal(-50, -82, t), 0, 4.15, 2);
    hand.translate(0, 0, 0.1);
    drawFlightFeather(hand, lerpVal(-40, -80, t), 0, 4.1, 2);
    hand.translate(0, 0, 0.1);
    drawFlightFeather(hand, lerpVal(-31, -78, t), 0, 3.95, 2);
    hand.translate(0, 0, 0.1);
    drawFlightFeather(hand, lerpVal(-23, -76, t), 0, 3.9, 2);
    hand.translate(0, 0, 0.1);
    drawFlightFeather(hand, lerpVal(-15, -74, t), 0, 3.85, 2);

    // secondary flight feathers
    hand.set(root);
    hand.translate(0.1, 0, 0.1);
    drawSecondaryFeather(hand, lerpVal(-90, -90, t), 0, 4.5, 2);
    hand.translate(0, 0, 0.1);
    drawSecondaryFeather(hand, lerpVal(-80, -90, t), 0, 4.4, 2);
    hand.translate(0, 0, 0.1);
    drawSecondaryFeather(hand, lerpVal(-70, -90, t), 0, 4.3, 2);
    hand.translate(0, 0, 0.1);
    drawSecondaryFeather(hand, lerpVal(-56, -90, t), 0, 4.2, 2);
    hand.translate(0, 0, 0.1);
    drawSecondaryFeather(hand, lerpVal(-43, -90, t), 0, 4.15, 2);
    hand.translate(0, 0, 0.1);
    drawSecondaryFeather(hand, lerpVal(-30, -90, t), 0, 3.95, 2);
    hand.translate(0, 0, 0.1);
    drawSecondaryFeather(hand, lerpVal(-15, -90, t), 0, 3.85, 2);

    // bottom primary feathers
    hand.set(root);
    hand.translate(-0.25, -1.05, 0.1);
    drawPrimaryFeather(hand, lerpVal(-90, -90, t), 0, 0, 4.5, 2);
    hand.translate(0, 0, 0.1);
    drawPrimaryFeather(hand, lerpVal(-70, -90, t), 0, 0, 4.3, 2);
    hand.translate(0, 0, 0.1);
    drawPrimaryFeather(hand, lerpVal(-43, -90, t), 0, 0, 4.15, 2);
    hand.translate(0, 0, 0.1);
    drawPrimaryFeather(hand, lerpVal(-20, -90, t), 0, 0, 3.95, 2);

    // top primary feathers
    hand.set(root);
    hand.translate(-0.25, 1.05, 0.1);
    drawPrimaryFeather(hand, lerpVal(-90, -90, t), 0, 0, 7.5, 2);
    hand.translate(0, 0, 0.1);
    drawPrimaryFeather(hand, lerpVal(-70, -85, t), 0, 0, 7, 2);
    hand.translate(0, 0, 0.1);
    drawPrimaryFeather(hand, lerpVal(-50, -80, t), 0, 0, 6.5, 2);
    hand.translate(0, 0, 0.1);
    drawPrimaryFeather(hand, lerpVal(-31, -75, t), 0, 0, 6, 2);
    hand.translate(0, 0, 0.1);
    drawPrimaryFeather(hand, lerpVal(-15, -70, t), 0, 0, 5.5, 2);

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
    body.translate(-3.272, -0.238, 0).rotate(29.5, 0, 0, 1).scale(1.162, 1.0, 1.106);
    drawCube(body);

    // rear
    body.set(root);
    body.translate(-2.013, -1.122, 0).rotate(75.9, 0, 0, 1).scale(0.984, 1.601, 0.753);
    drawCube(body);

    // top chest
    body.set(root);
    body.translate(-4.07, 0.612, 0).rotate(1.7, 0, 0, 1).scale(0.76, 0.758, 0.723);
    drawCube(body);

    // bottom neck
    body.set(root);
    body.translate(-4.24, 1.453, 0).rotate(-16.9, 0, 0, 1).scale(0.467, 0.376, 0.508);
    drawCube(body);

    // top neck
    body.set(root);
    body.translate(-3.576, 0.793, 0).rotate(19.4, 0, 0, 1).scale(0.673, 1.636, 0.363);
    drawCube(body);

    // back body
    body.set(root);
    body.translate(-3.272, -0.238, 0).rotate(29.5, 0, 0, 1).scale(1.369, 0.601, 0.573);
    drawCube(body);

    // brown back body
    body.set(root);
    body.translate(-2.899, 0.557, 0).rotate(30, 0, 0, 1).scale(0.673, 2.046, 0.417);
    drawCube(body);

    // tailbone
    body.set(root);
    body.translate(-0.225, -1.642, 0).rotate(75.9, 0, 0, 1).scale(0.545, 0.887, 0.417);
    drawCube(body);

    body.set(root);
    body.translate(0, -1.7, 0);
    drawFlightFeather(body, 100 * (0 / 5) -50, 50 * (0 / 5) -25, 0.75);
    drawFlightFeather(body, 100 * (1 / 5) -50, 50 * (0 / 5) -25, 0.75);
    drawFlightFeather(body, 100 * (2 / 5) -50, 50 * (0 / 5) -25, 0.75);
    drawFlightFeather(body, 100 * (3 / 5) -50, 50 * (0 / 5) -25, 0.75);
    drawFlightFeather(body, 100 * (4 / 5) -50, 50 * (0 / 5) -25, 0.75);
    drawFlightFeather(body, 100 * (5 / 5) -50, 50 * (0 / 5) -25, 0.75);
}

function drawHead(root) {
    let body = new Matrix4();
    body.set(root)
    body.translate(-4.056, 2.817, 0).rotate(19.2, 0, 0, 1).rotate(g_headAngle, 0, 1, 0);
    drawTopBeak(body);
    drawBottomBeak(body);

    applyColor(headColor);
    body.scale(0.860, 0.507, 0.381);
    drawCube(body);
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
    parts.translate(0.101, 0.162, 0).rotate(26.4, 0, 0, 1).scale(0.366, 0.106, 0.084);
    drawCube(parts);

    // left top beak
    parts.set(root);
    parts.translate(0.203, -0.019, 0.138).rotate(2, 0, 0, 1).rotate(-19.4, 0, 1, 0).rotate(-0.684, 1, 0, 0).scale(0.28, 0.09, 0.135);
    drawCube(parts);
    
    // right top beak
    parts.set(root);
    parts.translate(0.199, -0.021, -0.139).rotate(1.98, 0, 0, 1).rotate(21, 0, 1, 0).rotate(-0.743, 1, 0, 0).scale(0.28, 0.09, 0.135);
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