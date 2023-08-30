import { PathSketch, setInternalPath } from '../core/sketch.mjs';
import { CommonService } from '../services/common.service.mjs';
import { StylebarControl } from '../controls/stylebar.control.mjs';
import { CursorControl } from '../controls/cursor.control.mjs';
import { SubMenu, SubMenuIcon } from '../controls/submenu.control.mjs';

let PathTool = {
  icon: './img/snap-icon.png',
  name: 'Path Draw Tool',
  preview: null,
  exportSketchCallback: null,
  lastX: 0,
  lastY: 0,
  shouldPreviewNext: false,
  subMenu: new SubMenu(),
  isSnapping: true,
  drawPreview: function (context) {
    if (!this.preview) {
      return;
    }
    this.preview.color = StylebarControl.getLineColor();
    this.preview.size = StylebarControl.getLineSize();
    this.preview.fill = StylebarControl.getFillColor();
    context.beginPath();
    context.lineWidth = this.preview.size;
    context.strokeStyle = this.preview.color;
    context.fillStyle = this.preview.fill;
    context.moveTo(this.preview.nodes[0].x, this.preview.nodes[0].y);
    for (let i = 1; i < this.preview.nodes.length; i++) {
      context.lineTo(this.preview.nodes[i].x, this.preview.nodes[i].y);
    }
    if (this.shouldPreviewNext) {
      context.lineTo(this.lastX, this.lastY);
    }
    context.fill();
    context.stroke();
  },
  events: {
    escape: function () {
      if (!PathTool.preview) {
        return false;
      }
      setInternalPath(PathTool.preview);
      PathTool.exportSketchCallback(PathTool.preview);
      PathTool.preview = null;
      CursorControl.changeCursor();

      closeIcon.disable();
      endIcon.disable();

      return true;
    },
    undo: function () {
      if (!PathTool.preview) {
        return false;
      }
      if (PathTool.preview.nodes.length === 1) {
        PathTool.preview = null;

        closeIcon.disable();
        endIcon.disable();

        return true;
      }
      PathTool.preview.nodes.pop();
      return true;
    },
    tap: function (evt) {
      PathTool.shouldPreviewNext = false;
      if (!PathTool.preview) {
        PathTool.preview = new PathSketch();
        PathTool.preview.color = StylebarControl.getLineColor();
        PathTool.preview.size = StylebarControl.getLineSize();

        closeIcon.enable();
        endIcon.enable();
      }
      let coords = CommonService.convertToGridCoords(evt.clientX, evt.clientY);
      if (PathTool.isSnapping) {
        coords = CommonService.getClosestDot(coords.x, coords.y);
      }
      PathTool.preview.nodes.push(coords);
      return true;
    },
    contextmenu: function (evt) {
      if (PathTool.preview) {
        if (PathTool.preview.nodes.length > 2) {
          PathTool.preview.isClosed = true;
        }
        PathTool.preview.fill = StylebarControl.getFillColor();
        setInternalPath(PathTool.preview);
        PathTool.exportSketchCallback(PathTool.preview);
        PathTool.preview = null;

        closeIcon.disable();
        endIcon.disable();
        return true;
      }
      return false;
    },
    click: function (evt) {
      PathTool.shouldPreviewNext = true;
      if (!PathTool.preview) {
        PathTool.preview = new PathSketch();
        PathTool.preview.color = StylebarControl.getLineColor();
        PathTool.preview.size = StylebarControl.getLineSize();

        closeIcon.enable();
        endIcon.enable();
      }
      let coords = CommonService.convertToGridCoords(evt.clientX, evt.clientY);
      if (PathTool.isSnapping) {
        coords = CommonService.getClosestDot(coords.x, coords.y);
      }
      PathTool.preview.nodes.push(coords);
      return true;
    },
    mousemove: function (evt) {
      CursorControl.changeCursor('grid');
      let coords = CommonService.convertToGridCoords(evt.clientX, evt.clientY);
      if (PathTool.isSnapping) {
        coords = CommonService.getClosestDot(coords.x, coords.y);
      }
      PathTool.lastX = coords.x;
      PathTool.lastY = coords.y;
      return true;
    }
  }
}

// load the submenu
let lockIcon = new SubMenuIcon('./img/snap-icon.png', 'Lock To Grid');
let unlockIcon = new SubMenuIcon('./img/snapless-icon.png', 'Unlock From Grid');
let closeIcon = new SubMenuIcon('./img/close-path-icon.png', 'Close Path');
let endIcon = new SubMenuIcon('./img/end-path-icon.png', 'End Path');

lockIcon.activate();
closeIcon.disable();
endIcon.disable();

lockIcon.event.addListener(() => {
  lockIcon.activate();
  unlockIcon.deactivate();
  PathTool.isSnapping = true;
});

unlockIcon.event.addListener(() => {
  unlockIcon.activate();
  lockIcon.deactivate();
  PathTool.isSnapping = false;
});

closeIcon.event.addListener(() => {
  PathTool.events.contextmenu();
  CommonService.triggerDrawFunction();
});

endIcon.event.addListener(() => {
  PathTool.events.escape();
  CommonService.triggerDrawFunction();
});

PathTool.subMenu.icons.push(lockIcon, unlockIcon, closeIcon, endIcon);

export { PathTool }