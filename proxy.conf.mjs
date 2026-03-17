export default {
    "/ws/gemini-live": {
      target: "wss://generativelanguage.googleapis.com",
      secure: true,
      changeOrigin: true,
      ws: true,
      pathRewrite: {
        "^/ws/gemini-live": "/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent"
      },
      onProxyReqWs: (proxyReq, req, socket, options, head) => {
        proxyReq.setHeader('Origin', 'https://pocketgull.app/');
        proxyReq.setHeader('Referer', 'https://pocketgull.app/');
      }
    }
  };
