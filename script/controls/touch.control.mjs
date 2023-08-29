import { EventLoudener } from "../core/loudener.mjs";

const tapTime = 200;
const tapDist = 5;
const zoomDist = 1;

class Touch {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.start = Date.now();
    this.end = null;
    this.ox = x;
    this.oy = y;
    this.lx = x;
    this.ly = y;
  }
}

let TouchControl = {
  tap: new EventLoudener(),
  zoom: new EventLoudener(),
  move: new EventLoudener(),
  pan: new EventLoudener(),
  down: new EventLoudener(),
  up: new EventLoudener(),
  tapTracker: new Map(),
  handleTouchStartEvent: function (evt, canvas) {
    evt.preventDefault();
    for (let t of evt.touches) {
      let coords = { x: t.clientX, y: t.clientY };
      this.tapTracker.set(t.identifier, new Touch(coords.x, coords.y));
      this.down.emit({
        clientX: coords.x,
        clientY: coords.y,
        target: canvas
      });
    }
  },
  handleTouchEndEvent: function (evt, canvas) {
    evt.preventDefault();
    let now = Date.now();
    for (let t of evt.changedTouches) {
      let item = this.tapTracker.get(t.identifier);
      if (!item) {
        console.error('Attempted to delete a missing touch event!');
        return;
      }
      let coords = { x: t.clientX, y: t.clientY };
      item.end = now;
      if (
        now - item.start < tapTime &&
        Math.abs(item.ox - coords.x) < tapDist &&
        Math.abs(item.oy - coords.y) < tapDist
      ) {
        this.tap.emit({
          clientX: item.ox,
          clientY: item.oy,
          target: canvas
        });
      }
      this.up.emit({
        clientX: coords.x,
        clientY: coords.y,
        target: canvas
      });
      this.tapTracker.delete(t.identifier);
    }
  },
  handleTouchMoveEvent: function (evt, canvas) {
    evt.preventDefault();
    let touchArr = [];
    for (let t of evt.touches) {
      let coords = { x: t.clientX, y: t.clientY };
      let tap = this.tapTracker.get(t.identifier);
      if (!tap) {
        console.error("Tried to move a nonregistered touch event!");
        continue;
      }
      tap.lx = tap.x;
      tap.ly = tap.y;
      tap.x = coords.x;
      tap.y = coords.y;
      touchArr.push(tap);
    }
    switch (touchArr.length) {
      case 1: 
        this.move.emit({
          clientX: touchArr[0].x,
          clientY: touchArr[0].y,
          movementX: touchArr[0].x - touchArr[0].lx,
          movementY: touchArr[0].y - touchArr[0].ly,
          target: canvas
        });
        break;
      case 2:
        let oldDist = Math.hypot(touchArr[0].lx - touchArr[1].lx, touchArr[0].ly - touchArr[1].ly);
        let newDist = Math.hypot(touchArr[0].x - touchArr[1].x, touchArr[0].y - touchArr[1].y);
        if (Math.abs(oldDist - newDist) > zoomDist) {
          this.zoom.emit({
            zoom: newDist - oldDist,
            clientX: (touchArr[0].x + touchArr[1].x) / 2,
            clientY: (touchArr[0].y + touchArr[1].y) / 2
          });
        }
        let dx = 0;
        let dy = 0;
        let dx0 = touchArr[0].x - touchArr[0].lx;
        let dy0 = touchArr[0].y - touchArr[0].ly;
        let dx1 = touchArr[1].x - touchArr[1].lx;
        let dy1 = touchArr[1].y - touchArr[1].ly;
        if ((dx0 > 0) === (dx1 > 0)) {
          dx = Math.abs(dx0) < Math.abs(dx1) ? dx0 : dx1;
        }
        if ((dy0 > 0) === (dy1 > 0)) {
          dy = Math.abs(dy0) < Math.abs(dy1) ? dy0 : dy1;
        }
        if (dx || dy) {
          this.pan.emit({
            deltaX: dx,
            deltaY: dy,
            target: canvas
          });
        }
    }
  },
  handletouchCancelEvent: function (evt) {
    evt.preventDefault();
    // don't do anything
    for (let t of evt.changedTouches) {
      let item = this.tapTracker.get(t.identifier);
      if (!item) {
        console.error('Attempted to delete a missing touch event!');
        return;
      }
      this.tapTracker.delete(t.identifier);
    }
  },
  initTouchEvents: function (canvas) {
    canvas.addEventListener('touchstart', evt => this.handleTouchStartEvent(evt, canvas), false);
    canvas.addEventListener('touchend', evt => this.handleTouchEndEvent(evt, canvas), false);
    canvas.addEventListener('touchmove', evt => this.handleTouchMoveEvent(evt, canvas), false);
    canvas.addEventListener('touchcancel', evt => this.handletouchCancelEvent(evt, canvas), false);
  }
}

export { TouchControl }