const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // Puedes exponer APIs seguras aquí si es necesario
  platform: process.platform
});