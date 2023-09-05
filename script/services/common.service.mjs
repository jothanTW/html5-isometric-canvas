import { EventLoudener } from "../core/loudener.mjs";

let drawFunction = null;

/**
 * A module of common constraints and view values
 * @module services/common
 */
let CommonService = {
  /** 
   * Event emitters 
   */
  zoomEvent: new EventLoudener(),

  /**
   * Constants and constraints for the view
   */
  constants: {
    // viewport constraints
    minZoom: 0.5,
    maxZoom: 3,
    maxDim: 10000,
    zoomPercent: 0.001,
    pinchPercent: 0.01,
    trackpadScale: 2,

    zoomStep: 0.1,

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

  setZoom: function(val) {
    let oldZoom = this.zoom;
    this.zoom = val;
    this.zoom = 
    Math.ceil(((this.zoom - this.constants.minZoom ) / this.constants.zoomStep)) 
      * this.constants.zoomStep 
      + this.constants.minZoom;
    // make sure at least one step takes place
    if (oldZoom === this.zoom && val !== oldZoom) {
      if (val < oldZoom) {
        this.zoom -= this.constants.zoomStep;
      } else {
        this.zoom += this.constants.zoomStep;
      }
    }
    if (this.zoom < this.constants.minZoom) {
      this.zoom = this.constants.minZoom;
    }
    if (this.zoom > this.constants.maxZoom) {
      this.zoom = this.constants.maxZoom;
    }
    this.zoomEvent.emit(this.zoom);
  },

  modZoom: function (val, zoomCoords = null) {
    let oldScale = this.zoom;
    this.setZoom(this.zoom + val);
    if (zoomCoords) {
      let scale = this.zoom - oldScale;
      this.modX(zoomCoords.x * scale / this.zoom);
      this.modY(zoomCoords.y * scale / this.zoom);
    }
  },

  setX: function (val) {
    this.viewX = val;
    if (this.viewX < 0) {
      this.viewX = 0;
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
    if (this.viewY < 0) {
      this.viewY = 0;
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
      x: (x - this.canvasOffsetX) / this.zoom + this.viewX,
      y: (y - this.canvasOffsetY) / this.zoom + this.viewY
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
CommonService.viewX = CommonService.constants.maxDim / 2;
CommonService.viewY = CommonService.constants.maxDim / 2;

export {
  CommonService
}