import { ObjectService } from "../services/object.service.mjs";
import { DialogControl } from "./dialog.comtrol.mjs";

const uploadLink = document.getElementById('uploadProxy');

uploadLink.addEventListener('change', () => {
  if (uploadLink.files.length) {
    const fileReader = new FileReader();
    fileReader.addEventListener('load', () => {
      if (!ObjectService.loadObjectList(fileReader.result)) {
        DialogControl.hideDialog();
        DialogControl.addText('File could not be loaded!');
        DialogControl.showDialog();
      }
    });
    fileReader.readAsText(uploadLink.files[0]);
  }
});

let FileControl = {
  openFileDialog: function () {
    uploadLink.click();
  }
}

export {
  FileControl
}