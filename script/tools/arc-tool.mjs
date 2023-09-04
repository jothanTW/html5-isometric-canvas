import { StylebarControl } from "../controls/stylebar.control.mjs";
import { CursorControl } from "../controls/cursor.control.mjs";

import { CommonService } from "../services/common.service.mjs";

import { ArcSketch, drawSketch, setInternalPath } from "../core/sketch.mjs";

let dashpattern = [10, 10];
let dashcolor = '#888';
let dashweight = 2;

let ArcTool = {
  icon: './img/snap-icon.png',
  name: 'Arc Tool',
  preview: null,
  exportSketchCallback: null,
  lastPosX: 0,
  lastPosY: 0,
  drawPreview: null,
  pointA: null,
  isSnapping: false,
  drawPreview: function (context) {
    if (!this.pointA) {
      return;
    }
    if (this.preview) {
      drawSketch(context, this.preview);
      // draw the other side
      let arc = Object.assign({}, this.preview);
      context.setLineDash(dashpattern);
      context.strokeStyle = dashcolor;
      context.lineWidth = dashweight;
      let temp = arc.start;
      arc.start = arc.end;
      arc.end = temp;
      arc.fill = '#0000';
      drawSketch(context, arc);
      context.setLineDash([]);
      return;
    }
    let coords = {
      x: this.lastPosX,
      y: this.lastPosY
    }
    let dx = coords.x - this.pointA.x;
    let dy = coords.y - this.pointA.y;

    let arc = new ArcSketch(
      (this.pointA.x + coords.x) / 2,
      (this.pointA.y + coords.y) / 2,
      Math.hypot(dx, dy) / 2,
      Math.hypot(dx, dy) * Math.sin(Math.PI / 3) / 2,
      Math.atan2(dy, dx),
      0, Math.PI
    );
    arc.color = StylebarControl.getLineColor();
    arc.size = StylebarControl.getLineSize();
    arc.fill = StylebarControl.getFillColor();
    drawSketch(context, arc);
    context.setLineDash(dashpattern);
    context.strokeStyle = dashcolor;
    context.lineWidth = dashweight;
    let temp = arc.start;
    arc.start = arc.end;
    arc.end = temp;
    arc.fill = '#0000';
    drawSketch(context, arc);
    context.setLineDash([]);
  },
  events: {
    escape: function () {
      if (!ArcTool.preview) {
        return false;
      }
      setInternalPath(ArcTool.preview);
      ArcTool.exportSketchCallback(ArcTool.preview);
      ArcTool.preview = null;
      ArcTool.pointA = null;
      CursorControl.changeCursor();
      return true;
    },
    click: function (evt) {
      let coords = CommonService.convertToGridCoords(evt.clientX, evt.clientY);
      if (ArcTool.isSnapping) {
        coords = CommonService.getClosestDot(coords.x, coords.y);
      }
      if (!ArcTool.pointA) {
        ArcTool.pointA = coords;
        return;
      } else {
        // MATH TIME
        let dx = coords.x - ArcTool.pointA.x;
        let dy = coords.y - ArcTool.pointA.y;

        ArcTool.preview = new ArcSketch(
          (ArcTool.pointA.x + coords.x) / 2,
          (ArcTool.pointA.y + coords.y) / 2,
          Math.hypot(dx, dy) / 2,
          Math.hypot(dx, dy) * Math.sin(Math.PI / 3) / 2,
          Math.atan2(dy, dx),
          0, Math.PI
        );
        ArcTool.preview.color = StylebarControl.getLineColor();
        ArcTool.preview.size = StylebarControl.getLineSize();
        ArcTool.preview.fill = StylebarControl.getFillColor();

        // get rid of this later

        //setInternalPath(ArcTool.preview);
        //ArcTool.exportSketchCallback(ArcTool.preview);
        //ArcTool.preview = null;
        //ArcTool.pointA = null;
      }
      return true;
    },
    mousemove: function (evt) {
      CursorControl.changeCursor('grid');
      let coords = CommonService.convertToGridCoords(evt.clientX, evt.clientY);
      if (ArcTool.isSnapping) {
        coords = CommonService.getClosestDot(coords.x, coords.y);
      }
      ArcTool.lastPosX = coords.x;
      ArcTool.lastPosY = coords.y;
      return true;
    }
  }
}

export { ArcTool }