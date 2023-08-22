class Sketch {
  constructor(type) {
    this.type = type;
  }
}

class PathSketch extends Sketch {
  constructor() {
    super('path');
    this.nodes = [];
    this.color = '';
    this.isClosed = false;
  }
}

export {
  Sketch, PathSketch
}