import { PathSketch, setInternalPath } from '../sketch.mjs';
import { CommonService } from '../services/common.service.mjs';
import { StylebarControl } from '../controls/stylebar.control.mjs';

let DotAlignDrawTool = {
  icon: './img/grid-lock-icon.png',
  name: 'Dot-Aligned Draw Tool',
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
    context.beginPath();
    context.lineWidth = this.preview.size;
    context.strokeStyle = this.preview.color;
    context.moveTo(this.preview.nodes[0].x, this.preview.nodes[0].y);
    for (let i = 1; i < this.preview.nodes.length; i++) {
      context.lineTo(this.preview.nodes[i].x, this.preview.nodes[i].y);
    }
    context.lineTo(this.lastX, this.lastY);
    context.stroke();
  },
  events: {
    escape: function () {
      if (!DotAlignDrawTool.preview) {
        return false;
      }
      DotAlignDrawTool.exportSketchCallback(DotAlignDrawTool.preview);
      DotAlignDrawTool.preview = null;
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
      let coords = CommonService.convertToGridCoords(evt.clientX, evt.clientY);
      coords = CommonService.getClosestDot(coords.x, coords.y);
      DotAlignDrawTool.lastX = coords.x;
      DotAlignDrawTool.lastY = coords.y;
      return true;
    }
  }
}

export { DotAlignDrawTool }