let lightBrown = [0.78, 0.53, 0.26, 1.0];
let veryLightBrown = [1.0, 0.86, 0.57, 1.0];
let nailPink = [0.96, 0.87, 0.82, 1.0];

var gunScaleX = 10;
var gunScaleY = 10;
var gunPosX = 3;
var gunPosY = 0;

var baseGunPosX = -3;
var baseGunPosY = 10;

var mouseX;
var mouseY;

var sens = 5;

let muzzleFlash = {
    active: false,
    timer: 0,
    maxTimer: 12,
    one: false,
    two: false,
    three: false,
    x: 2.75,
    y: 7.5
};

function drawGunTriangle(vertices) {
    for(var i = 0; i < vertices.length; i += 6) {
        drawTriangle([(vertices[i] - gunPosX) / gunScaleX, (vertices[i + 1] - gunPosY) / gunScaleY, (vertices[i + 2] - gunPosX) / gunScaleX, (vertices[i + 3] - gunPosY) / gunScaleY, (vertices[i + 4] - gunPosX) / gunScaleX, (vertices[i + 5] - gunPosY) / gunScaleY]);
    }
}

function drawGunTriangleFan(vertices) {
    for(var i = 0; i < vertices.length; i++) {
        if ((i + 1) % 2 == 0) {
            vertices[i] = (vertices[i] - gunPosY) / gunScaleY;
        } else {
            vertices[i] = (vertices[i] - gunPosX) / gunScaleX;
        }
    }
    drawTriangleFan(vertices);
}

function drawCrossHair() {
    applyColor(white);
    drawTriangle([mouseX + 0.05, mouseY, mouseX + 0.1, mouseY + 0.025, mouseX + 0.1, mouseY - 0.025]);
    drawTriangle([mouseX - 0.05, mouseY, mouseX - 0.1, mouseY - 0.025, mouseX - 0.1, mouseY + 0.025]);
    drawTriangle([mouseX, mouseY + 0.05, mouseX + 0.025, mouseY + 0.08, mouseX - 0.025, mouseY + 0.08]);
    drawTriangle([mouseX, mouseY - 0.05, mouseX - 0.025, mouseY - 0.08, mouseX + 0.025, mouseY - 0.08]);
}


class Gun {
    constructor() {
    }

    updateGunPos(ev) {
        mouseX = ev[0];
        mouseY = ev[1];
        gunPosX = baseGunPosX - (ev[0] * sens);
        gunPosY = baseGunPosY - (ev[1] * sens);
    }

    updateMuzzleFlash() {
        if (muzzleFlash.active) {
            muzzleFlash.timer--;
            if (muzzleFlash.timer <= 0) {
                muzzleFlash.active = false;
                muzzleFlash.one = false;
                muzzleFlash.two = false;
                muzzleFlash.three = false;
            }
        }

        if (muzzleFlash.active) {
            const x = muzzleFlash.x;
            const y = muzzleFlash.y;

            let scale = 4 * (muzzleFlash.timer / muzzleFlash.maxTimer);

            if(muzzleFlash.timer < 3 && !muzzleFlash.one) {
                muzzleFlash.one = true;
                applyColor([1.0, Math.random(), 0, 1]);
                drawGunTriangle([x - (Math.random() * scale), y - (Math.random() * scale), x, y + (Math.random() * scale), x + (Math.random() * scale), y - (Math.random() * scale)]);
            } else if (muzzleFlash.timer < 6 && !muzzleFlash.two) {
                muzzleFlash.two = true;
                applyColor([255, Math.random() * 127, 0, 1]);
                drawGunTriangle([x - (Math.random() * scale), y - (Math.random() * scale), x, y + (Math.random() * scale), x + (Math.random() * scale), y - (Math.random() * scale)]);
            } else if (muzzleFlash.timer < 9 && !muzzleFlash.three) {
                muzzleFlash.three = true;
                applyColor([1.0, 0.5, 0, 1]);
                drawGunTriangle([x - (Math.random() * scale), y - (Math.random() * scale), x, y + (Math.random() * scale), x + (Math.random() * scale), y - (Math.random() * scale)]);
            }
        }
    }
  
    render() {
        this.updateMuzzleFlash();
        drawCrossHair();
        
        // wrist/arm
        applyColor(lightBrown);
        drawGunTriangleFan([9.3, -0.3, 10.3, 1.7, 20, -5, 18, -10, 6.3, -0.3]);
        applyColor(brown);
        drawGunTriangleFan([9.3, -0.3, 18, -10, 6.3, -0.3]);

        // hand base
        applyColor(lightBrown);
        drawGunTriangleFan([9, 0, 10, 2, 9.5, 2.5, 9.2, 3, 8.2, 4.6, 7.6, 5.9, 7.5, 6, 5, 3.5, 4, 2.5, 4.85, 0.9, 6.2, 0]);

        // thumb
        applyColor(lightBrown);
        drawGunTriangleFan([7.15, 7.9, 6.5, 7.5, 6.2, 6.9, 6.3, 6.1, 6.45, 5.6, 6.5, 5, 6.5, 4.5, 7.25, 7.5]);
        drawGunTriangle([7.25, 7.5, 6.5, 4.5, 7.3, 6.5]);
        drawGunTriangle([7.5, 6, 7.3, 6.5, 6.5, 4.5]);

        // index finger
        applyColor(lightBrown);
        drawGunTriangleFan([2.9, 7.5, 3, 7.6, 3.45, 7.6, 3.6, 7.5, 4.5, 6.85, 6.4, 5.6, 6.4, 4.5, 5.8, 4.5]);
        applyColor(brown);
        drawGunTriangleFan([2.9, 7.5, 5.9, 4.8, 5.8, 4.5, 3.45, 6.5, 2.85, 7.2]);

        // middle finger
        applyColor(lightBrown);
        drawGunTriangleFan([1.95, 7.1, 2.2, 7.2, 2.85, 7.2, 3.45, 6.5, 5.5, 5, 6.15, 3.9, 5.2, 4]);
        applyColor(brown);
        drawGunTriangleFan([1.95, 7.1, 5.2, 4, 5, 4, 2.5, 6, 2, 6.6]);

        // palm inside
        applyColor(brown);
        drawGunTriangleFan([4, 2.5, 6.45, 5.15, 7, 4, 7.2, 2.8, 7.15, 1, 6.4, 0.5, 5, 0.85]);

        // filler
        applyColor(black);
        drawGunTriangle([4.25, 0.5, 3.85, 2, 5.75, 1]);

        // ring finger
        applyColor(lightBrown);
        drawGunTriangleFan([3.5, 3.25, 4.65, 3.95, 5.35, 3.9, 5.25, 3.25, 4.5, 2.85, 4.9, 2.1, 5.6, 1, 4.2, 1.5, 3.2, 2.9]);
        drawGunTriangleFan([4.9, 2.1, 5.95, 1.8, 6, 1.2, 5.6, 1]);

        // ring finger
        applyColor(lightBrown);
        drawGunTriangleFan([4.25, 0.5, 3.95, 1.5, 4, 1.55, 4.2, 1.35, 6.1, 0.85, 6.15, 0.5, 5.9, 0.25]);

        // nails
        applyColor(nailPink);
        drawGunTriangleFan([7, 6.75, 6.85, 7.5, 6.95, 7.85, 7.2, 7.85, 7.25, 7.5, 7.25, 6.95]);
        drawGunTriangleFan([5, 1.5, 5.25, 1.6, 6, 1.25, 5.85, 0.95, 5, 1.25]);
        drawGunTriangleFan([5.1, 0.6, 6.05, 0.45, 6.15, 0.35, 5.9, 0.2, 5.3, 0.35]);
    }
}