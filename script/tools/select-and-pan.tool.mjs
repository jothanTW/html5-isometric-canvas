import { CommonService } from '../services/common.service.mjs';
import { ObjectService } from '../services/object.service.mjs';

import { CursorControl } from '../controls/cursor.control.mjs';
import { StylebarControl } from '../controls/stylebar.control.mjs';

let dashpattern = [10, 10];
let dashcolor = '#888';
let dashweight = 2;

let SelectAndPanTool = {
  icon: './img/select-icon.png',
  name: 'Select and Pan Tool',
  preview: null,
  exportSketchCallback: null,
  isMouseDown: false,
  isRightMouseDown: false,
  movingIndex: -1,
  drawPreview: function (context) {
    if (this.movingIndex !== -1) {
      let obj = ObjectService.objects[this.movingIndex];
      if (obj) {
        let rect = obj.boundingRect;
        context.translate(obj.offsetX, obj.offsetY);
        context.setLineDash(dashpattern);
        context.strokeStyle = dashcolor;
        context.lineWidth = dashweight;
        context.beginPath();
        context.rect(rect.x, rect.y, rect.w, rect.h);
        context.stroke();
        context.setLineDash([]);
        context.translate(-obj.offsetX, -obj.offsetY);
      }
    }
  },
  events: {
    escape: function() {
      SelectAndPanTool.isMouseDown = false;
      SelectAndPanTool.isRightMouseDown = false;
      CursorControl.changeCursor();
    },
    delete: function() {
      if (SelectAndPanTool.isMouseDown || SelectAndPanTool.isRightMouseDown || SelectAndPanTool.movingIndex === -1) {
        return false;
      }
      ObjectService.removeObject(SelectAndPanTool.movingIndex);
      SelectAndPanTool.movingIndex = -1;
      return true;
    },
    mousedown: function (evt) {
      if (evt.which === 3 || evt.button === 2) {
        SelectAndPanTool.isRightMouseDown = true;
        CursorControl.changeCursor('move');
      } else {
        SelectAndPanTool.isMouseDown = true;
        let coords = CommonService.convertToGridCoords(evt.clientX, evt.clientY);
        // get the target from the canvas clicked on in case more are added in the future
        let context = evt.target.getContext('2d');
        //console.log(evt);
        SelectAndPanTool.movingIndex = ObjectService.selectObjectIndex(coords.x, coords.y, context);
        if (SelectAndPanTool.movingIndex !== -1) {
          CursorControl.changeCursor('grabbing');
          ObjectService.startMove(SelectAndPanTool.movingIndex);
        }
      }
      return true;
    },
    mouseup: function (evt) {
      if (evt.which === 3 || evt.button === 2) {
        SelectAndPanTool.isRightMouseDown = false;
        CursorControl.changeCursor();
      } else {
        SelectAndPanTool.isMouseDown = false;
        if (SelectAndPanTool.movingIndex !== -1) {
          ObjectService.finalizeMove(SelectAndPanTool.movingIndex);
        }
      }
      let coords = CommonService.convertToGridCoords(evt.clientX, evt.clientY);
      // get the target from the canvas clicked on in case more are added in the future
      let context = evt.target.getContext('2d');
      if (ObjectService.selectObjectIndex(coords.x, coords.y, context) !== -1) {
        CursorControl.changeCursor('grab');
      }
      return true;
    },
    mousemove: function (evt) {
      if (SelectAndPanTool.isRightMouseDown) {
        CommonService.modX(-evt.movementX);
        CommonService.modY(-evt.movementY);
        return true;
      } else if (SelectAndPanTool.isMouseDown && SelectAndPanTool.movingIndex !== -1) {
        //ObjectService.moveObject(SelectAndPanTool.movingIndex, evt.movementX, evt.movementY);
        ObjectService.incrementMove(SelectAndPanTool.movingIndex, evt.movementX, evt.movementY);
        return true;
      }
      let coords = CommonService.convertToGridCoords(evt.clientX, evt.clientY);
      // get the target from the canvas clicked on in case more are added in the future
      let context = evt.target.getContext('2d');
      if (ObjectService.selectObjectIndex(coords.x, coords.y, context) !== -1) {
        CursorControl.changeCursor('grab');
      } else {
        CursorControl.changeCursor();
      }
      return false;
    }
  }
}

StylebarControl.fillColorChanged.addListener(color => {
  if (SelectAndPanTool.movingIndex !== -1) {
    ObjectService.colorObject(SelectAndPanTool.movingIndex, color, true);
    CommonService.triggerDrawFunction();
  }
});

StylebarControl.lineColorChanged.addListener(color => {
  if (SelectAndPanTool.movingIndex !== -1) {
    ObjectService.colorObject(SelectAndPanTool.movingIndex, color);
    CommonService.triggerDrawFunction();
  }
});

export { SelectAndPanTool }