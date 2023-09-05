import { StylebarControl } from "../controls/stylebar.control.mjs";
import { CursorControl } from "../controls/cursor.control.mjs";
import { SubMenu, SubMenuIcon } from "../controls/submenu.control.mjs";

import { CommonService } from "../services/common.service.mjs";

import { BezierSketch, drawSketch, setInternalPath } from "../core/sketch.mjs";

let BezierTool = {
  icon: './img/snap-icon.png',
  name: 'Bezier Path Tool',
  preview: null,
  exportSketchCallback: null,
  subMenu: new SubMenu(),
  isSnapping: true,
  drawPreview: null,
  events: {
    escape: function () {
      if (!BezierTool.preview) {
        return false;
      }
      setInternalPath(BezierTool.preview);
      BezierTool.exportSketchCallback(BezierTool.preview);
      BezierTool.preview = null;
      CursorControl.changeCursor();

      endIcon.disable();

      return true;
    },
    undo: function () {
      if (!BezierTool.preview) {
        return false;
      }
      if (BezierTool.preview.nodes.length === 1) {
        BezierTool.preview = null;

        endIcon.disable();

        return true;
      }
      BezierTool.preview.nodes.pop();
      return true;
    },
    tap: function (evt) {
      BezierTool.shouldPreviewNext = false;
      if (!BezierTool.preview) {
        BezierTool.preview = new BezierSketch();
        BezierTool.preview.color = StylebarControl.getLineColor();
        BezierTool.preview.size = StylebarControl.getLineSize();
        BezierTool.preview.fill = StylebarControl.getFillColor();

        endIcon.enable();
      }
      let coords = CommonService.convertToGridCoords(evt.clientX, evt.clientY);
      if (BezierTool.isSnapping) {
        coords = CommonService.getClosestDot(coords.x, coords.y);
      }
      BezierTool.preview.nodes.push(coords);
      return true;
    },
    contextmenu: function (evt) {
      if (BezierTool.preview) {
        BezierTool.preview.fill = StylebarControl.getFillColor();
        setInternalPath(BezierTool.preview);
        BezierTool.exportSketchCallback(BezierTool.preview);
        BezierTool.preview = null;

        endIcon.disable();
        return true;
      }
      return false;
    },
    click: function (evt) {
      BezierTool.shouldPreviewNext = true;
      if (!BezierTool.preview) {
        BezierTool.preview = new BezierSketch();
        BezierTool.preview.color = StylebarControl.getLineColor();
        BezierTool.preview.size = StylebarControl.getLineSize();
        BezierTool.preview.fill = StylebarControl.getFillColor();

        endIcon.enable();
      }
      let coords = CommonService.convertToGridCoords(evt.clientX, evt.clientY);
      if (BezierTool.isSnapping) {
        coords = CommonService.getClosestDot(coords.x, coords.y);
      }
      BezierTool.preview.nodes.push(coords);
      return true;
    },
    mousemove: function (evt) {
      CursorControl.changeCursor('grid');
      return false;
    }
  }
}

let lockIcon = new SubMenuIcon('./img/snap-icon.png', 'Lock To Grid');
let unlockIcon = new SubMenuIcon('./img/snapless-icon.png', 'Unlock From Grid');
let endIcon = new SubMenuIcon('./img/end-path-icon.png', 'End Path');

lockIcon.activate();
endIcon.disable();

lockIcon.event.addListener(() => {
  lockIcon.activate();
  unlockIcon.deactivate();
  BezierTool.isSnapping = true;
});

unlockIcon.event.addListener(() => {
  unlockIcon.activate();
  lockIcon.deactivate();
  BezierTool.isSnapping = false;
});

endIcon.event.addListener(() => {
  BezierTool.events.escape();
  CommonService.triggerDrawFunction();
});

BezierTool.subMenu.icons.push(lockIcon, unlockIcon, endIcon);


export { BezierTool }