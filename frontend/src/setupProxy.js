const { createProxyMiddleware } = require('http-proxy-middleware');
const os = require('os');

function getNetworkIP() {
  const networks = os.networkInterfaces();
  for (const name of Object.keys(networks)) {
    for (const network of networks[name]) {
      if (network.family === 'IPv4' && !network.internal) {
        return network.address;
      }
    }
  }
  return 'localhost';
}

function getTarget() {
  if (process.env.BACKEND_URL) {
    return process.env.BACKEND_URL;
  }

  const backendHost = process.env.BACKEND_HOST || getNetworkIP();
  const backendPort = process.env.BACKEND_PORT || '8000';
  const backendProtocol = process.env.BACKEND_PROTOCOL || 'http';

  return `${backendProtocol}://${backendHost}:${backendPort}`;
}

module.exports = function (app) {
  const target = getTarget();
  const routes = ['/api', '/media'];

  console.log(`🔗 Proxy setup: ${routes.join(', ')} -> ${target}`);

  app.use(
    routes,
    createProxyMiddleware({
      target,
      changeOrigin: true,
      secure: false,
      logLevel: 'warn',
      ws: false,
      onError: (err, req, res) => {
        // Handle proxy errors silently
        res.writeHead(500, {
          'Content-Type': 'text/plain',
        });
        res.end('Proxy error: ' + err.message);
      },
    })
  );
};
