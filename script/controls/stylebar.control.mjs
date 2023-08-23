

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

let validColorRegex = /^#(?:[0-9a-fA-F]{3,4}){1,2}$/

let lineSize = 3; // this will later be selectable from a drop down or slider

let StylebarControl = {
  lastValidLineValue: '#000000ff',
  lastValidFillValue: '#000000ff',
  getLineColor: function () {
    if (!lineColorEle.value.trim().match(validColorRegex)) {
      return this.lastValidLineValue;
    }
    this.lastValidLineValue = lineColorEle.value.trim();
    return lineColorEle.value.trim();
  },
  getFillColor: function () {
    if (!fillColorEle.value.trim().match(validColorRegex)) {
      return this.lastValidFillValue;
    }
    this.lastValidFillValue = fillColorEle.value.trim();
    return fillColorEle.value.trim();
  },
  getLineSize: function() {
    return lineSize;
  }
}

export { StylebarControl }