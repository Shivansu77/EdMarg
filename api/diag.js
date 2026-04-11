module.exports = (req, res) => {
  const envStatus = {
    MONGODB_URI: process.env.MONGODB_URI ? 'PRESENT (Masked)' : 'MISSING',
    JWT_SECRET: process.env.JWT_SECRET ? 'PRESENT (Masked)' : 'MISSING',
    DB_NAME: process.env.DB_NAME ? 'PRESENT' : 'MISSING (Defaulting to edmarg_db)',
    NODE_ENV: process.env.NODE_ENV || 'not set',
    VERCEL: process.env.VERCEL ? 'YES' : 'NO',
  };

  const fs = require('fs');
  const path = require('path');
  let files = [];
  try {
    files = fs.readdirSync(path.join(process.cwd()));
  } catch (e) {
    files = [e.message];
  }

  const allVars = Object.keys(process.env).filter(k => 
    !k.includes('SECRET') && 
    !k.includes('PASSWORD') && 
    !k.includes('KEY') &&
    !k.includes('TOKEN') &&
    !k.includes('URI')
  );

  res.json({
    success: true,
    message: "Environment Diagnostic",
    cwd: process.cwd(),
    files,
    envStatus,
    availableNonSensitiveKeys: allVars
  });
};
