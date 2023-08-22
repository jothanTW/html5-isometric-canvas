let constants = {
  // viewport constraints
  minZoom: 1,
  maxZoom: 3,
  minDim: -1000,
  maxDim: 1000,
  zoomPercent: 0.001,

  // grid constraints
  gridSize: 10,
  gridX: 0
}

constants.gridX = Math.sin(Math.PI / 3) * constants.gridSize;

let values = {
  // viewport vars
  zoom: 1,
  viewX: 0,
  viewY: 0,

  setZoom: function(val) {
    this.zoom = val;
    if (this.zoom < constants.minZoom) {
      this.zoom = constants.minZoom;
    }
    if (this.zoom > constants.maxZoom) {
      this.zoom = constants.maxZoom;
    }
  },

  modZoom: function(val) {
    this.setZoom(this.zoom + val);
  },

  setX: function(val) {
    this.viewX = val;
    if (this.viewX < constants.minDim) {
      this.viewX = constants.minDim;
    }
    if (this.viewX > constants.maxDim) {
      this.viewX = constants.maxDim;
    }
  },

  modX: function(val) {
    this.setX(this.viewX + val);
  },

  setY: function(val) {
    this.viewY = val;
    if (this.viewY < constants.minDim) {
      this.viewY = constants.minDim;
    }
    if (this.viewY > constants.maxDim) {
      this.viewY = constants.maxDim;
    }
  },

  modY: function(val) {
    this.setY(this.viewY + val);
  },

  convertToGridCoords(x, y) {
    return {
      x: x / this.zoom - this.viewX,
      y: y / this.zoom - this.viewY
    }
  }
}



function getClosestDot(x, y) {
  // assume x and y are in grid coords
  let closestOptions = []; // we can easily find five closest options
  let yMod = y % constants.gridSize;
  let yPos = y - yMod;
  let xMod = x % (constants.gridX * 2);
  let xPos = x - xMod;

  closestOptions.push(
    {x: xPos, y: yPos},
    {x: xPos + constants.gridX * 2, y: yPos},
    {x: xPos + constants.gridX * 2, y: yPos + constants.gridSize},
    {x: xPos, y: yPos + constants.gridSize},
    {x: xPos + constants.gridX, y: yPos + constants.gridSize / 2}
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
}

export {
  constants,
  values,
  getClosestDot
}