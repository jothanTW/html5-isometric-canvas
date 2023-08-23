import { CommonService } from '../services/common.service.mjs';

let SelectAndPanTool = {
  icon: './img/select-icon.png',
  name: 'Select and Pan Tool',
  preview: null,
  exportSketchCallback: null,
  isMouseDown: false,
  isRightMouseDown: false,
  drawPreview: function (context) {
  },
  events: {
    mousedown: function (evt) {
      if (evt.which === 3 || evt.button === 2) {
        SelectAndPanTool.isRightMouseDown = true;
      } else {
        SelectAndPanTool.isMouseDown = true;
      }
      return false;
    },
    mouseup: function (evt) {
      if (evt.which === 3 || evt.button === 2) {
        SelectAndPanTool.isRightMouseDown = false;
      } else {
        SelectAndPanTool.isMouseDown = false;
      }
      return false;
    },
    mousemove: function (evt) {
      if (SelectAndPanTool.isRightMouseDown) {
        CommonService.modX(-evt.movementX);
        CommonService.modY(-evt.movementY);
        return true;
      }
      return false;
    }
  }
}

export { SelectAndPanTool }