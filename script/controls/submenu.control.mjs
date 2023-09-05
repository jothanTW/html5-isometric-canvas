import { EventLoudener } from "../core/loudener.mjs";

let subMenuEle = document.getElementById('submenu');

if (!subMenuEle) {
  throw 'Could not find the SubMenu control in the html!';
}

// Set up the dragging listeners
let isDragging = false;
let touchesToWatch = new Map();
function startDragging(evt) {
  isDragging = true;
  if (evt.touches) {
    for (let t of evt.touches) {
      touchesToWatch.set(t.identifier, {
        x: t.clientX,
        y: t.clientY
      });
    }
  }
}
function stopDragging(evt) {
  isDragging = false;
  if (evt.changedTouches) {
    for (let t of evt.changedTouches) {
      if (touchesToWatch.has(t.identifier)) {
        touchesToWatch.delete(t.identifier);
      }
    }
  }
}
function drag(evt) {
  if (!isDragging) {
    return;
  }
  if (evt.touches) {
    let touch = evt.touches[0];
    let oldCoords = touchesToWatch.get(touch.identifier);
    SubMenuControl.moveSubMenu(touch.clientX - oldCoords.x, touch.clientY - oldCoords.y);
    touchesToWatch.set(touch.identifier, {
      x: touch.clientX,
      y: touch.clientY
    });
  } else {
    SubMenuControl.moveSubMenu(evt.movementX, evt.movementY);
  }
}
subMenuEle.addEventListener('mousedown', startDragging);
subMenuEle.addEventListener('touchstart', startDragging);
subMenuEle.addEventListener('mouseup', stopDragging);
subMenuEle.addEventListener('touchend', stopDragging);
subMenuEle.addEventListener('mousemove', drag);
subMenuEle.addEventListener('touchmove', drag);

// repeat these for the background canvas just in case
canvas.addEventListener('mouseup', stopDragging);
//canvas.addEventListener('touchend', stopDragging);
canvas.addEventListener('mousemove', drag);
//canvas.addEventListener('touchmove', drag);

class SubMenuIcon {
  constructor(icon, name) {
    this.icon = icon;
    this.name = name;
    this.event = new EventLoudener();

    this.isActive = false;
    this.isDisabled = false;

    this.ele = document.createElement('img');
    this.ele.src = this.icon;
    this.ele.addEventListener('click', evt => {
      if (!this.isDisabled) {
        this.event.emit(evt);
      }
    });
    this.ele.title = name;
    this.ele.id = 'submenu-icon-' + this.name;
    this.ele.classList = 'submenu-image';
  }
  activate() {
    this.ele.classList.add('active');
  }
  deactivate() {
    this.ele.classList.remove('active');
  }
  enable() {
    this.ele.classList.remove('disabled');
  }
  disable() {
    this.ele.classList.add('disabled');
    this.ele.classList.remove('active');
  }
}

class SubMenu {
  constructor(name) {
    this.name = name;
    this.icons = [];
    this.x = 0;
    this.y = 0;
  }
  loadIcons() {
    for (let i of this.icons) {
      subMenuEle.appendChild(i.ele);
    }
  }
}

/**
 * This control represents a floating, configurable submenu
 * It works with the Toolbar control to display the contents of one Submenu object
 * @module controls/submenu
 */
let SubMenuControl = {
  activeSubMenu: null,
  loadSubMenu: function (subMenu) {
    this.clearIcons();
    subMenu.loadIcons();
    subMenuEle.classList.add('active');
  },
  hideSubMenu: function () {
    subMenuEle.classList.remove('active');
  },
  isSubMenuVisible: function () {
    return subMenuEle.classList.contains('active');
  },
  loadIcons: function () {
    if (this.activeSubMenu) {
      this.activeSubMenu.loadIcons();
    }
  },
  clearIcons: function () {
    subMenuEle.innerHTML = '';
  },
  placeSubMenu: function (x, y) {
    if (typeof x == 'number' || !x.endsWith('px')) {
      x += 'px';
    }
    if (typeof y == 'number' || !y.endsWith('px')) {
      y += 'px';
    }
    subMenuEle.style.left = x;
    subMenuEle.style.top = y;
  },
  moveSubMenu: function (x, y) {
    if (typeof x == 'string') {
      if (x.endsWith('px')) {
        x = x.slice(0, -2);
      }
      x = parseInt(x);
    }
    if (typeof y == 'string') {
      if (y.endsWith('px')) {
        y = y.slice(0, -2);
      }
      y = parseInt(y);
    }
    this.placeSubMenu(subMenuEle.offsetLeft + x, subMenuEle.offsetTop + y);
  }
}

export {
  SubMenuControl,
  SubMenu,
  SubMenuIcon
}