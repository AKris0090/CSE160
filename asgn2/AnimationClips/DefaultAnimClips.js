// TODO: add two keyframes, one to start flapping and one to stop

// TODO: add a way to randomly select a x pos and y pos, maybe add z head pos to the animations?

// TODO: add an animation to pick up and eat the bone

let startFlapping = {
    time: 2.15,
    delay: 0,
    wingAngle: {
        enabled: true,
        func: "sine",
        a: 25,
        f: 11.5,
        s: 0.3,
        v: 5,
    },
    wingUpAngle: {
        enabled: true,
        func: "cosine",
        a: 50,
        f: 11.5,
        s: 0.3,
        v: -20,
    },
    wingFrontAngle: {
        enabled: true,
        func: "sine",
        a: 5,
        f: 3,
        s: 0,
        v: -60,
    },
    keepWing: true,
    canStop: true,
}

let stopFlapping = {
    time: 1,
    delay: 0,
    wingAngle: {
        enabled: false,
        position: 70
    },
    wingUpAngle: {
        enabled: false,
        position: 0
    },
    wingFrontAngle: {
        enabled: false,
        position: -40
    },
    keepWing: false,
    canStop: true,
}