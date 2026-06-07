const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // OpenF1 proxy — blocks localhost CORS
  app.use('/openf1', createProxyMiddleware({
    target: 'https://api.openf1.org',
    changeOrigin: true,
    pathRewrite: (path) => path.replace(/^\/openf1/, '/v1'),
    on: {
      error: (err, req, res) => {
        console.error('[Proxy OpenF1 error]', err.message);
        res.status(502).json({ error: 'OpenF1 proxy error' });
      }
    }
  }));

  // Ergast/jolpi proxy — blocks localhost CORS
  app.use('/ergast', createProxyMiddleware({
    target: 'https://api.jolpi.ca',
    changeOrigin: true,
    pathRewrite: (path) => path.replace(/^\/ergast/, '/ergast/f1'),
    on: {
      error: (err, req, res) => {
        console.error('[Proxy Ergast error]', err.message);
        res.status(502).json({ error: 'Ergast proxy error' });
      }
    }
  }));
};
