// Turnaround animation for the top of the pillar
let startTurn = {
    time: 0.65,
    delay: 0,
    posX: -2.5,
    rotZ: 40,
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
    tailAngle: 10,
    keepWing: false,
    needCatch: false
}

let flyUpTurn = {
    time: 0.25,
    delay: 0,
    posY: 1,
    posZ: -1,
    rotZ: -50,
    rotY: 45,
    headY: 15,
    rightLegX: -70,
    leftLegX: -70,
    rightShinX: 40,
    leftShinX: 40,
    leftFoot: -50,
    rightFoot: -50,
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
        v: -70,
    },
    keepWing: true,
    needCatch: true,
}

let oneFourthsBuffer = {
    time: 0.325,
    delay: 0,
    posY: 1,
    posX: -2,
    rotY: 45,
    rotZ: 10,
    wingAngle: {
        enabled: false,
    },
    wingUpAngle: {
        enabled: false,
    },
    wingFrontAngle: {
        enabled: false,
    },
    keepWing: true,
    needCatch: true,
}


let threeFourthsBuffer = {
    time: 0.325,
    delay: 0,
    posY: -0.5,
    rotY: 45,
    rotZ: 10,
    rightLegX: -80,
    leftLegX: -80,
    rightShinX: -30,
    leftShinX: -30,
    leftFoot: 20,
    rightFoot: 20,
    wingAngle: {
        enabled: false,
    },
    wingUpAngle: {
        enabled: false,
    },
    wingFrontAngle: {
        enabled: false,
    },
    keepWing: true,
    needCatch: true,
}

let landTurn = {
    time: 0.45,
    delay: 0,
    posY: -1.5,
    posZ: 1,
    rotZ: 10,
    rotY: 45,
    headY: 15,
    rightLegX: -50,
    leftLegX: -50,
    rightShinX: -90,
    leftShinX: -90,
    rightFoot: 0,
    leftFoot: 0,
    wingAngle: {
        enabled: false,
        position: 20,
    },
    wingUpAngle: {
        enabled: false,
        position: 0
    },
    wingFrontAngle: {
        enabled: false,
        position: 0,
    },
    keepWing: false,
    needCatch: true,
}

let reset = {
    time: 0.65,
    delay: 0,
    posX: -1.5,
    rotZ: -20,
    headY: -19.2,
    rightLegX: -90,
    leftLegX: -90,
    rightShinX: 0.01,
    leftShinX: 0.01,
    leftFoot: 0.01,
    rightFoot: 0.01,
    tailAngle: 0,
    wingAngle: {
        position: 70,
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
    keepWing: false,
    needCatch: false
}