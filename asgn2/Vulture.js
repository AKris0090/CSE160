let headColor = [1, 1, 1, 1];
let whiskerColor = [0.105, 0.133, 0.153, 1.0];
let eyeColor = [0.862, 0.027, 0, 1.0];
let beakColor = [0.553, 0.471, 0.38, 1.0];
let scalpColor = [0.9610, 0.667, 0.275, 1.0];
let chinColor = [0.886, 0.207, 0.125, 1.0];
let chestColor = [0.875, 0.305, 0.02, 1.0];
let bodyColor = [0.953, 0.584, 0.22, 1.0];
let thighColor = [0.988, 0.788, 0.349, 1.0];
let darkBrown = [0.275, 0.129, 0.063, 1.0];
let lightBrown = [0.561, 0.38, 0.235, 1.0];
let lightestBrown = [0.622, 0.5, 0.37, 1.0]
let footColor = [0.796, 0.529, 0.337, 1.0];
let black = [0.0, 0.0, 0.0, 1.0];

class Vulture {
    constructor() {
        this.queuedAnims = [];
    }
  
    render() {
        renderVulture(this);
    }
}

function applyColor(rgba) {
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
}

function wingSmoothing(elapsed, o, from) {
    let a = Math.min(elapsed / g_catchupTime, 1);
    if(!o.func) {
        return lerpVal(from, o.position, a);
    }
    if(o.func === "sine") {
        return lerpVal(from, getPhaseCorrectedSine(g_catchupTime, o), a);
    } else {
        return lerpVal(from, getPhaseCorrectedCosine(g_catchupTime, o), a);
    }
}


let g_waitFlapStart = null;
let g_waitFlapLimit = 23;

let g_headPosStartTime = 0;
let g_waitHeadPos = 0;

function choseRandomHeadPos(vul) {
    let elapsedFlap = g_currentTime - g_waitFlapStart;
    if(elapsedFlap > 30) {
        let flap = Math.random() < 0.75 ? true : false;
        if(flap) {
            vul.queuedAnims.push(stopFlapping);
            vul.queuedAnims.push(startFlapping);
        }
        g_waitFlapStart = g_currentTime;
    }
    let elapsedHead = g_currentTime - g_headPosStartTime;
    if(elapsedHead > g_waitHeadPos) {
        let head = Math.random() < 0.8 ? true : false;
        if(head) {
            vul.queuedAnims.push({
                time: 0.15,
                delay: 0,
                headX: 180 + (Math.random() * 50 - 25),
                headY: -19.2 + (Math.random() * 20 - 5),
                headZ: Math.random * 30 - 15,
                wingAngle: {
                    enabled: false,
                },
                wingUpAngle: {
                    enabled: false,
                },
                wingFrontAngle: {
                    enabled: false,
                }
            });
            g_waitHeadPos = Math.random() * 4;
        }
        g_headPosStartTime = g_currentTime;
    }
}

function updateVultureAnimation(vul) {
    if(g_waitFlapStart == null) {
        g_waitFlapStart = g_currentTime;
    }
    if(g_moving === false) {
        choseRandomHeadPos(vul);
    }

    if (!currentAnim && vul.queuedAnims && vul.queuedAnims.length > 0) {
        currentAnim = vul.queuedAnims.pop();
        g_animStartTime = g_currentTime;
        g_startPose = getCurrentPose();
        g_moving = true;
        if(currentAnim.canStop && currentAnim.canStop === false) {
            g_moving = false;
        }
        g_wingNeedCatchup = !g_keepWings;
        if(currentAnim.needCatch === false) {
            g_wingNeedCatchup = false;
        }

        if(currentAnim.keepWing && g_keepWings === false) {
            g_keepWings = true;
            g_previousWingO = currentAnim.wingAngle;
            g_previousUpWingO = currentAnim.wingUpAngle;
            g_previousFrontWingO = currentAnim.wingFrontAngle;
            g_previousDelay = currentAnim.delay;
            g_previousStartTime = g_animStartTime;
        } else if(currentAnim.keepWing === false){
            g_keepWings = false;
            g_previousWingO = null;
            g_previousUpWingO = null;
            g_previousFrontWingO = null;
            g_previousDelay = -1;
            g_previousStartTime = 0;
        }
    }

    block: {
        if(currentAnim) {
            let elapsed = g_currentTime - g_animStartTime;

            let duration = currentAnim.time;
            let a = Math.min(1, elapsed / duration);

            let from = g_startPose;
            let to = currentAnim;

            let flapStartTime = g_animStartTime + currentAnim.delay;
            let elapsedFlap = g_currentTime - flapStartTime;
            elapsedFlap = Math.max(0, elapsedFlap); 

            wing: {

                if(elapsed < currentAnim.delay) {
                    break wing;
                }

                if(currentAnim.wingAngle.enabled && currentAnim.wingAngle.enabled === true) {
                    let g_previousO = currentAnim.wingAngle;
                    if(g_previousO.func === 'sine') {
                        g_wingNeedCatchup? val = wingSmoothing(elapsedFlap, g_previousO, from.wingAngle.position) : val = getPhaseCorrectedSine(elapsedFlap, g_previousO);
                    } else {
                        g_wingNeedCatchup? val = wingSmoothing(elapsedFlap, g_previousO, from.wingAngle.position) : val = getPhaseCorrectedCosine(elapsedFlap, g_previousO);
                    }
                    g_leftWingAngle = val;
                } else {
                    currentAnim.wingAngle.position? g_leftWingAngle = lerpVal(from.wingAngle.position, to.wingAngle.position, a): null;
                }

                if(currentAnim.wingUpAngle.enabled && currentAnim.wingUpAngle.enabled === true) {
                    let g_previousO = currentAnim.wingUpAngle;
                    let val;
                    if(g_previousO.func === 'sine') {
                        g_wingNeedCatchup? val = wingSmoothing(elapsedFlap, g_previousO, from.wingUpAngle.position) : val = getPhaseCorrectedSine(elapsedFlap, g_previousO);
                    } else {
                        g_wingNeedCatchup? val = wingSmoothing(elapsedFlap, g_previousO, from.wingUpAngle.position) : val = getPhaseCorrectedCosine(elapsedFlap, g_previousO);
                    }

                    g_wingFrontBackAngle = val;
                } else {
                    currentAnim.wingUpAngle.position? g_wingFrontBackAngle = lerpVal(from.wingUpAngle.position, to.wingUpAngle.position, a): null;
                }

                if(currentAnim.wingFrontAngle.enabled && currentAnim.wingFrontAngle.enabled === true) {
                    let g_previousO = currentAnim.wingFrontAngle;
                    let val;
                    if(g_previousO.func === 'sine') {
                        g_wingNeedCatchup? val = wingSmoothing(elapsedFlap, g_previousO, from.wingFrontAngle.position) : val = getPhaseCorrectedSine(elapsedFlap, g_previousO);
                    } else {
                        g_wingNeedCatchup? val = wingSmoothing(elapsedFlap, g_previousO, from.wingFrontAngle.position) : val = getPhaseCorrectedCosine(elapsedFlap, g_previousO);
                    }

                    g_leftRightWing = val;
                } else {
                    currentAnim.wingFrontAngle.position? g_leftRightWing = lerpVal(from.wingFrontAngle.position, to.wingFrontAngle.position, a): null;
                }
            }

            // elapsed -= currentAnim.delay;
            // a = Math.min(1, elapsed / (duration - currentAnim.delay));
            
            // apply all animation transformations
            currentAnim.posX? g_X = from.posX + (to.posX * a): null;
            currentAnim.posY? g_Y = from.posY + (to.posY * a): null;
            currentAnim.posZ? g_Z = from.posZ + (to.posZ * a): null;

            currentAnim.rotX? g_angleX = from.rotX + (to.rotX * a): null;
            currentAnim.rotY? g_angleY = from.rotY + (to.rotY * a): null;
            currentAnim.rotZ? g_angleZ = from.rotZ + (to.rotZ * a): null;

            currentAnim.headX? g_headX = lerpVal(from.headX, to.headX, a): null;
            currentAnim.headY? g_headY = lerpVal(from.headY, to.headY, a): null;
            currentAnim.headZ? g_headZ = lerpVal(from.headZ, to.headZ, a): null;

            currentAnim.rightLegX? g_rightLegXAngle = lerpVal(from.rightLegX, to.rightLegX, a): null;
            currentAnim.leftLegX? g_leftLegXAngle = lerpVal(from.leftLegX, to.leftLegX, a): null;

            currentAnim.rightLegY? g_rightLegYAngle = lerpVal(from.rightLegY, to.rightLegY, a): null;
            currentAnim.leftLegY? g_leftLegYAngle = lerpVal(from.leftLegY, to.leftLegY, a): null;

            currentAnim.rightShinX? g_rightShinXAngle = lerpVal(from.rightShinX, to.rightShinX, a): null;
            currentAnim.leftShinX? g_leftShinXAngle = lerpVal(from.leftShinX, to.leftShinX, a): null;

            currentAnim.rightShinY? g_rightShinYAngle = lerpVal(from.rightShinY, to.rightShinY, a): null;
            currentAnim.leftShinY? g_leftShinYAngle = lerpVal(from.leftShinY, to.leftShinY, a): null;

            currentAnim.rightFoot? g_rightFootAngle = lerpVal(from.rightFoot, to.rightFoot, a): null;
            currentAnim.leftFoot? g_leftFootAngle = lerpVal(from.leftFoot, to.leftFoot, a): null;

            currentAnim.tailAngle? g_tailAngle = lerpVal(from.tailAngle, to.tailAngle, a): null;
            
            currentAnim.bottomBeak? g_bottomBeakAngle = lerpVal(from.bottomBeak, to.bottomBeak, a): null;

            currentAnim.leftToeAngle? g_leftToeAngle = lerpVal(from.leftToeAngle, to.leftToeAngle, a): null;
            currentAnim.rightToeAngle? g_rightToeAngle = lerpVal(from.rightToeAngle, to.rightToeAngle, a): null;

            if(elapsed >= g_catchupTime && g_wingNeedCatchup) {
                g_wingNeedCatchup = false;
            }

            if(a >= 1) {
                currentAnim = null;
                if(g_moving === true && vul.queuedAnims.length === 0) {
                    g_moving = false;
                }
            }
        } 
    }
    if ((g_keepWings && currentAnim === null) || (g_keepWings && currentAnim?.wingAngle.enabled === false && currentAnim?.wingUpAngle.enabled === false && currentAnim?.wingFrontAngle.enabled === false)) {
        let elapsed = g_currentTime - g_previousStartTime - g_previousDelay;
        if(g_previousWingO.func === 'sine') {
            g_leftWingAngle = getPhaseCorrectedSine(elapsed, g_previousWingO);
        } else {
            g_leftWingAngle = getPhaseCorrectedCosine(elapsed, g_previousWingO);
        }

        if(g_previousUpWingO.func === 'sine') {
            g_wingFrontBackAngle = getPhaseCorrectedSine(elapsed, g_previousUpWingO);
        } else {
            g_wingFrontBackAngle = getPhaseCorrectedCosine(elapsed, g_previousUpWingO);
        }

        if(g_previousFrontWingO.func === 'sine') {
            g_leftRightWing = getPhaseCorrectedSine(elapsed, g_previousFrontWingO);
        } else {
            g_leftRightWing = getPhaseCorrectedCosine(elapsed, g_previousFrontWingO);
        }
    }
}

let g_catchupTime = 0.1;
let g_keepWings = false;
let g_previousWingO = null;
let g_previousUpWingO = null;
let g_previousFrontWingO = null;
let g_previousDelay = -1;
let g_previousStartTime = -1;

let g_wingNeedCatchup = false;
let g_moving = false;
let g_startPose = null;
let g_animStartTime = -1;

let g_topBeakAngle = 0;
let g_bottomBeakAngle = 0;

let g_X = 0;
let g_Y = 0;
let g_Z = 0;

let g_angleX = 0;
let g_angleY = 0;
let g_angleZ = 0;

let g_headX = 180;
let g_headY = -19.2;
let g_headZ = 0;

let g_leftWingAngle = 70;
let g_elbowAngle = -165;
let g_wristAngle = 80;
let g_wingFrontBackAngle = 0;
let g_tailAngle = 0;

let g_leftLegXAngle = -90;
let g_leftLegYAngle = 3;
let g_leftShinXAngle = 0;
let g_leftShinYAngle = 0;
let g_leftFootAngle = 0;
let g_leftToeAngle = 0;

let g_rightLegXAngle = -90;
let g_rightLegYAngle = -3;
let g_rightShinXAngle = 0;
let g_rightShinYAngle = 0;
let g_rightFootAngle = 0;
let g_rightToeAngle = 0;

let g_leftRightWing = -40;
let g_handXAngle = 0;
let g_handYAngle = 0;
let g_handZAngle = 0;

function getCurrentPose() {
    return {
        posX: g_X,
        posY: g_Y,
        posZ: g_Z,

        rotX: g_angleX,
        rotY: g_angleY,
        rotZ: g_angleZ,

        headX: g_headX,
        headY: g_headY,
        headZ: g_headZ,

        rightLegX: g_rightLegXAngle,
        leftLegX: g_leftLegXAngle,

        rightLegY: g_rightLegYAngle,
        leftLegY: g_leftLegYAngle,

        rightShinX: g_rightShinXAngle,
        leftShinX: g_leftShinXAngle,

        rightShinY: g_rightShinYAngle,
        leftShinY: g_leftShinYAngle,

        rightFoot: g_rightFootAngle,
        leftFoot: g_leftFootAngle,

        wingAngle: {
            position: g_leftWingAngle,
        },

        wingUpAngle: {
            position: g_wingFrontBackAngle,
        },

        wingFrontAngle: {
            position: g_leftRightWing,
        },

        tailAngle: g_tailAngle,

        bottomBeak: g_bottomBeakAngle,

        leftToeAngle: g_leftToeAngle,
        rightToeAngle: g_rightToeAngle,
    };
}

let identity = new Matrix4();

let t = g_leftWingAngle / 80;

let currentAnim = null;

function renderVulture(vul) {
    updateVultureAnimation(vul);
    t = g_leftWingAngle / 80;

    var m = new Matrix4();
    m.translate(g_X, g_Y, g_Z).rotate(g_angleX, 1, 0, 0).rotate(g_angleY, 0, 1, 0).rotate(g_angleZ, 0, 0, 1);
    drawBody(m);

    // change head direction
    drawHead(m);

    drawWing(m, 1);
    drawWing(m, -1);

    drawLeg(m, 0);
    drawLeg(m, 1);
}
let toe = new Matrix4();

function drawToe(root, angle, length, legType, talon = false) {
    applyColor(footColor);

    toe.set(root);

    let g_toeAngle = legType === 1? g_rightToeAngle : g_leftToeAngle;
    
    toe.translate(1, 0, 0);
    let g_footZAngle = legType === 1 ? g_rightFootAngle : g_leftFootAngle;
    toe.rotate(g_footZAngle, 0, 0, 1); // Rotate entire foot around Z axis
    toe.rotate(angle, 1, 0, 0).rotate(-70, 0, 0, 1).rotate(talon? g_toeAngle: g_toeAngle, 0, 0, 1).scale(length / 3, 0.2, 0.2);
    drawAltCube(toe);
    toe.translate(1, 0, 0).scale(1 / (length / 3), 5, 5).rotate(g_toeAngle * 3, 0, 0, 1).scale(length / 3, 0.2, 0.2);
    drawAltCube(toe);

    // apply talon color
    applyColor(black);
    toe.translate(1, 0, 0).scale(1 / (length / 3), 5, 5).rotate(g_toeAngle * 5, 0, 0, 1).scale(0.3, 0.15, 0.05);
    drawAltCube(toe);
}

let shin = new Matrix4();
function drawShin(root, legType) {
    applyColor(lightBrown);
    shin.set(root);

    if(legType === 1) {
        shin.translate(1.85, -0.25, 0).rotate(g_leftShinXAngle, 0, 0, 1).rotate(g_leftShinYAngle, 1, 0, 0);
        shin.scale(1.05, 0.25, 0.25);
        drawAltCube(shin);
        shin.scale(1/1.05, 4, 4);
    } else {
        shin.translate(1.85, -0.25, 0).rotate(g_rightShinXAngle, 0, 0, 1).rotate(g_rightShinYAngle, 1, 0, 0);
        shin.scale(1.05, 0.25, 0.25);
        drawAltCube(shin);
        shin.scale(1/1.05, 4, 4);
    }

    shin.rotate(legType===1?1.5:-1.5, 1, 0, 0);

    drawToe(shin, 30, 1.5, legType);
    drawToe(shin, 0, 2, legType);
    drawToe(shin, -30, 1.5, legType);
    drawToe(shin, 180, 1.5, legType, true);
}

let thigh = new Matrix4();
function drawLeg(root, legType) {
    if(legType === 1) {
        thigh.set(root);
        thigh.translate(-2.571, -0.621, -0.563).rotate(g_leftLegXAngle, 0, 0, 1).rotate(g_leftLegYAngle, 0, 1, 0);
        drawShin(thigh, legType);
        applyColor(thighColor);
        thigh.scale(1.168 * 2, 0.593 * 2, 0.39 * 2);
        drawAltCube(thigh);
    } else {
        thigh.set(root);
        thigh.translate(-2.571, -0.621, 0.563).rotate(g_rightLegXAngle, 0, 0, 1).rotate(g_rightLegYAngle, 0, 1, 0)
        drawShin(thigh, legType);
        applyColor(thighColor);
        thigh.scale(1.168 * 2, 0.593 * 2, 0.39 * 2);
        drawAltCube(thigh);
    }
}

function drawWing(root, mirror) {
    applyColor(darkBrown);

    let shoulder = new Matrix4().set(root);
    if(mirror == -1) {
        shoulder.scale(1, 1, -1); // reflect across Z
    }

    shoulder.translate(-2.5, 0.85, 0.65).rotate(g_leftRightWing, 0, 0, 1).rotate(g_leftWingAngle, 0, 1, 0).rotate(lerpVal(g_wingFrontBackAngle, 0, t), 1, 0, 0);
    
    drawTopWing(shoulder);

    shoulder.scale(0.2, 0.082, 0.2);
    drawCube(shoulder);
}

let feather = new Matrix4();
function drawFlightFeather(root, angle, angle2, length, width, angle3 = 0, height = 0.2, altColor = false) {
    if(altColor) {
        applyColor(lightBrown);
    } else {
        applyColor(lightestBrown);
    }
    feather.set(root);
    feather.rotate(angle, 0, 1, 0).rotate(angle2, 0, 0, 1).rotate(angle3, 1, 0, 0).scale(length * 6, height, width);
    drawAltCube(feather);
}


let feather2 = new Matrix4();
function drawSecondaryFeather(root, angle, angle2, length, width) {
    applyColor(lightBrown);
    feather2.set(root);
    feather2.rotate(angle, 0, 1, 0).rotate(angle2, 0, 0, 1).scale(length * 4, 1.1, width);
    drawAltCube(feather2);
}

let feather3 = new Matrix4();
function drawPrimaryFeather(root, angle, angle2, angle3, length, width, height = 0.75) {
    applyColor(darkBrown);
    feather3.set(root);
    feather3.rotate(angle3, 0, 0, 1).rotate(angle, 0, 1, 0).rotate(angle2, 1, 0, 0).scale(length * 2, height, width);
    drawAltCube(feather3);
}

let topWing = new Matrix4();
function drawTopWing(root) {

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

    applyColor(darkBrown);
    topWing.set(root);
    topWing.translate(0, 0, -1).scale(0.2, 0.2, 1).translate(0, 0, 1.25);
    drawCube(topWing);

    topWing.scale(5, 5, 1);
    drawElbow(root);
}

let foreArm = new Matrix4();
function drawForeArm(root) {
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
    drawFlightFeather(foreArm, lerpVal(10, 98, t), lerpVal(0, -50, t), 3.5, 2.4, lerpVal(0, 90, t));
    foreArm.translate(0, 0, 2.5);
    drawFlightFeather(foreArm, lerpVal(10, 98, t), lerpVal(0, -50, t), 3.6, 2.4, lerpVal(0, 90, t));
    foreArm.translate(0, 0, 2.5);
    drawFlightFeather(foreArm, lerpVal(10, 98, t), lerpVal(0, -50, t), 3.8, 2.4, lerpVal(0, 90, t));
    foreArm.translate(0, 0, 2.5);
    drawFlightFeather(foreArm, lerpVal(10, 98, t), lerpVal(0, -50, t), 3.85, 2.4, lerpVal(0, 90, t));
    foreArm.translate(0, 0, 2.5);
    drawFlightFeather(foreArm, lerpVal(10, 98, t), lerpVal(0, -50, t), 3.9, 2.4, lerpVal(0, 90, t));

    applyColor(darkBrown);
    foreArm.set(root).translate(0, 0, -1.5).scale(1, 1, 7).translate(0, 0, 1);
    drawCube(foreArm);
}

let elbow = new Matrix4();
function drawElbow(root) {
    elbow.set(root).translate(0, 0, 1.25).rotate((-2.0567 * g_leftWingAngle -11.6667), 0, 1, 0).rotate((0.4167 * g_leftWingAngle - 3.333), 1, 0, 0).scale(0.185, 0.185, 0.26);

    drawForeArm(elbow);
    drawCube(elbow);
    elbow.scale(5.4054, 5.4054, 3.846);
    drawWrist(elbow);
}

let hand = new Matrix4();
function drawHand(root) {
    hand.set(root);

    // draw primary flight feathers
    hand.translate(0.1, 0.6, 0.1);
    drawFlightFeather(hand, lerpVal(-90, -105, t), 0, 3.3, 2);
    hand.translate(0, 0, 0.1);
    drawFlightFeather(hand, lerpVal(-80, -100, t), 0, 3.35, 2);
    hand.translate(0, 0, 0.1);
    drawFlightFeather(hand, lerpVal(-70, -96, t), 0, 3.4, 2);
    hand.translate(0, 0, 0.1);
    drawFlightFeather(hand, lerpVal(-60, -92, t), 0, 3.45, 2);
    hand.translate(0, 0, 0.1);
    drawFlightFeather(hand, lerpVal(-50, -88, t), 0, 3.5, 2, lerpVal(0, -20, t));
    hand.translate(0, 0, 0.1);
    drawFlightFeather(hand, lerpVal(-40, -84, t), lerpVal(0, -0.5, t), 3.55, 2, lerpVal(0, -30, t));
    hand.translate(0, 0, 0.1);
    drawFlightFeather(hand, lerpVal(-31, -80, t), lerpVal(0, -2, t), 3.6, 2, lerpVal(0, -40, t));
    hand.translate(0, 0, 0.1);
    drawFlightFeather(hand, lerpVal(-23, -76, t), lerpVal(0, -4, t), 3.65, 2, lerpVal(0, -50, t));
    hand.translate(0, 0, 0.1);
    drawFlightFeather(hand, lerpVal(-15, -72, t), lerpVal(0, -6, t), 3.7, 2, lerpVal(0, -60, t));

    // secondary flight feathers
    hand.set(root);
    hand.translate(0.1, 0.5, 0.1);
    drawSecondaryFeather(hand, lerpVal(-90, -110, t), 0, 2.25, 2);
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

    hand.set(root).translate(-1, 0, 2.5)
    hand.scale(2, 2, 7)
    applyColor(darkBrown);
    drawAltCube(hand);
}

let g_xWing = 20;
let g_yWing = 170;
let g_zWing = 73;

let wrist = new Matrix4();
function drawWrist(root) {
    // wrist.set(root).translate(0, 0, 3).rotate((2 * g_leftWingAngle + 30), 0, 1, 0).rotate((0.4167 * g_leftWingAngle - 3.333), 1, 0, 0).rotate(0.85 * g_leftWingAngle, 0, 0, 1).scale(0.185, 0.185, 0.26);
    //wrist.set(root).translate(0, 0, 3).rotate(g_yWing, 0, 1, 0).rotate(g_xWing, 1, 0, 0).rotate(g_zWing, 0, 0, 1).scale(0.185, 0.185, 0.26);

    wrist.set(root).translate(0, 0, 3).rotate(2 * g_leftWingAngle + 30, 0, 1, 0).rotate(0.333 * g_leftWingAngle -3.333, 1, 0, 0).rotate(1.042 * g_leftWingAngle, 0, 0, 1).scale(0.185, 0.185, 0.26);

    drawHand(wrist);
    drawCube(wrist);
}

let body = new Matrix4();
function drawBody(root) {
    
    applyColor(bodyColor);
    // chest
    body.set(root)
    body.translate(-3.272, -0.238, 0).rotate(29.5, 0, 0, 1).scale(1.162, 1.0, 0.85);
    drawCube(body);

    // rear
    body.set(root);
    body.translate(-2.013, -1.122, 0).rotate(75.9, 0, 0, 1).scale(0.984, 1.601, 0.753);
    drawCube(body);

    applyColor(chestColor);
    // top chest
    body.set(root);
    body.translate(-4.07, 0.612, 0).rotate(1.7, 0, 0, 1).scale(0.76, 0.758, 0.55);
    drawCube(body);

    // bottom neck
    body.set(root);
    body.translate(-4.24, 1.453, 0).rotate(-16.9, 0, 0, 1).scale(0.467, 0.376, 0.35);
    drawCube(body);

    applyColor(chinColor);
    // chin
    body.set(root);
    body.translate(-3.745, 1.103, 0).rotate(12.1, 0, 0, 1).scale(0.673, 1.236, 0.15);
    drawCube(body);

    // back chin
    body.set(root);
    body.translate(-3.95, 1.15, 0).rotate(12.1, 0, 0, 1).scale(0.273, 1.236, 0.15);
    drawCube(body);

    // furthest back chin
    body.set(root);
    body.translate(-3.65, 1.35, 0).rotate(12.1, 0, 0, 1).scale(0.273, 1.236, 0.15);
    drawCube(body);

    // back body
    applyColor(scalpColor);
    body.set(root);
    body.translate(-3.272, -0.238, 0).rotate(29.5, 0, 0, 1).scale(1.369, 0.601, 0.3);
    drawCube(body);

    // back neck
    body.set(root);
    body.translate(-3.3, 1.798, 0).rotate(18.4, 0, 0, 1).rotate((g_headX - 180) * 1.1, 0, 1, 0).scale(0.417, 1.594, 0.4);
    drawCube(body);

    // tailbone
    body.set(root);
    body.translate(-0.225, -1.642, 0).rotate(75.9, 0, 0, 1).scale(0.545, 0.887, 0.217);
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

let head = new Matrix4();
function drawHead(root) {
    head.set(root)
    head.translate(-3.256, 3.07, 0).rotate(g_headZ, 1, 0, 0).rotate(g_headX, 0, 1, 0).rotate(g_headY + g_topBeakAngle, 0, 0, 1);
    head.scale(-1, 1, 0.75);
    head.translate(-0.75, 0, 0);
    drawTopBeak(head);
    head.translate(0.75, 0, 0);
    head.scale(1, 1, 4/3);

    applyColor(headColor);
    head.scale(-1, 1, 1);
    head.scale(0.825 * 2, 0.575, 0.3);
    head.translate(0.02, 0.15, 0);
    drawAltCube(head);

    // eye black block
    applyColor(whiskerColor);
    head.scale(1.005, 0.6, 1.5);
    head.translate(0.01, -0.05, 0);
    drawAltCube(head);

    // eyes
    applyColor(eyeColor);
    head.translate(0.7, 0, -0.505).rotate(90, 1, 0, 0).scale(0.2, 1.01, 0.8);
    drawCylinder(head);
    applyColor(headColor);
    head.translate(0, -0.005, 0).scale(0.75, 1.01, 0.75);
    drawCylinder(head);
    applyColor(black);
    head.translate(0, -0.005, 0).scale(0.5, 1.01, 0.5);
    drawCylinder(head);

    // bottom head
    head.set(root)
    head.translate(-3.256, 3.07, 0).rotate(g_headZ, 1, 0, 0).rotate(g_headX, 0, 1, 0).rotate(g_headY + g_topBeakAngle - g_bottomBeakAngle, 0, 0, 1);
    head.scale(-1, 1, 1);
    head.translate(-0.75, 0, 0);
    drawBottomBeak(head);
    head.translate(0.75, 0, 0);

    applyColor(thighColor);
    head.scale(-1, 1, 1);
    head.scale(0.825 * 2, 0.3, 0.26);
    head.translate(0.02, -1.05, 0);
    drawAltCube(head);
}

let beak = new Matrix4();
function drawTopBeak(root) {
    // draw main top beak
    beak.set(root).translate(-.5, 0, 0).rotate(14, 0, 0, 1).translate(-0.544, 0.103, 0);

    // draw all children of top beak
    drawTopBeakParts(beak);
    
    applyColor(whiskerColor);
    beak.scale(0.525, 0.146, 0.176);
    drawCube(beak);
}

let beak2 = new Matrix4();
function drawBottomBeak(root) {
    beak2.set(root);
    beak2.translate(-.5, 0, 0).translate(-.51, -0.18, 0);
    drawBottomBeakParts(beak2);
    applyColor(thighColor);
    beak2.scale(0.525, 0.076, 0.075);
    drawCube(beak2);
}

let parts = new Matrix4();
function drawBottomBeakParts(root) {
    // bottom beak pike
    applyColor(beakColor);
    parts.set(root);
    parts.translate(-0.501, 0.063, 0).rotate(-42.1, 0, 0, 1).scale(0.068, 0.029, 0.044);
    drawCube(parts);
}

let parts2 = new Matrix4();
function drawTopBeakParts(root) {
    // front top beak
    parts2.set(root);
    parts2.translate(-0.547, -0.134, 0).rotate(-29.8, 0, 0, 1).scale(0.112, 0.195, 0.05);
    drawCube(parts2);

    // peak pike
    parts2.set(root);
    parts2.translate(-0.652, -0.332, 0).rotate(-3.24, 0, 0, 1).scale(0.052, 0.091, 0.025);
    drawCube(parts2);

    // top of top beak
    applyColor(headColor);
    parts2.set(root);
    parts2.translate(-0.05, 0.1, 0).rotate(15.4, 0, 0, 1).scale(0.366, 0.156, 0.084);
    drawCube(parts2);

    // back moustache
    applyColor(whiskerColor);
    parts2.set(root).translate(-0.4, -0.24, 0.175).rotate(90, 1, 0, 0).scale(0.1, 0.015, 0.15);
    drawCube(parts2);

    parts2.set(root).translate(-0.385, -0.4, 0.175).rotate(90, 1, 0, 0).rotate(20, 0, 1, 0).scale(0.05, 0.015, 0.08);
    drawCube(parts2);

    // front moustache
    parts2.set(root).translate(-0.4, -0.24, -0.175).rotate(90, 1, 0, 0).scale(0.1, 0.015, 0.15);
    drawCube(parts2);

    parts2.set(root).translate(-0.385, -0.4, -0.175).rotate(90, 1, 0, 0).rotate(20, 0, 1, 0).scale(0.05, 0.015, 0.08);
    drawCube(parts2);
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

function getPhaseCorrectedSine(t, o) {
    return Math.sin((t) * o.f + o.s) * o.a + o.v;
}

function getPhaseCorrectedCosine(t, o) {
    return Math.cos((t) * o.f + o.s) * o.a + o.v;
}