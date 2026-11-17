const target = process.env.ZIKO_API_TARGET || 'http://127.0.0.1:3000';

module.exports = {
  '/api': { target, changeOrigin: true, secure: false },
  '/health': { target, changeOrigin: true, secure: false },
};
