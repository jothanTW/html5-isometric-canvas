import { drawSketch } from '../sketch.mjs';

/**
 * The object service. Keeps and maintains a stack of drawable objects.
 * When objects on the stack are modified, events are automatically logged in the event service.
 * @module services/object
 */
let ObjectService = {
  objects: [],
  /**
   * Add a sketch to the stack
   * @param {Sketch} sketch 
   */
  addObject: function (sketch) {
    this.objects.push(sketch);
    EventService.addEvent(new AddEvent(this.objects.length - 1, sketch));
  },
  /**
   * Removes a sketch from the stack
   * @param {number} index - The stack index of the sketch
   */
  removeObject: function (index) {
    if (index < 0 || index >= this.objects.length) {
      console.error('Attempted to remove a nonexistent object from the Object stack at index "' + index + '"');
      return;
    }
    let arr = this.objects.splice(index, 1);
    EventService.addEvent(new DeleteEvent(index, arr[0]));
  },
  /**
   * Adjusts a sketch's position
   * @param {number} index - The stack index of the sketch
   * @param {number} x - The x movement
   * @param {number} y - The y movement
   */
  moveObject: function (index, x, y) {
    if (index < 0 || index >= this.objects.length) {
      console.error('Attempted to move a nonexistent object at index "' + index + '"');
      return;
    }
    this.objects[index].offsetX += x;
    this.objects[index].offsetY += y;
    EventService.addEvent(new MoveEvent(index, x, y));
  },
  /**
   * Begins tracking an object's movement to be logged as a single event later
   * @param {number} index - The stack index of the sketch
   */
  startMove: function (index) {
    if (index < 0 || index >= this.objects.length) {
      console.error('Attempted to move a nonexistent object at index "' + index + '"');
      return;
    }
    this.objects[index].ox = this.objects[index].offsetX;
    this.objects[index].oy = this.objects[index].offsetY;
  },
  /**
   * Tracks an object's movement to be logged as a single event later
   * @param {number} index - The stack index of the sketch
   * @param {number} x 
   * @param {number} y 
   */
  incrementMove: function (index, x, y) {
    if (index < 0 || index >= this.objects.length) {
      console.error('Attempted to move a nonexistent object at index "' + index + '"');
      return;
    }
    if (typeof this.objects[index].ox === 'undefined') {
      console.error('Attempted to increment a move for an object that was not moving!');
      return;
    }
    this.objects[index].offsetX += x;
    this.objects[index].offsetY += y;
  },
  /**
   * Logs a movement event to track movement made by a prior beginMove event and incrementMove events
   * @param {number} index - The stack index of the sketch
   */
  finalizeMove: function (index) {
    if (index < 0 || index >= this.objects.length) {
      console.error('Attempted to move a nonexistent object at index "' + index + '"');
      return;
    }
    let obj = this.objects[index];
    if (typeof obj.ox === 'undefined') {
      console.error('Attempted to finalize a move for an object that was not moving!');
      return;
    }
    EventService.addEvent(new MoveEvent(index, obj.offsetX - obj.ox, obj.offsetY - obj.oy));
    delete obj.ox;
    delete obj.oy;
  },
  /**
   * Cancels movement tracking for an object and resets its position to when beginMove was called
   * @param {number} index - The stack index of the sketch
   */
  cancelMove: function (index) {
    if (index < 0 || index >= this.objects.length) {
      console.error('Attempted to move a nonexistent object at index "' + index + '"');
      return;
    }
    let obj = this.objects[index];
    if (typeof obj.ox === 'undefined') {
      console.error('Attempted to cancel a move for an object that was not moving!');
      return;
    }
    obj.offsetX = obj.ox;
    obj.offsetY = obj.oy;
    delete obj.ox;
    delete obj.oy;
  },
  /**
   * Draws all objects in the stack in order
   * @param {CanvasRenderingContext2D} context - The canvas drawing context
   */
  drawObjects: function (context) {
    for (let sketch of this.objects) {
      drawSketch(context, sketch);
    }
  },
  /**
   * Finds the first sketch that contains a point on the canvas coordinate plane. In order for a sketch to be detected, it MUST
   * have its internal path parameter set.
   * @param {number} x 
   * @param {number} y 
   * @param {CanvasRenderingContext2D} context - The canvas drawing context
   * @returns The stack index of the sketch, or -1 if not found
   */
  selectObjectIndex: function (x, y, context) {
    for (let i = this.objects.length - 1; i >= 0; i--) {
      if (this.objects[i].path &&
        context.isPointInPath(this.objects[i].path, x - this.objects[i].offsetX, y - this.objects[i].offsetY)) {
        return i;
      }
    }
    return -1;
  }
}


/**
 * EVENT TYPES
 * 
 * Add Sketch - 'add'
 *   stores the sketch object
 *   stores the sketch object's index in the ObjectService
 * 
 * Delete Sketch - 'delete'
 *   stores the sketch object
 *   stores the sketch object's former index in the ObjectService
 * 
 * Move Sketch - 'move'
 *   stores the sketch object's index in the ObjectService
 *   stores the delta coordinates
 * 
 * Relayer Sketch - 'layer'
 *   stores the sketch object's former index in the ObjectService
 *   stores the sketch object's index in the ObjectService
 * 
 * Recolor Sketch - 'color'
 *   stores the sketch object's index in the ObjectService
 *   stores the old color
 *   stores the new color
 *   stores whether the recolor was a line or fill
 */

class Event {
  constructor(type, index) {
    this.type = type;
    this.index = index;
  }
}

class AddEvent extends Event {
  constructor(index, sketch) {
    super('add', index);
    this.objRef = sketch;
  }
}

class DeleteEvent extends Event {
  constructor(index, sketch) {
    super('delete', index);
    this.objRef = sketch;
  }
}

class MoveEvent extends Event {
  constructor(index, deltaX, deltaY) {
    super('move', index);
    this.deltaX = deltaX;
    this.deltaY = deltaY;
  }
}

class LayerEvent extends Event {
  constructor(index, newIndex) {
    super('layer', index);
    this.newIndex = newIndex;
  }
}

class ColorEvent extends Event {
  constructor(index, isFill, color, newColor) {
    super('color', index);
    this.isFill = isFill,
      this.color = color;
    this.newColor = newColor;
  }
}

function unprocessEvent(event) {
  switch (event.type) {
    case 'add':
      ObjectService.objects.splice(event.index, 1);
      break;
    case 'delete':
      ObjectService.objects.splice(event.index, 0, event.objRef);
      break;
    case 'move':
      ObjectService.objects[event.index].offsetX -= event.deltaX;
      ObjectService.objects[event.index].offsetY -= event.deltaY;
      break;
    case 'layer':
      let [obj] = ObjectService.objects.splice(event.newIndex);
      ObjectService.objects.splice(event.index, 0, obj);
      break;
    case 'color':
      if (event.isFill) {
        ObjectService.objects[event.index].fill = event.color;
      } else {
        ObjectService.objects[event.index].color = event.color;
      }
      break;
  }
}

function reprocessEvent(event) {
  switch (event.type) {
    case 'add':
      ObjectService.objects.splice(event.index, 0, event.objRef);
      break;
    case 'delete':
      ObjectService.objects.splice(event.index, 1);
      break;
    case 'move':
      ObjectService.objects[event.index].offsetX += event.deltaX;
      ObjectService.objects[event.index].offsetY += event.deltaY;
      break;
    case 'layer':
      let [obj] = ObjectService.objects.splice(event.index);
      ObjectService.objects.splice(event.newIndex, 0, obj);
      break;
    case 'color':
      if (event.isFill) {
        ObjectService.objects[event.index].fill = event.newColor;
      } else {
        ObjectService.objects[event.index].color = event.newColor;
      }
      break;
  }
}

/**
 * The Event service. Maintains two stacks of events, for undoing or redoing. 
 * Modifies the Object service's stack when undo or redo commands are sent.
 * @module services/event
 */
let EventService = {
  eventStack: [],
  undoStack: [],
  /**
   * Add an event to the stack. Only called by the Object service.
   * @param {Event} event 
   */
  addEvent: function (event) {
    this.eventStack.push(event);
    this.undoStack = [];
  },
  /**
   * Undo the last object manipulation
   */
  undo: function () {
    let event = this.eventStack.pop();
    if (event) {
      this.undoStack.push(event);
      // UNPROCESS THE EVENT
      unprocessEvent(event);
    }
  },
  /**
   * Redo the most recently undone object manipulation
   */
  redo: function () {
    let event = this.undoStack.pop();
    if (event) {
      this.eventStack.push(event);
      // REPROCESS THE EVENT
      reprocessEvent(event);
    }
  }
}

export {
  ObjectService,
  EventService
}