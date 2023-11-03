let dialogEle = document.getElementById('dialog');
let closeEle = document.getElementById('dialogClose');

closeEle.addEventListener('click', () => {
  DialogControl.hideDialog();
})

let DialogControl = {
  inputEles: [],
  showDialog: function () {
    dialogEle.classList.add('active');
  },
  hideDialog: function() {
    dialogEle.classList.remove('active');
    this.clearDialog();
  },
  clearDialog: function() {
    dialogEle.innerHTML = '';
    dialogEle.appendChild(closeEle);
    this.inputEles = [];
  },
  isDialogUp: function() {
    return dialogEle.classList.contains('active');
  },
  addText: function(text) {
    let newDiv = document.createElement('div');
    newDiv.classList.add('dialog-text');
    let node = document.createTextNode(text);
    newDiv.appendChild(node);
    dialogEle.appendChild(newDiv);
  },
  addInput: function(title) {
    let newDiv = document.createElement('div');
    newDiv.classList.add('dialog-input');
    let node = document.createTextNode(title);
    let inp = document.createElement('input');

    let internalName = title.replace(/([a-z])([A-Z])/g, "$1-$2")
      .replace(/[\s_]+/g, '-').toLowerCase();

    inp.setAttribute('internalName', title);
    for (let i of this.inputEles) {
      if (i.getAttribute('internalName') == title) {
        console.error('Attempted to add a duplicate input "' + title + '" to dialog control!');
        return;
      }
    }

    newDiv.appendChild(node);
    newDiv.appendChild(inp);
    this.inputEles.push(inp);
    dialogEle.appendChild(newDiv);
  },
  addButton: function(title, callback) {
    if (callback && typeof callback !== 'function') {
      console.error('Attempted to add a button with an invalid callback!');
      return;
    }
    // if the last element was a button, add another button to that row
    let newDiv;
    if (dialogEle.lastChild.classList?.contains('dialog-button-list')) {
      newDiv = dialogEle.lastChild;
    } else {
      newDiv = document.createElement('div');
      newDiv.classList.add('dialog-button-list');
      dialogEle.appendChild(newDiv);
    }
    let button = document.createElement('button');
    if (!callback) {
      callback = () => DialogControl.hideDialog();
    }
      button.addEventListener('click', callback);
    let node = document.createTextNode(title);
    button.appendChild(node);
    newDiv.appendChild(button);
  },

  getInputValues: function() {
    let r = {};
    for (let i of this.inputEles) {
      r[i.getAttribute('internalName')] = i.value;
    }
    return r;
  }
}

export {
  DialogControl
}