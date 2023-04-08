// Import the necessary Electron modules
const contextBridge = require('electron').contextBridge;
const ipcRenderer = require('electron').ipcRenderer;

// Exposed protected methods in the render process
contextBridge.exposeInMainWorld(
    // Allowed 'ipcRenderer' methods
    'bridge', {
        // From main to render
        sendSettings: (message) => {
            ipcRenderer.on('sendSettings', message);
        },
        sendFormData: (channel, data) => {
            ipcRenderer.send(channel, data);
        },
        sendNextData: (channel, data) => {
            ipcRenderer.send(channel, data);
        },
        sendPrevData: (channel, data) => {
            ipcRenderer.send(channel, data);
        }

    }
);
