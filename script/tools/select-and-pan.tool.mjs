import { CommonService } from '../services/common.service.mjs';
import { ObjectService } from '../services/object.service.mjs';

import { CursorControl } from '../controls/cursor.control.mjs';
import { StylebarControl } from '../controls/stylebar.control.mjs';
import { SubMenu, SubMenuIcon } from '../controls/submenu.control.mjs';

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
  subMenu: new SubMenu(),
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
    escape: function () {
      SelectAndPanTool.isMouseDown = false;
      SelectAndPanTool.isRightMouseDown = false;
      SelectAndPanTool.movingIndex = -1;
      setLayerIconStatus();
      CursorControl.changeCursor();
    },
    delete: function () {
      if (SelectAndPanTool.isMouseDown || SelectAndPanTool.isRightMouseDown || SelectAndPanTool.movingIndex === -1) {
        return false;
      }
      ObjectService.removeObject(SelectAndPanTool.movingIndex);
      SelectAndPanTool.movingIndex = -1;
      setLayerIconStatus();
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
        SelectAndPanTool.movingIndex = ObjectService.selectObjectIndex(coords.x, coords.y, context);
        if (SelectAndPanTool.movingIndex !== -1) {
          CursorControl.changeCursor('grabbing');
          ObjectService.startMove(SelectAndPanTool.movingIndex);
          let obj = ObjectService.objects[SelectAndPanTool.movingIndex];
          StylebarControl.setFillColor(obj.fill);
          StylebarControl.setLineColor(obj.color);
          StylebarControl.setLineSize(obj.size);
        }
        setLayerIconStatus();
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
      let movementX = evt.movementX / CommonService.zoom;
      let movementY = evt.movementY / CommonService.zoom;
      if (SelectAndPanTool.isRightMouseDown) {
        CommonService.modX(-movementX);
        CommonService.modY(-movementY);
        return true;
      } else if (SelectAndPanTool.isMouseDown && SelectAndPanTool.movingIndex !== -1) {
        ObjectService.incrementMove(SelectAndPanTool.movingIndex, movementX, movementY);
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
    },
    touchdown: function (evt) {
      SelectAndPanTool.isMouseDown = true;
      let coords = CommonService.convertToGridCoords(evt.clientX, evt.clientY);
      // get the target from the canvas clicked on in case more are added in the future
      let context = evt.target.getContext('2d');
      SelectAndPanTool.movingIndex = ObjectService.selectObjectIndex(coords.x, coords.y, context);
      if (SelectAndPanTool.movingIndex !== -1) {
        CursorControl.changeCursor('grabbing');
        ObjectService.startMove(SelectAndPanTool.movingIndex);
        let obj = ObjectService.objects[SelectAndPanTool.movingIndex];
        StylebarControl.setFillColor(obj.fill);
        StylebarControl.setLineColor(obj.color);
        StylebarControl.setLineSize(obj.size);
      }
      setLayerIconStatus();
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

StylebarControl.lineWeightChanged.addListener(weight => {
  if (SelectAndPanTool.movingIndex !== -1) {
    ObjectService.changeObjectWeight(SelectAndPanTool.movingIndex, weight);
    CommonService.triggerDrawFunction();
  }
});

let moveToBottomIcon = new SubMenuIcon('./img/layer-down-icon.png', 'Move to Bottom');
let moveToTopIcon = new SubMenuIcon('./img/layer-up-icon.png', 'Move to Top');

moveToBottomIcon.disable();
moveToTopIcon.disable();

moveToBottomIcon.event.addListener(() => {
  if (SelectAndPanTool.movingIndex !== -1) {
    ObjectService.changeObjectLayer(SelectAndPanTool.movingIndex, true);
    SelectAndPanTool.movingIndex = 0;
    setLayerIconStatus();
    CommonService.triggerDrawFunction();
  }
});

moveToTopIcon.event.addListener(() => {
  if (SelectAndPanTool.movingIndex !== -1) {
    ObjectService.changeObjectLayer(SelectAndPanTool.movingIndex, false);
    SelectAndPanTool.movingIndex = ObjectService.objects.length - 1;
    setLayerIconStatus();
    CommonService.triggerDrawFunction();
  }
});

SelectAndPanTool.subMenu.icons.push(moveToBottomIcon, moveToTopIcon);

function setLayerIconStatus() {
  let index = SelectAndPanTool.movingIndex;
  if (index == -1) {
    moveToBottomIcon.disable();
    moveToTopIcon.disable();
    return;
  }
  if (index == 0) {
    moveToBottomIcon.disable();
  } else {
    moveToBottomIcon.enable();
  }
  if (index == ObjectService.objects.length - 1) {
    moveToTopIcon.disable();
  } else {
    moveToTopIcon.enable();
  }
}

export { SelectAndPanTool }