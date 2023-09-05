import { PathTool } from '../tools/path-tool.mjs';
import { SelectAndPanTool } from '../tools/select-and-pan.tool.mjs';
import { FreePaintTool } from '../tools/free-paint.tool.mjs';

import { drawSketch } from '../core/sketch.mjs';

import { ObjectService } from '../services/object.service.mjs';
import { CommonService } from '../services/common.service.mjs';
import { TouchControl } from './touch.control.mjs';
import { SubMenuControl } from './submenu.control.mjs';
import { ArcTool } from '../tools/arc-tool.mjs';
import { BezierTool } from '../tools/bezier-tool.mjs';

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
  img.title = name;
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

/**
 * The toolbar control. Adds, registers, and changes active tools.
 * @module controls/toolbar
 */
let ToolbarControl = {
  exportSketchFunction: function(sketch) {
    ObjectService.addObject(sketch);
  },
  /**
   * Adds a new tool to the toolbar. Checks the typing first, then adds its icon to the toolbar in the DOM
   * @param {Tool} tool - A valid tool module
   */
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
  /**
   * Dynamically adds an external module containing a valid Tool
   * @param {string} url - the URL to the ESModule file
   */
  addExternalToolModule: function(url) {
    import(url).then(exports => {
      for (let k of Object.keys(exports)) {
        this.addTool(exports[k]);
      }
    }).catch(e => {
      console.error(e);
    })
  },
  /**
   * Changes the active tool
   * @param {string} toolName - The identifier of the new tool
   */
  selectTool(toolName) {
    if (activeTool && activeTool.name !== toolName && activeTool.events.escape) {
      if (activeTool.events.escape()) {
        CommonService.triggerDrawFunction();
      }
    }
    for (let t of availableTools) {
      if (t.name === toolName) {
        activeTool = t;
        changeToolStyle(t.name);
        if (t.subMenu) {
          SubMenuControl.loadSubMenu(t.subMenu);
          // locate the position of the tool
          let toolEle = document.getElementById('tool-' + t.name);
          SubMenuControl.placeSubMenu(toolEle.offsetLeft + toolEle.offsetWidth + 10, toolEle.offsetTop);
        } else {
          SubMenuControl.hideSubMenu();
        }
        return;
      }
    }
    console.error('Tool with name "' + toolName + '" not registered');
  },
  /**
   * Draws the current tool's preview to the canvas
   * @param {CanvasRenderingContext2D} context 
   */
  drawPreview: function(context) {
    if (activeTool) {
      if (activeTool.drawPreview) {
        activeTool.drawPreview(context);
      } else if (activeTool.preview) {
        drawSketch(context, activeTool.preview);
      }
    }
  },
  /**
   * Registers the DOM listeners to pass to toolbars, and the redraw callback
   * @param {HTMLCanvasElement} canvas 
   */
  initCanvasListeners: function(canvas) {
    for (let ev of eventList) {
      canvas.addEventListener(ev, evt => {
        evt.stopPropagation();
        evt.preventDefault();
        if (activeTool.events[ev]) {
          if (activeTool.events[ev](evt)) {
            CommonService.triggerDrawFunction();
          }
        }
      });
    }
    TouchControl.tap.addListener(arg => {
      if (activeTool.events.tap) {
        if (activeTool.events.tap(arg)) {
          CommonService.triggerDrawFunction();
        }
      } else if (activeTool.events.click) {
        if (activeTool.events.click(arg)) {
          CommonService.triggerDrawFunction();
        }
      }
    });
    TouchControl.down.addListener(arg => {
      if (activeTool.events.tapdown) {
        if (activeTool.events.tapdown(arg)) {
          CommonService.triggerDrawFunction();
        }
      } else if (activeTool.events.mousedown) {
        if (activeTool.events.mousedown(arg)) {
          CommonService.triggerDrawFunction();
        }
      }
    });
    TouchControl.up.addListener(arg => {
      if (activeTool.events.tapup) {
        if (activeTool.events.tapup(arg)) {
          CommonService.triggerDrawFunction();
        }
      } else if (activeTool.events.mouseup) {
        if (activeTool.events.mouseup(arg)) {
          CommonService.triggerDrawFunction();
        }
      }
    });
    TouchControl.move.addListener(arg => {
      if (activeTool.events.tapmove) {
        if (activeTool.events.tapmove(arg)) {
          CommonService.triggerDrawFunction();
        }
      } else if (activeTool.events.mousemove) {
        if (activeTool.events.mousemove(arg)) {
          CommonService.triggerDrawFunction();
        }
      }
    });
    TouchControl.pan.addListener(arg => {
      if (activeTool.events.pan) {
        if (activeTool.events.pan(arg)) {
          CommonService.triggerDrawFunction();
        }
      }
    });
  },
  /**
   * Cancels the current tool action
   */
  cancelCurrentTool() {
    if (activeTool && activeTool.events.escape) {
      activeTool.events.escape();
    }
  },
  /**
   * Sends an 'undo' command to the current tool
   * @returns {boolean} Whether or not the undo command is valid for the current tool
   */
  undoCurrentTool() {
    if (activeTool && activeTool.events.undo) {
      return activeTool.events.undo();
    }
    return false;
  },
  /**
   * Sends a 'redo' command to the current tool
   * @returns {boolean} Whether or not the redo command is valid for the current tool
   */
  redoCurrentTool() {
    if (activeTool && activeTool.events.redo) {
      return activeTool.events.redo();
    }
    return false;
  },
  /**
   * Sends a 'delete' command to the current tool
   * @returns {boolean} Whether or not the delete command is valid for the current tool
   */
  deleteFromCurrentTool() {
    if (activeTool && activeTool.events.delete) {
      return activeTool.events.delete();
    }
    return false;
  }
}

ToolbarControl.addTool(SelectAndPanTool);
ToolbarControl.addTool(PathTool);
ToolbarControl.addTool(FreePaintTool);
//ToolbarControl.addTool(ArcTool);
ToolbarControl.addTool(BezierTool);

ToolbarControl.selectTool(availableTools[0].name);

export { ToolbarControl }