import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const PORT = 8080;

console.log(`
======================================================
  POCKET GULL - LOCAL HUE RELAY
======================================================
This relay bypasses "Mixed Content" browser restrictions.
When Pocket Gull is hosted on Cloud Run (HTTPS), it cannot
directly talk to your Hue Bridge (HTTP / local IP).
This script runs locally on your machine, receives secure
requests on localhost, and proxies them to the Hue Bridge.
======================================================
`);

app.put('/api/hue/:bridgeIp/api/:username/lights/:lightId/state', async (req, res) => {
  const { bridgeIp, username, lightId } = req.params;

  // Validate parameters to prevent Server-Side Request Forgery (SSRF)
  const isValidIp = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(bridgeIp) || bridgeIp === 'localhost';
  const isValidUsername = /^[a-zA-Z0-9_\-]+$/.test(username);
  const isValidLightId = /^[0-9]+$/.test(lightId);

  if (!isValidIp || !isValidUsername || !isValidLightId) {
    return res.status(400).json({ error: 'Invalid parameters provided. SSRF check failed.' });
  }

  const url = `http://${bridgeIp}/api/${username}/lights/${lightId}/state`;

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(`[Hue Relay] Error sending to bridge:`, error.message);
    res.status(500).json({ error: 'Failed to contact Hue Bridge.' });
  }
});

app.listen(PORT, () => {
  console.log(`[READY] Hue Relay is listening on http://localhost:${PORT}`);
  console.log(`Update your application settings to use this relay if hosted in the cloud.`);
});
