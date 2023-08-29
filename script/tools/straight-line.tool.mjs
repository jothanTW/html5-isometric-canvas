import { PathSketch, setInternalPath } from '../core/sketch.mjs';
import { CommonService } from '../services/common.service.mjs';
import { StylebarControl } from '../controls/stylebar.control.mjs';
import { CursorControl } from '../controls/cursor.control.mjs';

let StraightLineTool = {
  icon: './img/path-icon.png',
  name: 'Straight Line Draw Tool',
  preview: null,
  exportSketchCallback: null,
  lastX: 0,
  lastY: 0,
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
    context.lineTo(this.lastX, this.lastY);
    context.fill();
    context.stroke();
  },
  events: {
    escape: function () {
      if (!StraightLineTool.preview) {
        return false;
      }
      setInternalPath(StraightLineTool.preview);
      StraightLineTool.exportSketchCallback(StraightLineTool.preview);
      StraightLineTool.preview = null;
      CursorControl.changeCursor();
      return true;
    },
    undo: function() {
      if (!StraightLineTool.preview) {
        return false;
      }
      if (StraightLineTool.preview.nodes.length === 1) {
        this.preview = null;
        return true;
      }
      StraightLineTool.preview.nodes.pop();
      return true;
    },
    contextmenu: function (evt) {
      if (StraightLineTool.preview) {
        if (StraightLineTool.preview.nodes.length > 2) {
          StraightLineTool.preview.isClosed = true;
        }
        StraightLineTool.preview.fill = StylebarControl.getFillColor();
        setInternalPath(StraightLineTool.preview);
        StraightLineTool.exportSketchCallback(StraightLineTool.preview);
        StraightLineTool.preview = null;
        return true;
      }
      return false;
    },
    click: function (evt) {
      if (!StraightLineTool.preview) {
        StraightLineTool.preview = new PathSketch();
        StraightLineTool.preview.color = StylebarControl.getLineColor();
        StraightLineTool.preview.size = StylebarControl.getLineSize();
      }
      let coords = CommonService.convertToGridCoords(evt.clientX, evt.clientY);
      StraightLineTool.preview.nodes.push(coords);
      return true;
    },
    mousemove: function (evt) {
      CursorControl.changeCursor('grid');
      let coords = CommonService.convertToGridCoords(evt.clientX, evt.clientY);
      StraightLineTool.lastX = coords.x;
      StraightLineTool.lastY = coords.y;
      return true;
    }
  }
}

export { StraightLineTool }