console.log('loaded');

import { dot } from './shapes.mjs';
import { constants, values, getClosestDot } from './common.mjs';
import { dotAlignDrawTool } from './dot-align-tool.mjs';

// canvas
const container = document.getElementById('container');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');



// colors
let dotColor = '#000';
let lineColor = '#f00';

// controls
let gridstat = 1; // 0 - none, 1 - dots, 2 - lines

let activeTool = dotAlignDrawTool;

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  // first draw the dots
  if (gridstat >= 1) {
    // TODO: add offset
    let bounds = getBounds();
    let toggle = false;
    for (let i = 0; i < bounds.height; i += constants.gridSize / 2) {
      let offset = 0;
      if (toggle) {
        offset += constants.gridX;
      }
      for (let j = offset; j < bounds.width; j += constants.gridX * 2) {
        dot(j, i, 1, context, dotColor);
      }
      toggle = !toggle;
    }
  }

  if (activeTool) {
    console.log('test')
    activeTool.drawPreview(context);
  }
}

function getBounds() {
  // the viewx and viewy are at the top left
  // this returns {x, y, width, height}
  return {x: values.viewX, y: values.viewY, width: container.offsetWidth / values.zoom, height: container.offsetHeight / values.zoom};
}

function resize() {
  let winWidth = container.offsetWidth;
  let winHeight = container.offsetHeight;
  canvas.style.width = winWidth + 'px';
  canvas.style.height = winHeight + 'px';
  canvas.width = winWidth;
  canvas.height = winHeight;
  context.scale(values.zoom, values.zoom);
}

function addSketch(sketch) {

}

dotAlignDrawTool.exportSketchCallback = addSketch;

resize();
draw();



canvas.addEventListener('wheel', ev => {
  ev.stopPropagation();
  values.modZoom(-ev.deltaY * constants.zoomPercent);
  resize();
  draw();
})

// TEST
canvas.addEventListener('click', ev => {
  ev.stopPropagation();
  ev.preventDefault();
  if (activeTool.events.click) {
    activeTool.events.click(ev);
  }

  draw();

  return false;
  // first, get the canvas coords
  //let coords = values.convertToGridCoords(ev.clientX, ev.clientY)
  //console.log(coords);
  //coords = getClosestDot(coords.x, coords.y);
  //dot(coords.x, coords.y, 2, context, '#f00');
}, false)