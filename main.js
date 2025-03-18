const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

// URL base de tu API
const API_BASE_URL = 'https://pablo.pablorelojerio.online/api/';

// Ventanas de la aplicación
let mainWindow;
let updateWindow;

// Creación de la ventana de actualización
function createUpdateWindow() {
  updateWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload-update.js')
    }
  });

  updateWindow.loadFile('update.html');
  
  // Solo para desarrollo
  if (process.argv.includes('--dev')) {
    updateWindow.webContents.openDevTools({ mode: 'detach' });
  }

  updateWindow.on('closed', () => {
    updateWindow = null;
  });
}

// Creación de la ventana principal
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');

  // Solo para desarrollo
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Inicialización de la aplicación
app.whenReady().then(() => {
  // En modo desarrollo, abrir directamente la ventana principal
  if (process.argv.includes('--dev')) {
    createWindow();
  } else {
    // En producción, primero mostrar la ventana de actualización
    createUpdateWindow();
    
    // Verificar actualizaciones al inicio
    autoUpdater.checkForUpdates();
  }
});

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) {
    if (process.argv.includes('--dev')) {
      createWindow();
    } else {
      createUpdateWindow();
    }
  }
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Configuración del autoUpdater
autoUpdater.autoDownload = false;
autoUpdater.logger = require('electron-log');
autoUpdater.logger.transports.file.level = 'info';

// Eventos del autoUpdater
autoUpdater.on('checking-for-update', () => {
  if (updateWindow) updateWindow.webContents.send('checking-for-update');
});

autoUpdater.on('update-available', () => {
  if (updateWindow) updateWindow.webContents.send('update-available');
});

autoUpdater.on('update-not-available', () => {
  if (updateWindow) updateWindow.webContents.send('update-not-available');
  // Si no hay actualizaciones, cerrar ventana de actualización y abrir main
  if (updateWindow) {
    setTimeout(() => {
      createWindow();
      updateWindow.close();
    }, 2000);
  }
});

autoUpdater.on('download-progress', (progress) => {
  if (updateWindow) updateWindow.webContents.send('download-progress', progress);
});

autoUpdater.on('update-downloaded', () => {
  if (updateWindow) updateWindow.webContents.send('update-downloaded');
  // Instalar actualización después de un breve retraso
  setTimeout(() => {
    autoUpdater.quitAndInstall(true, true);
  }, 3000);
});

autoUpdater.on('error', (err) => {
  if (updateWindow) updateWindow.webContents.send('error', err);
  console.error('Error de actualización:', err);
  // Si hay error, abrir la ventana principal después de un tiempo
  setTimeout(() => {
    createWindow();
    if (updateWindow) updateWindow.close();
  }, 3000);
});

// IPC para la ventana de actualización
ipcMain.on('start-update', () => {
  autoUpdater.downloadUpdate();
});

ipcMain.on('skip-update', () => {
  createWindow();
  if (updateWindow) updateWindow.close();
});

// IPC para operaciones CRUD
ipcMain.handle('get-asociados', async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/get-asociados.php`);
    const data = await response.json();
    return data.asociados || [];
  } catch (error) {
    console.error('Error al obtener asociados:', error);
    return [];
  }
});

ipcMain.handle('add-asociado', async (_, asociado) => {
  try {
    const response = await fetch(`${API_BASE_URL}/add-asociado.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ asociado }),
    });
    const result = await response.json();
    return result.success || false;
  } catch (error) {
    console.error('Error al agregar asociado:', error);
    return false;
  }
});

ipcMain.handle('update-asociado', async (_, { index, asociado }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/update-asociado.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ index, asociado }),
    });
    const result = await response.json();
    return result.success || false;
  } catch (error) {
    console.error('Error al actualizar asociado:', error);
    return false;
  }
});

ipcMain.handle('delete-asociado', async (_, index) => {
  try {
    const response = await fetch(`${API_BASE_URL}/delete-asociado.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ index }),
    });
    const result = await response.json();
    return result.success || false;
  } catch (error) {
    console.error('Error al eliminar asociado:', error);
    return false;
  }
});