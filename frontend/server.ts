import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
const dev = false;
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();
app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  }).listen(process.env.PORT || 3000, (err?: Error) => {
    if (err) throw err;
    console.log('> Ready for Passenger');
  });
});
