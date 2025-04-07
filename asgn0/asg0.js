var ctx;

function main() {  
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  }

  ctx = canvas.getContext('2d');
  clearCanvas();
}

function clearCanvas() {
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
  ctx.fillRect(0, 0, 400, 400);
}

function drawVector(v, color) {
  ctx.beginPath();
  ctx.moveTo(200, 200);
  ctx.lineTo(200 + v.elements[0] * 20, 200 - v.elements[1] * 20);
  ctx.strokeStyle = color;
  ctx.stroke();
}

var v1;
var v2;

function handleDrawEvent() {
  let v1X = document.getElementById('V1X').value;
  let v1Y = document.getElementById('V1Y').value;
  let v2X = document.getElementById('V2X').value;
  let v2Y = document.getElementById('V2Y').value;

  let v1ValX = parseFloat(v1X);
  let v1ValY = parseFloat(v1Y);
  let v2ValX = parseFloat(v2X);
  let v2ValY = parseFloat(v2Y);

  v1 = new Vector3([v1ValX, v1ValY, 0]);
  v2 = new Vector3([v2ValX, v2ValY, 0]);

  clearCanvas();

  drawVector(v1, "red");
  drawVector(v2, "blue");
}

function angleBetween(v1, v2) {
  let dot = Vector3.dot(v1, v2);
  let mag1 = v1.magnitude();
  let mag2 = v2.magnitude();
  let cosTheta = dot / (mag1 * mag2);
  return Math.acos(cosTheta) * (180 / Math.PI);
}

function areaTriangle(v1, v2) {
  let cross = Vector3.cross(v1, v2);
  return cross.magnitude() / 2;
}

function handleOpEvent() {
  handleDrawEvent();

  let operation = document.getElementById('op').value;
  let scalar = document.getElementById('sc').value;
  let scalarVal = parseFloat(scalar);
  if(isNaN(scalarVal)) {
    scalarVal = 1;
  }
  switch (operation) {
    case 'add':
      drawVector(v1.add(v2), "green");
      break;
    case 'subtract':
      drawVector(v1.sub(v2), "green");
      break;
    case 'multiply':
      drawVector(v1.mul(scalarVal), "green");
      drawVector(v2.mul(scalarVal), "green");
      break;
    case 'divide':
      if(scalarVal != 0) {
        drawVector(v1.div(scalarVal), "green");
        drawVector(v2.div(scalarVal), "green");
      }
      break;
    case 'normalize':
      drawVector(v1.normalize(), "green");
      drawVector(v2.normalize(), "green");
      break;
    case 'magnitude':
      let mag1 = v1.magnitude();
      let mag2 = v2.magnitude();
      console.log("Magnitude v1: " + mag1);
      console.log("Magnitude v2: " + mag2);
      break;
    case 'angle_between':
      let angle = angleBetween(v1, v2);
      console.log("Angle: " + angle);
      break;
    case 'area':
      console.log("Area of the triangle: " + areaTriangle(v1, v2));
      break;
  }
}