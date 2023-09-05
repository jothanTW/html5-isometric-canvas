import { EventLoudener } from '../core/loudener.mjs';
import { CommonService } from '../services/common.service.mjs';

const lineSizeMin = 1;
const lineSizeMax = 10;

let lineColorEle = document.getElementById('line-color-picker').getElementsByTagName('input')[0];
let fillColorEle = document.getElementById('fill-color-picker').getElementsByTagName('input')[0];
let lineweightEle = document.getElementById('line-weight-slider').getElementsByTagName('input')[0];
let zoomSlider = document.getElementById('zoom-slider').getElementsByTagName('input')[0];

let lineWeightValEle = document.getElementById('line-weight-value');
let zoomValEle = document.getElementById('zoom-value');

lineweightEle.setAttribute('min', lineSizeMin);
lineweightEle.setAttribute('max', lineSizeMax);
lineWeightValEle.innerText = lineweightEle.value;

zoomSlider.setAttribute('min', CommonService.constants.minZoom);
zoomSlider.setAttribute('max', CommonService.constants.maxZoom);
zoomSlider.value = CommonService.zoom;
zoomSlider.setAttribute('step', CommonService.constants.zoomStep);
zoomValEle.innerText = Math.round((CommonService.zoom + Number.EPSILON) * 100) + '%';

let colorPickerOptions = {
  width: 100,
  closeButton: true,
  closeText: 'OK'
}

lineColorEle.setAttribute('data-jscolor', JSON.stringify(colorPickerOptions));
fillColorEle.setAttribute('data-jscolor', JSON.stringify(colorPickerOptions));
if (jscolor) {
  jscolor.install();
}

lineColorEle.addEventListener('change', event => {
  StylebarControl.lastValidLineValue = event.target.value;
  StylebarControl.lineColorChanged.emit(event.target.value);
});

fillColorEle.addEventListener('change', event => {
  StylebarControl.lastValidFillValue = event.target.value;
  StylebarControl.fillColorChanged.emit(event.target.value);
});

lineweightEle.addEventListener('input', event => {
  StylebarControl.lineWeightChanged.emit(event.target.value);
  lineWeightValEle.innerText = lineweightEle.value;
});



zoomSlider.addEventListener('input', event => {
  CommonService.setZoom(event.target.value);
  CommonService.triggerDrawFunction();
});

CommonService.zoomEvent.addListener(zoom => {
  zoomSlider.value = zoom;
  zoomValEle.innerText = Math.round((zoom + Number.EPSILON) * 100) + '%';
  ;
})

let validColorRegex = /^#(?:[0-9a-fA-F]{3,4}){1,2}$/

/**
 * The stylebar control. Maintains the color/fill/line size options
 * @module controls/stylebar
 */
let StylebarControl = {
  lastValidLineValue: '#000000ff',
  lastValidFillValue: '#000000ff',
  lineColorChanged: new EventLoudener(),
  fillColorChanged: new EventLoudener(),
  lineWeightChanged: new EventLoudener(),
  /**
   * @returns {string} A hex code color string
   */
  getLineColor: function () {
    if (!lineColorEle.value.trim().match(validColorRegex)) {
      return this.lastValidLineValue;
    }
    this.lastValidLineValue = lineColorEle.value.trim();
    return lineColorEle.value.trim();
  },
  /**
   * @returns {string} A hex code color string
   */
  getFillColor: function () {
    if (!fillColorEle.value.trim().match(validColorRegex)) {
      return this.lastValidFillValue;
    }
    this.lastValidFillValue = fillColorEle.value.trim();
    return fillColorEle.value.trim();
  },
  /**
   * @returns {number} A line weight
   */
  getLineSize: function() {
    return lineweightEle.value;
  },

  setLineColor: function(color, forceUpdate = false) {
    if (!color.trim().match(validColorRegex)) {
      console.error('Invalid color code "' + color + '" assigned to line color!');
      return;
    }
    lineColorEle.jscolor.fromString(color);
    this.lastValidLineValue = color;
    if (forceUpdate) {
      this.lineColorChanged.emit(color);
    }
  },

  setFillColor: function(color, forceUpdate = false) {
    if (!color.trim().match(validColorRegex)) {
      console.error('Invalid color code "' + color + '" assigned to fill color!');
      return;
    }
    fillColorEle.jscolor.fromString(color);
    this.lastValidFillValue = color;
    if (forceUpdate) {
      this.fillColorChanged.emit(color);
    }
  },

  setLineSize: function(size, forceUpdate = false) {
    if (typeof size === 'string') {
      try {
        size = parseInt(size);
      } catch (e) {
        console.error('Invalid size value "' + size + '" assigned to line weight!');
        return;
      }
    }
    if (typeof size !== 'number') {
      console.error('Invalid type assigned to line weight!');
    }
    lineweightEle.value = size;
    lineWeightValEle.innerText = lineweightEle.value;
    if (forceUpdate) {
      this.lineWeightChanged.emit(size);
    }
  }
}

export { StylebarControl }