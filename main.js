const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const axios = require("axios");

// Handle proxy requests through IPC
ipcMain.handle('proxy-request', async (event, { url, isLive }) => {
  try {
    const fullUrl = url + (query ? '?' + new URLSearchParams(query).toString() : '');
    console.info("Proxy Request:", fullUrl);
    
    const response = await axios({
      method: "GET",
      url: fullUrl,
      headers: {
        "User-Agent": "ALPHA Player/5.0.2 (Linux;Android 14) ExoPlayerLib/2.11.3",
        Connection: "Keep-Alive",
        "Accept-Encoding": "identity",
        "Icy-MetaData": "1",
      },
      responseType: "arraybuffer",
      httpVersion: "1.1",
      validateStatus: false,
      timeout: isLive ? 0 : 30000, // No timeout for live streams
      maxRedirects: 5
    });

    return {
      status: response.status,
      headers: response.headers,
      data: response.data
    };
  } catch (error) {
    if (error.response) {
      return {
        status: error.response.status,
        headers: error.response.headers,
        data: error.response.data
      };
    }
    throw new Error('Stream Connection Failed');
  }
});

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});