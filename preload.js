// ============================================================
// TürkiyeMonitor — Preload Script
// Exposes safe APIs to renderer
// ============================================================
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls for our custom title bar
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close:    () => ipcRenderer.send('window-close'),
  // Open URL in system browser
  openExternal: (url) => ipcRenderer.send('open-external', url),
});
