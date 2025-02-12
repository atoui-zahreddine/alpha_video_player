const { app, BrowserWindow, ipcMain, session } = require("electron");
const axios = require("axios");

// Handle proxy requests through IPC
ipcMain.handle("proxy-request", async (event, { url, isLive }) => {
  try {
    const response = await axios({
      method: "GET",
      url: url,
      headers: {
        "User-Agent":
          "ALPHA Player/5.0.2 (Linux;Android 14) ExoPlayerLib/2.11.3",
        Connection: "Keep-Alive",
        "Accept-Encoding": "identity",
        "Icy-MetaData": "1",
      },
      // Add these options to prevent Axios from modifying headers
      transformRequest: [
        function (data, headers) {
          // Prevent Axios from adding its own User-Agent
          delete headers.common["User-Agent"];
          return data;
        },
      ],
      responseType: "arraybuffer",
      httpVersion: "1.1",
      validateStatus: false,
      timeout: isLive ? 0 : 30000,
    });

    return {
      status: response.status,
      headers: response.headers,
      data: response.data,
    };
  } catch (error) {
    if (error.response) {
      return {
        status: error.response.status,
        headers: error.response.headers,
        data: error.response.data,
      };
    }
    throw new Error("Stream Connection Failed");
  }
});

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    const customHeaders = {
      "User-Agent": "ALPHA Player/5.0.2 (Linux;Android 14) ExoPlayerLib/2.11.3",
      Accept: "*/*",
      "Accept-Encoding": "identity",
      Connection: "Keep-Alive",
      "Icy-MetaData": "1",
    };

    callback({
      requestHeaders: { ...details.requestHeaders, ...customHeaders },
    });
  });

  win.loadFile("index.html");
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
