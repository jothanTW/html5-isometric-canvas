import { dot } from './shapes.mjs';

const PI = Math.PI;
const TAU = 2 * PI;

class Sketch {
  constructor(type) {
    this.type = type;
    this.path = null;
    this.offsetX = 0;
    this.offsetY = 0;
    this.boundingRect = null;
    this.color = '';
    this.fill = '';
    this.size = 2;
  }
}

class PathSketch extends Sketch {
  constructor() {
    super('path');
    this.nodes = [];
    this.isClosed = false;
  }
}

class ArcSketch extends Sketch {
  constructor(x, y, width, height, rotation, start = 0, end = TAU) {
    super('arc');
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.rotation = rotation;
    this.start = start;
    this.end = end;
  }
}

class BezierSketch extends Sketch {
  constructor() {
    super('bezier');
    this.nodes = [];
  }
}

function drawSketch(context, sketch) {
  context.lineWidth = sketch.size;
  context.strokeStyle = sketch.color;
  context.fillStyle = sketch.fill;
  if (sketch.path) {
    context.translate(sketch.offsetX, sketch.offsetY);
    context.fill(sketch.path);
    context.stroke(sketch.path);
    context.translate(-sketch.offsetX, -sketch.offsetY);
    return;
  }
  switch (sketch.type) {
    case 'path':
      drawPathSketch(context, sketch);
      break;
    case 'arc':
      drawArcSketch(context, sketch);
      break;
    case 'bezier':
      drawBezierSketch(context, sketch);
      break;
    case 'default':
      console.error('Unknown sketch type "' + sketch.type + "'");
      return;
  }
}

function drawPathSketch(context, sketch) {
  if (sketch.nodes.length == 0) {
    return;
  }
  if (sketch.nodes.length === 1) {
    dot(sketch.nodes[0].x - sketch.offsetX, sketch.nodes[0].y - sketch.offsetY, sketch.size, context, sketch.color);
    return;
  }
  context.beginPath();
  context.moveTo(sketch.nodes[0].x, sketch.nodes[0].y);
  for (let i = 1; i < sketch.nodes.length; i++) {
    context.lineTo(sketch.nodes[i].x - sketch.offsetX, sketch.nodes[i].y - sketch.offsetY);
  }
  if (sketch.isClosed) {
    context.closePath();
  }
  context.fill();
  context.stroke();
}

function drawArcSketch(context, sketch) {
  context.beginPath();
  context.ellipse(sketch.x, sketch.y, sketch.width, sketch.height, sketch.rotation, sketch.start, sketch.end);
  context.fill();
  context.stroke();
}

function drawBezierSketch(context, sketch) {
  if (sketch.nodes.length === 0 || sketch.nodes.length > 4) {
    return;
  }
  context.beginPath();
  context.moveTo(sketch.nodes[0].x, sketch.nodes[0].y);
  switch (sketch.nodes.length) {
    case 1:
      dot(sketch.nodes[0].x, sketch.nodes[0].y, sketch.size, context, sketch.color);
      return;
    case 2:
      // linear
      context.lineTo(sketch.nodes[1].x, sketch.nodes[1].y);
      break;
    case 3:
      // quadratic
      context.quadraticCurveTo(sketch.nodes[1].x, sketch.nodes[1].y, sketch.nodes[2].x, sketch.nodes[2].y);
      break;
    case 4:
      // cubic
      context.bezierCurveTo(
        sketch.nodes[1].x, sketch.nodes[1].y,
        sketch.nodes[2].x, sketch.nodes[2].y,
        sketch.nodes[3].x, sketch.nodes[3].y);
      break;
    default:
      // shouldn't ever get here buuuuuut
      return;
  }
  context.fill();
  context.stroke();
}

function setInternalPath(sketch) {
  switch (sketch.type) {
    case 'path':
      setInternalPathOfPathSketch(sketch);
      break;
    case 'arc':
      setInternalPathOfArcSketch(sketch);
      break;
    case 'bezier':
      setInternalPathOfBezierSketch(sketch);
      break;
    case 'default':
      console.error('Unknown sketch type "' + sketch.type + "'");
      return;
  }
}

function setInternalPathOfPathSketch(sketch) {
  if (sketch.nodes.length === 1) {
    sketch.boundingRect = {x: sketch.nodes[0].x - 1, y: sketch.nodes[0].y - 1, w: 2, h: 2};
  }
  if (sketch.nodes.length < 2) {
    return;
  }
  sketch.path = new Path2D();
  sketch.path.moveTo(sketch.nodes[0].x, sketch.nodes[0].y);
  let minX = sketch.nodes[0].x;
  let maxX = minX;
  let minY = sketch.nodes[0].y;
  let maxY = minY;
  for (let i = 1; i < sketch.nodes.length; i++) {
    sketch.path.lineTo(sketch.nodes[i].x, sketch.nodes[i].y);
    if (sketch.nodes[i].x < minX) {
      minX = sketch.nodes[i].x;
    }
    if (sketch.nodes[i].x > maxX) {
      maxX = sketch.nodes[i].x;
    }
    if (sketch.nodes[i].y < minY) {
      minY = sketch.nodes[i].y;
    }
    if (sketch.nodes[i].y > maxY) {
      maxY = sketch.nodes[i].y;
    }
  }
  if (sketch.isClosed) {
    sketch.path.closePath();
  }
  if (minX == maxX) {
    minX -= sketch.size / 2;
    maxX += sketch.size / 2;
  }
  if (minY == maxY) {
    minY -= sketch.size / 2;
    maxY += sketch.size / 2;
  }
  sketch.boundingRect = {
    x: minX,
    y: minY,
    w: maxX - minX + 1,
    h: maxY - minY + 1
  }
}

function setInternalPathOfArcSketch(sketch) {
  // TODO : Rotate this
  sketch.boundingRect = {
    x: sketch.x,
    y: sketch.y,
    w: sketch.width,
    h: sketch.height
  };
  sketch.path = new Path2D();
  sketch.path.ellipse(sketch.x, sketch.y, sketch.width, sketch.height, sketch.rotation, sketch.start, sketch.end);
}

function setInternalPathOfBezierSketch(sketch) {
  if (sketch.nodes.length === 0 || sketch.nodes.length > 4) {
    return;
  }
  sketch.path = new Path2D();
  sketch.path.moveTo(sketch.nodes[0].x, sketch.nodes[0].y);
  switch (sketch.nodes.length) {
    case 1:
      dot(sketch.nodes[0].x, sketch.nodes[0].y, sketch.size, sketch.path, sketch.color);
      return;
    case 2:
      // linear
      sketch.path.lineTo(sketch.nodes[1].x, sketch.nodes[1].y);
      break;
    case 3:
      // quadratic
      sketch.path.quadraticCurveTo(sketch.nodes[1].x, sketch.nodes[1].y, sketch.nodes[2].x, sketch.nodes[2].y);
      break;
    case 4:
      // cubic
      sketch.path.bezierCurveTo(
        sketch.nodes[1].x, sketch.nodes[1].y,
        sketch.nodes[2].x, sketch.nodes[2].y,
        sketch.nodes[3].x, sketch.nodes[3].y);
      break;
    default:
      // shouldn't ever get here buuuuuut
      return;
  }
  let minX = sketch.nodes[0].x;
  let maxX = minX;
  let minY = sketch.nodes[0].y;
  let maxY = minY;
  for (let i = 1; i < sketch.nodes.length; i++) {
    if (sketch.nodes[i].x < minX) {
      minX = sketch.nodes[i].x;
    }
    if (sketch.nodes[i].x > maxX) {
      maxX = sketch.nodes[i].x;
    }
    if (sketch.nodes[i].y < minY) {
      minY = sketch.nodes[i].y;
    }
    if (sketch.nodes[i].y > maxY) {
      maxY = sketch.nodes[i].y;
    }
  }
  if (minX == maxX) {
    minX -= sketch.size / 2;
    maxX += sketch.size / 2;
  }
  if (minY == maxY) {
    minY -= sketch.size / 2;
    maxY += sketch.size / 2;
  }
  sketch.boundingRect = {
    x: minX,
    y: minY,
    w: maxX - minX + 1,
    h: maxY - minY + 1
  }
}

function verifyIsSketch(sketch) {
  if (sketch instanceof Sketch) {
    return null;
  }
  if (!sketch || typeof sketch !== 'object') {
    return 'sketch is not an object!'
  }

  let p;
  let err;
  switch (sketch.type) {
    case 'path':
      p = new PathSketch();
      break;
    case 'arc':
      p = new ArcSketch();
      break;
    case 'bezier':
      p = new BezierSketch();
      break;
    case 'default':
      return 'Missing or invalid sketch type'
  }
  // prop search
  for (let prop of Object.getOwnPropertyNames(p)) {
    if (err = lookForProp(sketch, prop)) {
      return err;
    }
  }

  return null;
}

function lookForProp(sketch, prop) {
  if (sketch[prop] !== undefined) {
    return null;
  }
  return 'sketch object is missing required property "' + prop + '"';
}

export {
  Sketch, PathSketch, ArcSketch, BezierSketch, drawSketch, setInternalPath, verifyIsSketch
}