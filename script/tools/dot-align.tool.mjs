import { PathSketch, setInternalPath } from '../core/sketch.mjs';
import { CommonService } from '../services/common.service.mjs';
import { StylebarControl } from '../controls/stylebar.control.mjs';
import { CursorControl } from '../controls/cursor.control.mjs';

let DotAlignDrawTool = {
  icon: './img/grid-lock-icon.png',
  name: 'Dot-Aligned Draw Tool',
  preview: null,
  exportSketchCallback: null,
  lastX: 0,
  lastY: 0,
  shouldPreviewNext: false,
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
      if (!DotAlignDrawTool.preview) {
        return false;
      }
      setInternalPath(DotAlignDrawTool.preview);
      DotAlignDrawTool.exportSketchCallback(DotAlignDrawTool.preview);
      DotAlignDrawTool.preview = null;
      CursorControl.changeCursor();
      return true;
    },
    undo: function() {
      if (!DotAlignDrawTool.preview) {
        return false;
      }
      if (DotAlignDrawTool.preview.nodes.length === 1) {
        this.preview = null;
        return true;
      }
      DotAlignDrawTool.preview.nodes.pop();
      return true;
    },
    tap: function(evt) {
      DotAlignDrawTool.shouldPreviewNext = false;
      if (!DotAlignDrawTool.preview) {
        DotAlignDrawTool.preview = new PathSketch();
        DotAlignDrawTool.preview.color = StylebarControl.getLineColor();
        DotAlignDrawTool.preview.size = StylebarControl.getLineSize();
      }
      let coords = CommonService.convertToGridCoords(evt.clientX, evt.clientY);
      DotAlignDrawTool.preview.nodes.push(CommonService.getClosestDot(coords.x, coords.y));
      return true;
    },
    contextmenu: function (evt) {
      if (DotAlignDrawTool.preview) {
        if (DotAlignDrawTool.preview.nodes.length > 2) {
          DotAlignDrawTool.preview.isClosed = true;
        }
        DotAlignDrawTool.preview.fill = StylebarControl.getFillColor();
        setInternalPath(DotAlignDrawTool.preview);
        DotAlignDrawTool.exportSketchCallback(DotAlignDrawTool.preview);
        DotAlignDrawTool.preview = null;
        return true;
      }
      return false;
    },
    click: function (evt) {
      DotAlignDrawTool.shouldPreviewNext = true;
      if (!DotAlignDrawTool.preview) {
        DotAlignDrawTool.preview = new PathSketch();
        DotAlignDrawTool.preview.color = StylebarControl.getLineColor();
        DotAlignDrawTool.preview.size = StylebarControl.getLineSize();
      }
      let coords = CommonService.convertToGridCoords(evt.clientX, evt.clientY);
      DotAlignDrawTool.preview.nodes.push(CommonService.getClosestDot(coords.x, coords.y));
      return true;
    },
    mousemove: function (evt) {
      CursorControl.changeCursor('grid');
      let coords = CommonService.convertToGridCoords(evt.clientX, evt.clientY);
      coords = CommonService.getClosestDot(coords.x, coords.y);
      DotAlignDrawTool.lastX = coords.x;
      DotAlignDrawTool.lastY = coords.y;
      return true;
    }
  }
}

export { DotAlignDrawTool }