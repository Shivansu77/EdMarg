const logger = (req, res, next) => {
  const start = Date.now();
  const { method, path, ip } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    const statusColor = statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
    const reset = '\x1b[0m';

    console.log(
      `${statusColor}[${new Date().toISOString()}] ${method} ${path} - ${statusCode} - ${duration}ms${reset}`
    );
  });

  next();
};

module.exports = logger;
