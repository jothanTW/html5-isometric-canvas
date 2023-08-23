import { drawSketch } from '../sketch.mjs';

// maintains a stack of drawable objects
let ObjectService = {
  objects: [],
  addObject: function(sketch) {
    this.objects.push(sketch);
    EventService.addEvent(new AddEvent(this.objects.length - 1, sketch));
  },
  removeObject: function(index) {
    if (index < 0 || index >= this.objects.length) {
      console.error('Attempted to remove a nonexistent object from the Object stack at index "' + index + '"');
    }
    let arr = this.objects.splice(index, 1);
    EventService.addEvent(new DeleteEvent(index, arr[0]));
  },
  drawObjects: function(context) {
    for (let sketch of this.objects) {
      drawSketch(context, sketch);
    }
  },
  selectObjectIndex: function(x, y, context) {
    for (let i = this.objects.length - 1; i >= 0; i--) {
      if (this.objects[i].path && context.isPointInPath(this.objects[i].path, x, y)) {
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

// maintains two stacks of events, for undoing or redoing
let EventService = {
  eventStack: [],
  undoStack: [],
  addEvent: function (event) {
    this.eventStack.push(event);
    this.undoStack = [];
  },
  undo: function () {
    let event = this.eventStack.pop();
    if (event) {
      this.undoStack.push(event);
      // UNPROCESS THE EVENT
    }
  },
  redo: function () {
    let event = this.undoStack.pop();
    if (event) {
      this.eventStack.push(event);
      // REPROCESS THE EVENT
    }
  }
}

export {
  ObjectService
}