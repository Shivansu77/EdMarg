/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Root-level Vercel Entry Point
 * Bridges the repository root to the backend subdirectory
 */
const app = require('../backend/server');

module.exports = async (req, res) => {
  return app(req, res);
};
