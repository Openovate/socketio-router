# socketio-router
Event Router for Socket.io

## Install

```bash
$ npm i --save @openovate/socketio-router
```

## Usage

```js
//FILE: app.js

//1. make some routes
const router = require('@openovate/express-router');
const routes = router();
routes.get('/', (req, res) => {
  res.content.set('Hello World');
});

routes.get('/message/create', async(req, res) => {
  await events.emit('message-create', req, res);
});

routes.route('/socketio').get(async(req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.content.set(fs.createReadStream(__dirname + '/socketio.html'));
});

router.route('/jquery.min.js').get(async(req, res) => {
  res.setHeader('Content-Type', 'text/javascript');
  res.content.set(fs.createReadStream(__dirname + '/jquery.min.js'));
});

//2. make express
const express = require('express');
const app = express();
app.use(routes);

//3. make server
const http = require('http');
const server = http.createServer(app);
server.listen(3000);

//4. make some events
const emitter = require('@openovate/socketio-router');
const events = emitter();
events.on('message-create', function(req, res) {
  res.route.channel = 'all';
  res.rest.set('error', false);
  res.rest.set('results', req.stage.get('message'));
});

//5. make socketio
const socketio = require('socket.io');
socketio(server).use(events);
```

See the complete example in `test/sample`
