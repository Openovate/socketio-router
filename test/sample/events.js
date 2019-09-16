const { EventEmitter } = require('../../src');

const event = new EventEmitter;

event.on('message-create', function(req, res) {
  res.route.channel = 'all';
  res.rest.set('error', false);
  res.rest.set('results', req.stage.get('message'));
});

module.exports = event;
