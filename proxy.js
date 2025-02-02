const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());

app.get("/:url(**)", async (req, res) => {
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
      validateStatus: false // Allow any status code
    });

    // Forward the status code and headers from the original response
    res.status(response.status);
    Object.entries(response.headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    response.data.pipe(res);
  } catch (error) {
    if (error.response) {
      // Forward the error response if available
      res.status(error.response.status);
      Object.entries(error.response.headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
      error.response.data.pipe(res);
    } else {
      // Only if there's no response at all (e.g., network error)
      res.status(502).send('Bad Gateway');
    }
  }
});

const PORT = 8081;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Proxy server running on http://0.0.0.0:${PORT}`);
});
