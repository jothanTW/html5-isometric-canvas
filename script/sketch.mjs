import { CommonService } from './services/common.service.mjs';
import { dot } from './shapes.mjs';

class Sketch {
  constructor(type) {
    this.type = type;
    this.path = null;
  }
}

class PathSketch extends Sketch {
  constructor() {
    super('path');
    this.nodes = [];
    this.color = '';
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
    context.stroke(sketch.path);
    if (sketch.isClosed) {
      context.fill(sketch.path);
    }
    return;
  }
  if (sketch.nodes.length == 0) {
    return;
  }
  if (sketch.nodes.length === 1) {
    dot(sketch.nodes[0].x - CommonService.viewX, sketch.nodes[0].y - CommonService.viewY, sketch.size, context, sketch.color);
    return;
  }
  context.beginPath();
  context.moveTo(sketch.nodes[0].x, sketch.nodes[0].y);
  for (let i = 1; i < sketch.nodes.length; i++) {
    context.lineTo(sketch.nodes[i].x, sketch.nodes[i].y);
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
  if (sketch.nodes.length < 2) {
    return;
  }
  sketch.path = new Path2D();
  sketch.path.moveTo(sketch.nodes[0].x, sketch.nodes[0].y);
  for (let i = 1; i < sketch.nodes.length; i++) {
    sketch.path.lineTo(sketch.nodes[i].x, sketch.nodes[i].y);
  }
  if (sketch.isClosed) {
    sketch.path.closePath();
  }
}

export {
  Sketch, PathSketch, drawSketch, setInternalPath
}