import { DotAlignDrawTool } from '../tools/dot-align.tool.mjs';
import { SelectAndPanTool } from '../tools/select-and-pan.tool.mjs';
import { FreePaintTool } from '../tools/free-paint.tool.mjs';
import { drawSketch } from '../sketch.mjs';
import { ObjectService } from '../services/object.service.mjs';

let availableTools = [];
let activeTool = null;

let toolbarEle = document.getElementById('toolbar');

let eventList = [
  'click', 'contextmenu', 'mousedown', 'mouseup', 'mousemove'
];

function addToolbarElement(name, icon) {
  let img = document.createElement('img');
  img.src = icon;
  img.addEventListener('click', evt => {
    ToolbarControl.selectTool(name);
  });
  img.id = 'tool-' + name;
  img.classList = 'toolbar-image';
  toolbarEle.appendChild(img)
}

function changeToolStyle(newActiveToolName) {
  for (let ele of toolbarEle.children) {
    ele.classList.remove('active');
    if (ele.id === 'tool-' + newActiveToolName) {
      ele.classList.add('active');
    }
  }
}

let ToolbarControl = {
  drawCallback: null,
  exportSketchFunction: function(sketch) {
    ObjectService.addObject(sketch);
  },
  addTool: function(tool) {
    // duck type the tool
    if (!tool.name || typeof tool.name !== 'string') {
      console.error('Invalid object added to toolbar! (missing: name parameter)');
      return;
    }
    for (let t of availableTools) {
      if (t.name == tool.name) {
        console.error('Duplicate tools with name "' + tool.name + '" were added!');
        return;
      }
    }
    if (typeof tool.preview === 'undefined') {
      console.error('Invalid object with name "' + tool.name + '" added to toolbar! (missing: preview parameter)');
      return;
    }
    if (typeof tool.exportSketchCallback === 'undefined') {
      console.error('Invalid object with name "' + tool.name + '" added to toolbar! (missing: exportSketchCallback parameter)');
      return;
    }
    if (!tool.events || typeof tool.events !== 'object') {
      console.error('Invalid object with name "' + tool.name + '" added to toolbar! (missing: events parameter)');
      return;
    }
    if (typeof tool.drawPreview === 'undefined' || typeof tool.drawPreview !== 'function' && tool.drawPreview !== null) {
      console.error('Invalid object with name "' + tool.name + '" added to toolbar! (missing: drawPreview function)')
    }
    if (!tool.icon) {
      console.warn('Tool "' + tool.name + '" is missing an icon');
    }
    tool.exportSketchCallback = sketch => {this.exportSketchFunction(sketch)};
    availableTools.push(tool);
    addToolbarElement(tool.name, tool.icon);
  },
  selectTool(toolName) {
    if (activeTool && activeTool.name !== toolName && activeTool.events.escape) {
      if (activeTool.events.escape()) {
        this.drawCallback();
      }
    }
    for (let t of availableTools) {
      if (t.name === toolName) {
        activeTool = t;
        changeToolStyle(t.name)
        return;
      }
    }
    console.error('Tool with name "' + toolName + '" not registered');
  },
  drawPreview: function(context) {
    if (activeTool) {
      if (activeTool.drawPreview) {
        activeTool.drawPreview(context);
      } else if (activeTool.preview) {
        drawSketch(context, activeTool.preview);
      }
    }
  },
  initCanvasListeners: function(canvas) {
    for (let ev of eventList) {
      canvas.addEventListener(ev, evt => {
        evt.stopPropagation();
        evt.preventDefault();
        if (activeTool.events[ev]) {
          if (activeTool.events[ev](evt)) {
            ToolbarControl.drawCallback();
          }
        }
      });
    }
  },
  cancelCurrentTool() {
    if (activeTool && activeTool.events.escape) {
      activeTool.events.escape();
    }
  }
}

ToolbarControl.addTool(SelectAndPanTool);
ToolbarControl.addTool(DotAlignDrawTool);
ToolbarControl.addTool(FreePaintTool);

ToolbarControl.selectTool(availableTools[0].name);

export { ToolbarControl }