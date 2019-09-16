const fs = require('fs');
const Router = require('@openovate/express-router');
const events = require('./events');

const router = Router();

router.get('/', (req, res) => {
  res.content.set('Hello World');
});

router.get('/message/create', async(req, res) => {
  await events.emit('message-create', req, res);
});

router.route('/socketio').get(async(req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.content.set(fs.createReadStream(__dirname + '/socketio.html'));
});

router.route('/jquery.min.js').get(async(req, res) => {
  res.setHeader('Content-Type', 'text/javascript');
  res.content.set(fs.createReadStream(__dirname + '/jquery.min.js'));
});

module.exports = router;
