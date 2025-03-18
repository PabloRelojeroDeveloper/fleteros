const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Enviar mensajes al proceso principal
  startUpdate: () => ipcRenderer.send('start-update'),
  skipUpdate: () => ipcRenderer.send('skip-update'),
  
  // Recibir mensajes del proceso principal
  onCheckingForUpdate: (callback) => 
    ipcRenderer.on('checking-for-update', () => callback()),
  
  onUpdateAvailable: (callback) => 
    ipcRenderer.on('update-available', () => callback()),
  
  onUpdateNotAvailable: (callback) => 
    ipcRenderer.on('update-not-available', () => callback()),
  
  onDownloadProgress: (callback) => 
    ipcRenderer.on('download-progress', (_, progress) => callback(progress)),
  
  onUpdateDownloaded: (callback) => 
    ipcRenderer.on('update-downloaded', () => callback()),
  
  onError: (callback) => 
    ipcRenderer.on('error', (_, error) => callback(error))
});