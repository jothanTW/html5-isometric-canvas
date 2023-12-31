import { dot } from './core/shapes.mjs';

import { ToolbarControl } from './controls/toolbar.control.mjs';
import { KeyboardControl } from './controls/keyboard.control.mjs';
import { TouchControl } from './controls/touch.control.mjs';
import { DialogControl } from './controls/dialog.comtrol.mjs';

import { CommonService } from './services/common.service.mjs';
import { ObjectService } from './services/object.service.mjs';

// canvas
const container = document.getElementById('container');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

// colors
let dotColor = '#000';
let lineColor = '#888';

// controls
let gridstat = 1; // 0 - none, 1 - dots, 2 - lines

// mobile setup
if (!context.reset) {
  context.reset = context.resetTransform;
}

function draw() {
  context.reset()
  context.scale(CommonService.zoom, CommonService.zoom);
  context.clearRect(0, 0, canvas.width / CommonService.zoom, canvas.height / CommonService.zoom);
  // first draw the dots
  if (gridstat >= 1) {
    // TODO: add offset
    let offsetX = CommonService.viewX % (CommonService.constants.gridX * 2);
    let offsetY = CommonService.viewY % CommonService.constants.gridSize;
    let bounds = {
      x: CommonService.viewX, 
      y: CommonService.viewY, 
      width: container.offsetWidth / CommonService.zoom, 
      height: container.offsetHeight / CommonService.zoom
    };
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
  context.translate(CommonService.viewX, CommonService.viewY);
}
function resize() {
  let winWidth = container.offsetWidth;
  let winHeight = container.offsetHeight;
  CommonService.canvasOffsetX = canvas.offsetLeft;
  CommonService.canvasOffsetY = canvas.offsetTop;
  canvas.style.width = winWidth + 'px';
  canvas.style.height = winHeight + 'px';
  canvas.width = winWidth;
  canvas.height = winHeight;
  context.scale(CommonService.zoom, CommonService.zoom);
}

ToolbarControl.initCanvasListeners(canvas);
KeyboardControl.initKeyboardEvents();
TouchControl.initTouchEvents(canvas);

CommonService.setDrawFunction(() => draw());

resize();
draw();


canvas.addEventListener('wheel', ev => {
  ev.stopPropagation();
  ev.preventDefault();
  let isTouchpad = false;
  let deltaY = ev.deltaY;
  if (ev.wheelDeltaY === ev.deltaY * -3 || ev.deltaMode === 0) {
    deltaY *= 3 * CommonService.constants.trackpadScale;
  }
  CommonService.modZoom(-deltaY * CommonService.constants.zoomPercent, 
    {x: ev.clientX / CommonService.zoom, y: ev.clientY / CommonService.zoom});
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



TouchControl.zoom.addListener(evt => {
  CommonService.modZoom(evt.zoom * CommonService.constants.pinchPercent, 
    {x: evt.clientX / CommonService.zoom, y: evt.clientY / CommonService.zoom});
  resize();
  draw();
});

TouchControl.pan.addListener(evt => {
  CommonService.modX(-evt.deltaX);
  CommonService.modY(-evt.deltaY);
  draw();
})




//DEBUG
/*
DialogControl.addText('AAAAaaAAaaAAa');
DialogControl.addInput('aaA');
DialogControl.addButton('OK', () => {
  console.log(DialogControl.getInputValues()['aaA']);
  DialogControl.hideDialog();
});
DialogControl.addButton('Cancel');
DialogControl.addText('whoa');
DialogControl.showDialog();
*/