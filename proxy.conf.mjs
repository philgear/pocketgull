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
    },
    "/api": {
      target: "http://localhost:4000",
      secure: false,
      changeOrigin: true
    },
    "/api-docs": {
      target: "http://localhost:4000",
      secure: false,
      changeOrigin: true
    },
    "/api/python": {
      target: "http://localhost:8001",
      secure: false,
      changeOrigin: true,
      pathRewrite: { "^/api/python": "" }
    }
  };
