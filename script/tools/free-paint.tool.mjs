import { PathSketch, setInternalPath } from '../sketch.mjs';
import { CommonService } from '../services/common.service.mjs';
import { StylebarControl } from '../controls/stylebar.control.mjs';

let FreePaintTool = {
  icon: './img/paintbrush-icon.png',
  name: 'Free Paint Tool',
  preview: null,
  exportSketchCallback: null,
  drawPreview: null, // always draw the default
  isDrawing: false,
  events: {
    mousedown: function(evt) {
      FreePaintTool.isDrawing = true;
      FreePaintTool.preview = new PathSketch();
      FreePaintTool.preview.color = StylebarControl.getLineColor();
      FreePaintTool.preview.size = StylebarControl.getLineSize();
      FreePaintTool.preview.fill = StylebarControl.getFillColor();
      FreePaintTool.preview.nodes.push(CommonService.convertToGridCoords(evt.clientX, evt.clientY));
      return true;
    },
    mouseup: function(evt) {
      if (FreePaintTool.preview) {
        FreePaintTool.isDrawing = false;
        setInternalPath(FreePaintTool.preview);
        FreePaintTool.exportSketchCallback(FreePaintTool.preview);
        FreePaintTool.preview = null;
        return true;
      }
      return false;
    },
    mousemove: function(evt) {
      if (FreePaintTool.isDrawing) {
        FreePaintTool.preview.nodes.push(CommonService.convertToGridCoords(evt.clientX, evt.clientY));
        return true;
      } 
      return false;
    }
  }
}

export { FreePaintTool }