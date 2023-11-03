import { DialogControl } from "../controls/dialog.comtrol.mjs";
import { FileControl } from "../controls/file.control.mjs";
import { SubMenuIcon, SubMenu } from "../controls/submenu.control.mjs"
import { ObjectService } from "../services/object.service.mjs";

let SaveLoadTool = {
  icon: './img/select-icon.png',
  name: 'Save and Load Tool',
  preview: null,
  exportSketchCallback: null,
  subMenu: new SubMenu(),
  drawPreview: null,
  events: {

  }
}

let saveIcon = new SubMenuIcon('./img/snap-icon.png', 'Save');
let loadIcon = new SubMenuIcon('./img/snap-icon.png', 'Load');
let extIcon = new SubMenuIcon('./img/snap-icon.png', 'Import Tool');

saveIcon.event.addListener(() => {
  const blob = new Blob([ObjectService.serializeObjectList()], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.getElementById('downloadProxy');
  
  downloadLink.href = url;
  downloadLink.click();

  setTimeout(() => {
    downloadLink.href = '';
    URL.revokeObjectURL(url);
  })
});

loadIcon.event.addListener(() => {
  FileControl.openFileDialog();
});

extIcon.event.addListener(() => {
  DialogControl.hideDialog();
  DialogControl.addText('Load External Tool from URL');
  DialogControl.addInput('URL:');
  DialogControl.addButton('Load', () => {
  });
});

SaveLoadTool.subMenu.icons.push(saveIcon, loadIcon, extIcon);

export {
  SaveLoadTool
}