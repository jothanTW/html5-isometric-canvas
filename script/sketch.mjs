import { CommonService } from './services/common.service.mjs';
import { dot } from './shapes.mjs';

class Sketch {
  constructor(type) {
    this.type = type;
    this.path = null;
    this.offsetX = 0;
    this.offsetY = 0;
    this.boundingRect = null;
    this.color = '';
    this.fill = '';
  }
}

class PathSketch extends Sketch {
  constructor() {
    super('path');
    this.nodes = [];
    this.size = 2;
    this.isClosed = false;
  }
}

function drawSketch(context, sketch) {
  switch (sketch.type) {
    case 'path':
      drawPathSketch(context, sketch);
      break;
    case 'default':
      console.error('Unknown sketch type "' + sketch.type + "'");
      return;
  }
}

function drawPathSketch(context, sketch) {
  context.lineWidth = sketch.size;
  context.strokeStyle = sketch.color;
  context.fillStyle = sketch.fill;
  if (sketch.path) {
    context.translate(sketch.offsetX, sketch.offsetY);
    context.stroke(sketch.path);
    if (sketch.isClosed) {
      context.fill(sketch.path);
    }
    context.translate(-sketch.offsetX, -sketch.offsetY);
    return;
  }
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
  context.stroke();
  if (sketch.isClosed) {
    context.fill();
  }
}


function setInternalPath(sketch) {
  switch (sketch.type) {
    case 'path':
      setInternalPathOfPathSketch(sketch);
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
    minX--;
  }
  if (minY == maxY) {
    minY--;
  }
  sketch.boundingRect = {
    x: minX,
    y: minY,
    w: maxX - minX + 1,
    h: maxY - minY + 1
  }
}

export {
  Sketch, PathSketch, drawSketch, setInternalPath
}