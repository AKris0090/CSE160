// TODO: add keyframes that match up to the bird eating the bone

// bone
let delay = {
    time: 1.65,
}

let bonePause = {
    time: 1
}

let throwUp = {
    time: 0.7,
    posX: -6.7,
    posY: 2.75,
    angleZ: 120
}

let up = {
    time: 0.35,
    posX: -5,
    posY: 3,
    angleZ: 140
}

let down = {
    time: 0.35,
    posX: -4.9,
    posY: 2.15,
    angleZ: 130
}

let up2 = {
    time: 0.35,
    posX: -4.8,
    posY: 2,
    angleZ: 150
}

let down2 = {
    time: 0.35,
    posX: -4.3,
    posY: 1.25,
    angleZ: 145
}

let up3 = {
    time: 0.35,
    posX: -4.3,
    posY: 0,
    angleZ: 155
}

let down3 = {
    time: 0.35,
    posX: -3.9,
    posY: -1,
    angleZ: 170
}

// vulture
let bendForPickup = {
    time: 0.65,
    delay: 0,
    posX: -2.75,
    rotZ: 40,
    headX: 180,
    headZ: 0,
    headY: -5,
    rightLegX: -50,
    leftLegX: -50,
    rightShinX: -90,
    leftShinX: -90,
    bottomBeak: 30,
    wingAngle: {
        enabled: false,
        position: 70,
    },
    wingUpAngle: {
        enabled: false,
        position: 0,
    },
    wingFrontAngle: {
        enabled: false,
        position: -40,
    },
    keepWing: false,
    needCatch: false
}

let pickup = {
    time: 0.65,
    delay: 0,
    posX: 2,
    rotZ: -30,
    headX: 180,
    headY: 40,
    rightLegX: -60,
    leftLegX: -60,
    rightShinX: -60,
    leftShinX: -60,
    leftFoot: 15,
    rightFoot: 15,
    bottomBeak: 30,
    wingAngle: {
        enabled: false,
        position: 70,
    },
    wingUpAngle: {
        enabled: false,
        position: 0,
    },
    wingFrontAngle: {
        enabled: false,
        position: -40,
    },
    keepWing: false,
    needCatch: false
}

let tiltUp = {
    time: 0.35,
    delay: 0,
    headY: 90,
    bottomBeak: 45,
    wingAngle: {
        enabled: false,
        position: 70,
    },
    wingUpAngle: {
        enabled: false,
        position: 0,
    },
    wingFrontAngle: {
        enabled: false,
        position: -40,
    },
    keepWing: false,
    needCatch: false
}

let tiltDown = {
    time: 0.35,
    delay: 0,
    headY: 50,
    bottomBeak: 35,
    wingAngle: {
        enabled: false,
        position: 70,
    },
    wingUpAngle: {
        enabled: false,
        position: 0,
    },
    wingFrontAngle: {
        enabled: false,
        position: -40,
    },
    keepWing: false,
    needCatch: false
}

let pause = {
    time: 0.5,
    delay: 0,
    wingAngle: {
        enabled: false,
        position: 70,
    },
    wingUpAngle: {
        enabled: false,
        position: 0,
    },
    wingFrontAngle: {
        enabled: false,
        position: -40,
    },
    keepWing: false,
    needCatch: false
}

let secondPause = {
    time: 1,
    delay: 0,
    wingAngle: {
        enabled: false,
        position: 70,
    },
    wingUpAngle: {
        enabled: false,
        position: 0,
    },
    wingFrontAngle: {
        enabled: false,
        position: -40,
    },
    keepWing: false,
    needCatch: false
}

let stop = {
    time: 500,
    delay: 0,
    wingAngle: {
        enabled: false,
        position: 70,
    },
    wingUpAngle: {
        enabled: false,
        position: 0,
    },
    wingFrontAngle: {
        enabled: false,
        position: -40,
    },
    keepWing: false,
    needCatch: false
}

let resetBone = {
    time: 0.2,
    delay:0,
    headY: -19.2,
    posX: 0.75,
    rotZ: -10,
    bottomBeak: 0.01,
    rightLegX: -90,
    leftLegX: -90,
    leftShinX: 0.01,
    rightShinX: 0.01,
    leftFoot: 0.01,
    rightFoot: 0.01,
    wingAngle: {
        enabled: false,
        position: 70,
    },
    wingUpAngle: {
        enabled: false,
        position: 0,
    },
    wingFrontAngle: {
        enabled: false,
        position: -40,
    },
}