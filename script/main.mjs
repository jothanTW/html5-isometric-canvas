import { dot } from './shapes.mjs';
import { CommonService } from './services/common.service.mjs';
import { ToolbarControl } from './controls/toolbar.control.mjs';
import { drawSketch } from './sketch.mjs';
import { ObjectService } from './services/object.service.mjs';

// canvas
const container = document.getElementById('container');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

// colors
let dotColor = '#000';
let lineColor = '#f00';

// controls
let gridstat = 1; // 0 - none, 1 - dots, 2 - lines

function draw() {
  context.reset()
  context.scale(CommonService.zoom, CommonService.zoom);
  context.clearRect(0, 0, canvas.width / CommonService.zoom, canvas.height / CommonService.zoom);
  // first draw the dots
  if (gridstat >= 1) {
    // TODO: add offset
    let offsetX = CommonService.viewX % (CommonService.constants.gridX * 2);
    let offsetY = CommonService.viewY % CommonService.constants.gridSize;
    let bounds = getBounds();
    let toggle = false;
    for (let i = 0; i < bounds.height; i += CommonService.constants.gridSize / 2) {
      let offset = 0;
      if (toggle) {
        offset += CommonService.constants.gridX;
      }
      for (let j = offset - CommonService.constants.gridX * 2; j < bounds.width; j += CommonService.constants.gridX * 2) {
        dot(j - offsetX, i - offsetY, 2, context, dotColor);
      }
      toggle = !toggle;
    }
  }

  context.translate(-CommonService.viewX, -CommonService.viewY);

  ObjectService.drawObjects(context);
  ToolbarControl.drawPreview(context);

  // reset translate
  let mat = context.getTransform();
  mat.e = 0;
  mat.f = 0;
  context.setTransform(mat);
}

function getBounds() {
  // the viewx and viewy are at the top left
  // this returns {x, y, width, height}
  return {x: CommonService.viewX, y: CommonService.viewY, width: container.offsetWidth / CommonService.zoom, height: container.offsetHeight / CommonService.zoom};
}

function resize() {
  let winWidth = container.offsetWidth;
  let winHeight = container.offsetHeight;
  console.log(canvas.offsetLeft);
  CommonService.canvasOffsetX = canvas.offsetLeft;
  CommonService.canvasOffsetY = canvas.offsetTop;
  canvas.style.width = winWidth + 'px';
  canvas.style.height = winHeight + 'px';
  canvas.width = winWidth;
  canvas.height = winHeight;
  context.scale(CommonService.zoom, CommonService.zoom);
}

ToolbarControl.initCanvasListeners(canvas);
ToolbarControl.drawCallback = () => {draw()};

resize();
draw();



canvas.addEventListener('wheel', ev => {
  ev.stopPropagation();
  CommonService.modZoom(-ev.deltaY * CommonService.constants.zoomPercent);
  resize();
  draw();
});

container.addEventListener('resize', ev => {
  console.log('container resized')
  resize();
  draw();
});

canvas.addEventListener('resize', ev => {
  console.log('canvas resized');
  resize();
  draw();
});

window.addEventListener('keyup', ev => {
  if (ev.key === 'Escape') {
    ToolbarControl.cancelCurrentTool();
  }
})