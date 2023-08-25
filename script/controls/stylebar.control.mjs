import { EventLoudener } from '../loudener.mjs';

let lineColorEle = document.getElementById('line-color-picker').getElementsByTagName('input')[0];
let fillColorEle = document.getElementById('fill-color-picker').getElementsByTagName('input')[0];

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

let validColorRegex = /^#(?:[0-9a-fA-F]{3,4}){1,2}$/

let lineSize = 3; // this will later be selectable from a drop down or slider

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
    return lineSize;
  }
}

export { StylebarControl }