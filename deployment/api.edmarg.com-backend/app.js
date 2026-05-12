const backend = require('./server');

if (typeof backend.startServer === 'function') {
  backend.startServer(process.env.PORT || 3000);
} else if (backend?.server && typeof backend.server.listen === 'function') {
  const port = process.env.PORT || 3000;
  backend.server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
} else {
  throw new Error('Unable to start backend server from app.js');
}
