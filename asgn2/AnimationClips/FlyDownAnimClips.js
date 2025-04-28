// Animation keyframes for flying from up to down
let startReturn = {
    time: 0.65,
    delay: 0,
    posX: 2.5,
    rotZ: 40,
    headX: 180,
    headZ: 0,
    headY: -15,
    rightLegX: -50,
    leftLegX: -50,
    rightShinX: -90,
    leftShinX: -90,
    wingAngle: {
        position: 15,
        enabled: false
    },
    wingUpAngle: {
        position: -90,
        enabled: false
    },
    wingFrontAngle: {
        position: -40,
        enabled: false
    },
    tailAngle: 12,
    keepWing: false,
    needCatch: false
}

let jumpReturn = {
    time: 0.48,
    delay: 0,
    posX: 3,
    posY: 2,
    rotZ: -20,
    rightLegX: -80,
    leftLegX: -80,
    rightShinX: -40,
    leftShinX: -40,
    wingAngle: {
        enabled: false,
        position: 15,
        func: "sine",
        a: 50,
        f: 5,
        s: 0,
        v: 20,
    },
    wingUpAngle: {
        enabled: false,
        position: 15,
        func: "cosine",
        a: 80,
        f: 5,
        s: 0,
        v: 40,
    },
    wingFrontAngle: {
        enabled: false,
        position: -40,
        func: "sine",
        a: 15,
        f: 5,
        s: 0,
        v: -45,
    },
    keepWing: false,
    needCatch: true
}

let backRotate = {
    time: 0.3333,
    delay: 0,
    posX: 7.5,
    posY: -3,
    rotZ: -32,
    headY: -19.2,
    rightLegX: -110,
    leftLegX: -110,
    rightShinX: -20,
    leftShinX: -20,
    leftToeAngle: 15,
    rightToeAngle: 15,
    wingAngle: {
        enabled: true,
        func: "sine",
        a: 20,
        f: 11.5,
        s: 0.3,
        v: 5,
    },
    wingUpAngle: {
        enabled: true,
        func: "cosine",
        a: 40,
        f: 11.5,
        s: 0.3,
        v: -40,
    },
    wingFrontAngle: {
        enabled: true,
        func: "sine",
        a: 5,
        f: 3,
        s: 0,
        v: -25,
    },
    keepWing: true,
    needCatch: true,
}

let backFlapping = {
    time: 0.25,
    delay: 0,
    posX: 7,
    posY: -4.5,
    wingAngle: {
        enabled: false,
        func: "sine",
        a: 20,
        f: 11.5,
        s: 0.3,
        v: 5,
    },
    wingUpAngle: {
        enabled: false,
        func: "cosine",
        a: 40,
        f: 11.5,
        s: 0.3,
        v: -40,
    },
    wingFrontAngle: {
        enabled: false,
        func: "sine",
        a: 5,
        f: 3,
        s: 0,
        v: -90,
    },
    keepWing: true,
    needCatch: false,
}

let backBuffer1 = {
    time: 0.25,
    delay: 0,
    posX: 8,
    rotZ: 10,
    posY: -7,
    wingAngle: {
        enabled: false,
        func: "sine",
        a: 20,
        f: 11.5,
        s: 0.3,
        v: 5,
    },
    wingUpAngle: {
        enabled: false,
        func: "cosine",
        a: 40,
        f: 11.5,
        s: 0.3,
        v: -40,
    },
    wingFrontAngle: {
        enabled: false,
        func: "sine",
        a: 5,
        f: 3,
        s: 0,
        v: -90,
    },
    keepWing: true,
    needCatch: false,
}

let backLand = {
    time: 0.25,
    delay: 0,
    posX: 6.75,
    posY: -5.5,
    wingAngle: {
        enabled: false,
        position: 25,
    },
    wingUpAngle: {
        enabled: false,
        position: -80,
    },
    wingFrontAngle: {
        enabled: false,
        position: -40,
    },
    keepWing: false,
    needCatch: false,
}

let backImpact = {
    time: 0.5,
    delay: 0,
    posX: 3.75,
    rotZ: 42,
    headY: -15,
    rightLegX: -50,
    leftLegX: -50,
    rightShinX: -90,
    leftShinX: -90,
    leftToeAngle: 0.01,
    rightToeAngle: 0.01,
    wingAngle: {
        position: 15,
        enabled: false
    },
    wingUpAngle: {
        position: -90,
        enabled: false
    },
    wingFrontAngle: {
        position: -40,
        enabled: false
    },
    tailAngle: 12,
    keepWing: false,
    needCatch: false
}

let backResetBody = {
    time: 0.5,
    delay: 0,
    posX: -2.5,
    rotZ: -40,
    headY: -19.2,
    rightLegX: -90,
    leftLegX: -90,
    leftShinX: 0.01,
    rightShinX: 0.01,
    wingAngle: {
        enabled: true,
        func: "sine",
        a: 20,
        f: 11.5,
        s: 0.3,
        v: 5,
    },
    wingUpAngle: {
        enabled: true,
        func: "cosine",
        a: 40,
        f: 11.5,
        s: 0.3,
        v: -40,
    },
    wingFrontAngle: {
        enabled: true,
        func: "sine",
        a: 5,
        f: 3,
        s: 0,
        v: -65,
    },
    keepWing: true,
    needCatch: true,
}