// This is just an implementation of an event system like the DOM's or EventEmitter

class EventListener {
  constructor(callback, id) {
    if (typeof callback !== 'function') {
      throw 'Attempted to add an invalid listener!';
    }
    this.callback = callback;
    this.id = id;
  }
}

/**
 * A simple event emitter
 */
class EventLoudener {
  constructor() {
    this.listeners = [];
  }
  /**
   * Adds a function as an event listener
   * @param {function(any): void} callback 
   * @returns {number} An ID for the listener
   */
  addListener(callback) {
    let listener = null;
    let index = 1;
    if (this.listeners.length) {
      // indices will always be ordered lowest to highest
      index = this.listeners[this.listeners.length - 1].id + 1;
    }
    try {
      listener = new EventListener(callback, index);
    } catch (e) {
      console.error(e);
      return -1;
    }
    this.listeners.push(listener);
    return index;
  }
  /**
   * Sends 'data' to all listeners
   * @param {any} data 
   */
  emit(data) {
    for (let l of this.listeners) {
      setTimeout(() => { l.callback(data); }, 0); // make sure this happens on the next frame
    }
  }
  /**
   * Removes a listener by id
   * @param {number} id The listener ID
   */
  removeListener(id) {
    for (let i = 0; i < this.listeners.length; i++) {
      if (this.listeners[i].id === id) {
        this.listeners.splice(i, 1);
        return;
      }
    }
    console.warn('Attempted to remove nonexistent listener');
  }
}

export { EventLoudener }