/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Root-level Vercel Entry Point (Diagnostic Mode)
 */
try {
  const app = require('./backend/server');

  module.exports = async (req, res) => {
    try {
      // Direct call to Express app
      return app(req, res);
    } catch (handlerError) {
      console.error('SERVERLESS_HANDLER_ERROR:', handlerError);
      res.status(500).json({
        success: false,
        error: 'Handler Execution Failed',
        message: handlerError.message,
        stack: process.env.NODE_ENV === 'development' ? handlerError.stack : undefined
      });
    }
  };
} catch (startupError) {
  console.error('SERVERLESS_STARTUP_ERROR:', startupError);
  
  module.exports = (req, res) => {
    res.status(500).json({
      success: false,
      error: 'Backend Startup Failed',
      message: startupError.message,
      hint: startupError.message.includes('Cannot find module') 
        ? 'A dependency is missing in the root package.json'
        : 'Check your environment variables like MONGODB_URI',
      stack: startupError.stack
    });
  };
}
