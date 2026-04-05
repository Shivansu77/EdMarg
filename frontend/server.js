const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const dev = false;
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();
app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(process.env.PORT || 3000, (err) => {
    if (err) throw err;
    console.log('> Ready for Passenger');
  });
});
