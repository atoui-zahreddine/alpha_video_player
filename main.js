const { app, BrowserWindow } = require('electron');
const path = require('path');
const express = require("express");
const cors = require("cors");
const axios = require("axios");

// Setup Express server
const setupServer = () => {
  const server = express();
  server.use(cors());

  server.get("/:url(**)", async (req, res) => {
    try {
      console.info("Proxy Request:", req.params.url);
      const fullUrl = req.params.url + (req.query ? '?' + new URLSearchParams(req.query).toString() : '');
      console.info("Full URL:", fullUrl);
      
      const response = await axios({
        method: "GET",
        url: fullUrl,
        headers: {
          "User-Agent": "ALPHA Player/5.0.2 (Linux;Android 14) ExoPlayerLib/2.11.3",
          Connection: "Keep-Alive",
          "Accept-Encoding": "identity",
          "Icy-MetaData": "1",
        },
        responseType: "stream",
        httpVersion: "1.1",
        validateStatus: false
      });

      res.status(response.status);
      Object.entries(response.headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
      response.data.pipe(res);
    } catch (error) {
      if (error.response) {
        res.status(error.response.status);
        Object.entries(error.response.headers).forEach(([key, value]) => {
          res.setHeader(key, value);
        });
        error.response.data.pipe(res);
      } else {
        res.status(502).send('Bad Gateway');
      }
    }
  });

  return server;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Start the proxy server
  const server = setupServer();
  const PORT = 8081;
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Proxy server running on http://0.0.0.0:${PORT}`);
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