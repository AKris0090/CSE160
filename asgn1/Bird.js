let white = [1.0, 1.0, 1.0, 1.0];
let veryVeryLightPink = [1.0, 0.93, 0.98, 1.0];
let veryLightPink = [1.0, 0.85, 0.95, 1.0];
let lightPink = [1.0, 0.72, 0.88, 1.0];
let darkPink = [0.93, 0.50, 0.66, 1.0];
let veryDarkPink = [0.76, 0.35, 0.52, 1.0]
let brown = [0.55, 0.27, 0.06, 1.0];
let lightGray = [0.75, 0.75, 0.75, 1.0];
let gray = [0.5, 0.5, 0.5, 1.0];
let darkGray = [0.3, 0.3, 0.3, 1.0];
let black = [0.0, 0.0, 0.0, 1.0];
let lightYellow = [1.0, 1.0, 0.8, 1.0];

function applyColor(rgba) {
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
}

var scaleX;
var scaleY;
var posX = 6;
var posY = 7;

function drawBirdTriangle(vertices) {
    for(var i = 0; i < vertices.length; i += 6) {
        drawTriangle([(vertices[i] - posX) / scaleX, (vertices[i + 1] - posY) / scaleY, (vertices[i + 2] - posX) / scaleX, (vertices[i + 3] - posY) / scaleY, (vertices[i + 4] - posX) / scaleX, (vertices[i + 5] - posY) / scaleY]);
    }
}

function drawBirdTriangleFan(vertices) {
    for(var i = 0; i < vertices.length; i++) {
        if ((i + 1) % 2 == 0) {
            vertices[i] = (vertices[i] - posY) / scaleY;
        } else {
            vertices[i] = (vertices[i] - posX) / scaleX;
        }
    }
    drawTriangleFan(vertices);
}

class Bird {
    constructor() {
        scaleX = 8.5;
        scaleY = 8.5;
    }
  
    render() {
        // back body
        applyColor(veryLightPink);
        drawBirdTriangle([4.25, 2.25, 4, 4.75, 5.5, 7]);

        // tail
        applyColor(veryDarkPink);
        drawBirdTriangle([4.25, 2.25, 4.25, 0.25, 3.5, 0.25]);
        applyColor(darkPink);
        drawBirdTriangle([4.25, 2.25, 3.5, 0.25, 2.75, 0.75]);
        applyColor(lightPink);
        drawBirdTriangle([4.25, 2.25, 2.75, 0.75, 2.25, 1.25]);

        // back leg
        applyColor(veryDarkPink);
        drawBirdTriangle([6, 4.5, 6.5, 3, 5.25, 3.5]);
        applyColor(brown);
        drawBirdTriangle([6.5, 3, 6.9, 1.9, 6, 3.2]);
        drawBirdTriangle([6.9, 1.9, 7.5, 1, 7.1, 1.1]);

        // back leg claws
        applyColor(gray);
        drawBirdTriangle([7.4, 1.1, 8.25, 1, 7.5, 1]);
        drawBirdTriangle([7.1, 1.1, 7.5, 1, 6.9, 0.8]);
        drawBirdTriangle([7.4, 1, 7.8, 1, 8, 0.45]);

        // front body
        applyColor(white);
        drawBirdTriangle([4.25, 2.25, 5.5, 7, 7, 5.5]);

        // front leg
        applyColor(veryDarkPink);
        drawBirdTriangle([4.5, 2.9, 5, 3.5, 5.1, 1.5]);
        applyColor(brown);
        drawBirdTriangle([5.1, 1.5, 5.5, 0.5, 5.2, 0.6]);
        
        // front leg claws
        applyColor(gray);
        drawBirdTriangle([5.4, 0.75, 6.1, 0.4, 5.5, 0.5]);
        drawBirdTriangle([4.5, 0.5, 5.5, 0.5, 5.2, 0.6]);
        drawBirdTriangle([5.3, 0.5, 5.6, 0.5, 5.8, 0.1]);

        // right wing
        applyColor(veryDarkPink);
        drawBirdTriangle([6.25, 7.25, 7.5, 10.75, 9.25, 13]);
        applyColor(darkPink);
        drawBirdTriangle([6.25, 7.25, 9.25, 13, 9.5, 11.25]);
        applyColor(lightPink);
        drawBirdTriangle([6.25, 7.25, 9.5, 11.25, 8.75, 9.75]);
        applyColor(veryLightPink);
        drawBirdTriangle([6.25, 7.25, 8.75, 9.75, 7.9, 8.25]);
        applyColor(veryVeryLightPink);
        drawBirdTriangle([6.25, 7.25, 7.9, 8.25, 6.75, 6]);

        // right wing out feathers
        applyColor(lightPink);
        drawBirdTriangle([9.25, 13, 9.9, 14.5, 10.1, 14]);
        drawBirdTriangle([9.3, 12.5, 10.1, 13.5, 10.5, 13]);
        drawBirdTriangle([9.35, 12, 10.6, 12.75, 11, 12.1]);
        drawBirdTriangle([9.5, 11.25, 11.1, 11.75, 11.2, 11.25]);
        drawBirdTriangle([9.1, 10.5, 11.25, 10.75, 10.9, 10]);
        applyColor(veryLightPink);
        drawBirdTriangle([8.8, 10, 10.75, 9.75, 10.5, 9]);
        drawBirdTriangle([8.6, 9.55, 10.35, 8.5, 10.25, 8.2]);
        drawBirdTriangle([8.25, 8.9, 10.1, 8, 9.9, 7.5]);
        applyColor(veryVeryLightPink);
        drawBirdTriangle([7.8, 8.1, 9.9, 7.25, 9.5, 6.75]);
        drawBirdTriangle([7.5, 7.5, 9.1, 6.4, 8.5, 6]);
        drawBirdTriangle([7.15, 6.9, 8.2, 5.75, 7.75, 5.75]);
        drawBirdTriangle([6.9, 6.5, 7.75, 5.5, 7.5, 5.25]);

        // right wing in feathers
        applyColor(darkPink);
        drawBirdTriangle([9.25, 13, 9.3, 12.5, 9.75, 13.25]);
        drawBirdTriangle([9.3, 12.5, 9.35, 12, 10, 12.5]);
        drawBirdTriangle([9.35, 12, 9.5, 11.25, 10.2, 11.8]);
        drawBirdTriangle([9.5, 11.25, 9.1, 10.5, 10.5, 11]);
        drawBirdTriangle([9.1, 10.5, 8.8, 10, 10.4, 10]);
        applyColor(lightPink);
        drawBirdTriangle([8.8, 10, 8.6, 9.55, 10, 9.1]);
        drawBirdTriangle([8.6, 9.55, 8.25, 8.9, 9.5, 8.5]);
        drawBirdTriangle([8.25, 8.9, 7.8, 8.1, 9.1, 7.9]);
        drawBirdTriangle([7.8, 8.1, 7.5, 7.5, 8.5, 7]);
        applyColor(veryLightPink);
        drawBirdTriangle([7.5, 7.5, 7.15, 6.9, 7.9, 6.4]);
        drawBirdTriangle([7.15, 6.9, 6.9, 6.5, 7.5, 6]);
        drawBirdTriangle([6.9, 6.5, 6.5, 6, 7, 6]);

        // neck
        applyColor(lightYellow);
        drawBirdTriangle([5.5, 7, 6.25, 7.25, 7, 5.5]);
        applyColor(lightGray);
        drawBirdTriangle([5.25, 6.2, 5.5, 7, 7, 5.5]);
        drawBirdTriangle([5.25, 6.2, 7, 5.5, 6.9, 4.75]);
        drawBirdTriangle([7, 5.5, 7.25, 5.5, 6.9, 4.75]);
        drawBirdTriangle([6.9, 4.75, 7.25, 5.5, 7.6, 4.75]);

        // under beak
        applyColor(darkGray);
        drawBirdTriangle([7.25, 5.5, 7.6, 5.25, 7.5, 4.75]);
        drawBirdTriangleFan([8, 5, 9.6, 3.5, 9.5, 3.25, 8.5, 4.5, 8, 4.5, 7.5, 4.75, 7.6, 5.25])
        drawBirdTriangle([9.6, 3.5, 10.5, 3, 9.5, 3.25]);

        // over beak
        applyColor(lightGray);
        drawBirdTriangleFan([8.5, 5.5, 10.5, 3, 9.6, 3.5, 8.25, 5.5]);
        applyColor(gray);
        drawBirdTriangle([8.25, 5.5, 9.6, 3.5, 8, 5]);
        applyColor(darkGray);
        drawBirdTriangle([9.6, 4.1, 10.5, 3.5, 10.5, 3]);

        // head
        applyColor(lightYellow);
        drawBirdTriangleFan([8, 6, 8.5, 5.5, 8.25, 5.5, 8, 5, 7.6, 5.25, 7.25, 5.5]);
        applyColor(lightGray);
        drawBirdTriangle([8, 6, 8.5, 5.5, 8.25, 5.5, 8]);

        // eye
        applyColor(black);
        drawBirdTriangleFan([7.75, 5.5, 8, 5.6, 8, 5.3, 7.8, 5.2]);

        // left wing
        applyColor(darkPink);
        drawBirdTriangle([5.25, 6.2, 3.75, 8.5, 5.5, 7]);
        applyColor(veryDarkPink);
        drawBirdTriangle([3.75, 8.5, 2.9, 9, 4.1, 12]);

        // left wing out feathers
        applyColor(lightPink);
        drawBirdTriangle([4.1, 12, 4.1, 14.75, 4.75, 13.5]);
        drawBirdTriangle([4.1, 12, 2.5, 14.2, 3.5, 14.5]);
        drawBirdTriangle([3.9, 11.5, 1.5, 12.75, 2.1, 13.5]);
        drawBirdTriangle([3.5, 10.5, 1, 11, 1.35, 12.25]);
        drawBirdTriangle([3.2, 9.5, 0.5, 10, 0.75, 10.5]);
        applyColor(veryLightPink);
        drawBirdTriangle([2.9, 9, 0.2, 8.5, 0.5, 9.2]);
        drawBirdTriangle([2.9, 9, 0.5, 7.5, 0.3, 8]);
        drawBirdTriangle([3.75, 8.5, 0.9, 6.5, 0.6, 7.1]);
        drawBirdTriangle([4.25, 7.9, 1.25, 5.6, 1, 6.25]);
        applyColor(veryVeryLightPink);
        drawBirdTriangle([4.75, 7.1, 1.75, 5, 1.35, 5.35]);
        drawBirdTriangle([5.3, 6.2, 2.5, 4.4, 2, 4.6]);
        drawBirdTriangle([5.2, 5.5, 3.25, 4.2, 2.7, 4.3]);

        // left wing in feathers
        applyColor(darkPink);
        drawBirdTriangle([4.1, 12, 3.9, 11.5, 3.1, 13]);
        drawBirdTriangle([3.9, 11.5, 3.5, 10.5, 2.1, 12]);
        drawBirdTriangle([3.5, 10.5, 3.2, 9.5, 1.5, 10.5]);
        drawBirdTriangle([3.2, 9.5, 2.9, 9, 1.1, 9.5]);
        applyColor(lightPink);
        drawBirdTriangle([2.9, 9, 3.75, 8.5, 1.5, 7.9]);
        drawBirdTriangle([3.75, 8.5, 4.25, 7.9, 2, 7]);
        drawBirdTriangle([4.25, 7.9, 4.75, 7.1, 2.25, 6.2]);
        applyColor(veryLightPink);
        drawBirdTriangle([4.75, 7.1, 5.3, 6.2, 2.9, 5.5]);
        drawBirdTriangleFan([4.1, 5.25, 5.3, 6.2, 5.25, 6.2, 5.1, 5.5]);
    }
}