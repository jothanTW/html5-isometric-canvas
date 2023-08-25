let canvas = document.getElementById('canvas');

let cursors = new Map();

cursors.set('default', 'auto');
cursors.set('grid', 'crosshair');
cursors.set('move', 'move');
cursors.set('grab', 'grab');
cursors.set('grabbing', 'grabbing');

/**
 * The cursor control module. Used to give the cursor states over the canvas.
 * @module controls/cursor
 */
let CursorControl = {
  /**
   * Changes the state of the cursor, according to an id/state map in the module.
   * @param {string} control - The identifier of the cursor state. Not always the actual name of the cursor state.
   */
  changeCursor(control) {
    if (!control) {
      canvas.style.cursor = cursors.get('default');
    }
    if (cursors.has(control)) {
      canvas.style.cursor = cursors.get(control);
    }
  }
}

export { CursorControl }
