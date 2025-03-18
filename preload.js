const { ipcRenderer } = require('electron');

window.ipcApi = {
  getAsociados: () => ipcRenderer.invoke('get-asociados'),
  addAsociado: (asociado) => ipcRenderer.invoke('add-asociado', asociado),
  updateAsociado: (index, asociado) => ipcRenderer.invoke('update-asociado', { index, asociado }),
  deleteAsociado: (index) => ipcRenderer.invoke('delete-asociado', index)
};