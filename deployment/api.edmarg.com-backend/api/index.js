const app = require('../server');

module.exports = (req, res) => {
  // Simple bridge to ensure the app handles the request
  return app(req, res);
};
