let startFlight = {
    time: 0.65,
    delay: 0,
    posX: -3.75,
    rotZ: 40,
    headX: 180,
    headZ: 0,
    headY: 35,
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

let jumpOff = {
    time: 0.25,
    delay: 0.05,
    posX: -1.5,
    posY: 4.5,
    rotZ: -20,
    rightLegX: -80,
    leftLegX: -80,
    rightShinX: -40,
    leftShinX: -40,
    wingAngle: {
        enabled: true,
        func: "sine",
        a: 30,
        f: 9,
        s: 0.3,
        v: 20,
    },
    wingUpAngle: {
        enabled: true,
        func: "cosine",
        a: 80,
        f: 9,
        s: 0.3,
        v: 0,
    },
    wingFrontAngle: {
        enabled: true,
        func: "sine",
        a: 15,
        f: 5,
        s: 0,
        v: -45,
    },
    keepWing: true,
    needCatch: true
}

let moveCrateQuarter = {
    time: 0.3,
    delay: 0,
    posX: -3.75,
    posY: 7.5,
    rightLegX: -45,
    leftLegX: -45,
    rightShinX: 20,
    leftShinX: 20,
    leftToeAngle: 15,
    rightToeAngle: 15,
    wingAngle: {
        enabled: false,
        func: "sine",
        a: 30,
        f: 9,
        s: 0.3,
        v: 20,
    },
    wingUpAngle: {
        enabled: false,
        func: "cosine",
        a: 80,
        f: 9,
        s: 0.3,
        v: 0,
    },
    wingFrontAngle: {
        enabled: false,
        func: "sine",
        a: 15,
        f: 5,
        s: 0,
        v: -45,
    },
    keepWing: true,
    needCatch: false,
}

let moveQuarter = {
    time: 0.5,
    delay: 0,
    posX: -6.75,
    posY: 7.5,
    wingAngle: {
        enabled: false,
        func: "sine",
        a: 30,
        f: 5,
        s: 0.3,
        v: 20,
    },
    wingUpAngle: {
        enabled: false,
        func: "cosine",
        a: 80,
        f: 5,
        s: 0.3,
        v: 0,
    },
    wingFrontAngle: {
        enabled: false,
        func: "sine",
        a: 15,
        f: 5,
        s: 0,
        v: -45,
    },
    keepWing: true,
    needCatch: false
}

let moveTilt = {
    time: 0.6,
    delay: 0,
    posX: -9,
    posY: -0.75,
    rotZ: -35,
    headY: -15,
    rightLegX: -130,
    leftLegX: -130,
    rightShinX: -20,
    leftShinX: -20,
    leftToeAngle: 5,
    rightToeAngle: 5,
    wingAngle: {
        enabled: false,
        func: "sine",
        a: 30,
        f: 5,
        s: 0.3,
        v: 20,
    },
    wingUpAngle: {
        enabled: false,
        func: "cosine",
        a: 80,
        f: 5,
        s: 0.3,
        v: 0,
    },
    wingFrontAngle: {
        enabled: false,
    },
    keepWing: true,
    needCatch: true
}

let moveBuffer = {
    time: 0.4,
    delay: 0,
    posX: -5.25,
    posY: -2.25,
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
    needCatch: true,
}

let moveLand = {
    time: 0.333,
    delay: 0,
    posX: -3.75,
    posY: 1.5,
    rotZ: 15.5,
    headY: -19.2,
    rightLegX: -90,
    leftLegX: -90,
    rightShinX: -3,
    leftShinX: -3,
    leftToeAngle: -1,
    rightToeAngle: -1,
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

let moveSetLeg = {
    time: .05,
    delay: 0,
    posX: -0.75,
    rightLegX: -90,
    leftLegX: -90,
    leftShinX: 0.01,
    rightShinX: 0.01,
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
        v: -25,
    },
    keepWing: true,
    needCatch: false,
}

let moveFlapping = {
    time: 1,
    delay: 0,
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
        v: -25,
    },
    keepWing: true,
    needCatch: false,
    tailAngle: 0.01,
}

let moveReset = {
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