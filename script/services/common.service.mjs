let drawFunction = null;

/**
 * A module of common constraints and view values
 * @module services/common
 */
let CommonService = {
  /**
   * Constants and constraints for the view
   */
  constants: {
    // viewport constraints
    minZoom: 0.5,
    maxZoom: 3,
    minDim: -1000,
    maxDim: 1000,
    zoomPercent: 0.001,

    // grid constraints
    gridSize: 50,
    gridX: 0
  },

  // viewport vars
  zoom: 1,
  viewX: 0,
  viewY: 0,
  canvasOffsetX: 0,
  canvasOffsetY: 0,

  setZoom: function (val) {
    this.zoom = val;
    if (this.zoom < this.constants.minZoom) {
      this.zoom = this.constants.minZoom;
    }
    if (this.zoom > this.constants.maxZoom) {
      this.zoom = this.constants.maxZoom;
    }
  },

  modZoom: function (val) {
    this.setZoom(this.zoom + val);
  },

  setX: function (val) {
    this.viewX = val;
    if (this.viewX < this.constants.minDim) {
      this.viewX = this.constants.minDim;
    }
    if (this.viewX > this.constants.maxDim) {
      this.viewX = this.constants.maxDim;
    }
  },

  modX: function (val) {
    this.setX(this.viewX + val);
  },

  setY: function (val) {
    this.viewY = val;
    if (this.viewY < this.constants.minDim) {
      this.viewY = this.constants.minDim;
    }
    if (this.viewY > this.constants.maxDim) {
      this.viewY = this.constants.maxDim;
    }
  },

  modY: function (val) {
    this.setY(this.viewY + val);
  },

  /**
   * Converts the given mouse coordinates into canvas coordinates
   * @param {number} x 
   * @param {number} y 
   * @returns the canvas coordinates as {x, y}
   */
  convertToGridCoords: function (x, y) {
    return {
      x: x / this.zoom + this.viewX - this.canvasOffsetX,
      y: y / this.zoom + this.viewY - this.canvasOffsetY
    }
  },

  /**
   * Gets the closes 'dot' coordinate on the grid, for snapping. Inputs are canvas coordinates
   * @param {number} x 
   * @param {number} y 
   * @returns the canvas coordinates as {x, y}
   */
  getClosestDot: function (x, y) {
    // assume x and y are in grid coords
    let closestOptions = []; // we can easily find five closest options
    let yMod = y % this.constants.gridSize;
    let yPos = y - yMod;
    let xMod = x % (this.constants.gridX * 2);
    let xPos = x - xMod;

    closestOptions.push(
      { x: xPos, y: yPos },
      { x: xPos + this.constants.gridX * 2, y: yPos },
      { x: xPos + this.constants.gridX * 2, y: yPos + this.constants.gridSize },
      { x: xPos, y: yPos + this.constants.gridSize },
      { x: xPos + this.constants.gridX, y: yPos + this.constants.gridSize / 2 }
    );

    // locate the closest point
    let closestDistance = Math.hypot(x - closestOptions[0].x, y - closestOptions[0].y);
    let index = 0;
    for (let i = 1; i < closestOptions.length; i++) {
      let dist = Math.hypot(x - closestOptions[i].x, y - closestOptions[i].y);
      if (dist < closestDistance) {
        index = i;
        closestDistance = dist;
      }
    }
    return closestOptions[index];
  },
  /**
   * Sets the redraw trigger
   * @param {function(): void} callback 
   */
  setDrawFunction: function(callback) {
    if (typeof callback !== 'function') {
      console.error('Attempted to add an invalid draw function!');
      return;
    }
    drawFunction = callback;
  },
  /**
   * Calls the redraw trigger
   */
  triggerDrawFunction: function() {
    if (drawFunction) {
      drawFunction();
    }
  }
}

CommonService.constants.gridX = Math.sin(Math.PI / 3) * CommonService.constants.gridSize;

export {
  CommonService
}