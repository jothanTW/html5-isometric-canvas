import { PathSketch } from './sketch.mjs';
import { values, getClosestDot } from './common.mjs';

let dotAlignDrawTool = {
  icon: '',
  name: 'Dot-Aligned Draw Tool',
  preview: null,
  exportSketchCallback: null,
  drawPreview: function (context) {
    console.log(this)
    if (!this.preview || this.preview.nodes.length == 0) {
      return;
    }
    console.log('drawing');
    context.beginPath();
    context.lineWidth = 3;
    context.strokeStyle = this.preview.color;
    context.moveTo(this.preview.nodes[0].x, this.preview.nodes[0].y);
    for (let i = 1; i < this.preview.nodes.length; i++) {
      context.lineTo(this.preview.nodes[i].x, this.preview.nodes[i].y);
    }
    context.stroke();
    context.closePath();
  },
  events: {
    click: function(evt) {
      evt.preventDefault();
      if (evt.which === 3 || evt.button === 2) {
        // right click
        if (dotAlignDrawTool.preview) {
          if (dotAlignDrawTool.preview.nodes.length > 2) {
            dotAlignDrawTool.preview.isClosed = true;
          }
          exportSketchCallback(dotAlignDrawTool.preview);
          dotAlignDrawTool.preview = null;
        }
        return false;
      } else {
        // left click
        if (!dotAlignDrawTool.preview) {
          dotAlignDrawTool.preview = new PathSketch();
          dotAlignDrawTool.preview.color = '#f00'
        }
        let coords = values.convertToGridCoords(evt.clientX, evt.clientY);
        dotAlignDrawTool.preview.nodes.push(getClosestDot(coords.x, coords.y));
        console.log(dotAlignDrawTool.preview);
      }
    }
  }
}

export { dotAlignDrawTool }