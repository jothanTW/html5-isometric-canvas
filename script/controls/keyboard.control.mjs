import { ToolbarControl } from './toolbar.control.mjs';
import { EventService } from '../services/object.service.mjs';

/**
 * The keyboard control. Intercepts keyboard commands and sends them to the proper controls or services.
 * @module controls/keyboard
 */
let KeyboardControl = {
  /**
   * Initialize the keyboard listeners and register the callback to redraw the canvas
   * @param {function():void} drawCallback - The function to trigget a redraw
   */
  initKeyboardEvents: function(drawCallback) {
    window.addEventListener('keyup', ev => {
      if (ev.ctrlKey) {
        if(handleCtrlKeyPress(ev)) {
          drawCallback();
        }
      } else if (ev.altKey) {
        if (handleAltKeyPress(ev)) {
          drawCallback();
        }
      } else {
        if (handleKeyPress(ev)) {
          drawCallback();
        }
      }
    });
  }
}

function handleKeyPress(ev) {
  switch (ev.key) {
    case 'Escape':
      ToolbarControl.cancelCurrentTool();
      break;
    default:
      return false;
  }
  return true;
}

function handleAltKeyPress(ev) {
  switch (ev.key) {
    default:
      return false;
  }
  return true;
}

function handleCtrlKeyPress(ev) {
  switch (ev.key) {
    case 'z':
      ctrlZ();
      break;
    case 'y':
      ctrlY();
      break;
    default:
      return false;
  }
  return true;
}

function ctrlZ() {
  if (!ToolbarControl.undoCurrentTool()) {
    EventService.undo();
  }
}

function ctrlY() {
  if (!ToolbarControl.redoCurrentTool()) {
    EventService.redo();
  }
}

export { KeyboardControl }