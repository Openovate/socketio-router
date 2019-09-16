const { EventEmitter, helpers } = require('@openovate/express-router');

function createRouter(config = {}) {
  //merge config with defaults
  //note: no way to get it from router config..
  config = Object.assign({
    content: true,
    server: true,
    stage: true,
    rest: true
  }, config);

  async function SocketRouter(socket, next) {
    //this is the original payload
    const payload = {
      req: socket.client.request,
      res: socket.client.request.res
    };

    //route socket to app events
    const onevent = socket.onevent;
    socket.onevent = async(packet) => {
      //arguments are the data
      const args = packet.data || [];
      //if there are args
      if (!args.length) {
        //business as usual
        return onevent.call(socket, packet);
      }

      //make a next that handles errors
      const next = (err) => {
        router.emit('error', err, req, res);
      }

      //clone the request and response
      const req = Object.assign({}, payload.req);
      const res = Object.assign({}, payload.res);

      //configure the payloads
      await helpers.configurePayload(config, req, res);

      //set the request
      packet.session = socket.id;
      req.route = {
        event: args.shift(),
        args: [],
        parameters: {},
        packet: packet
      };

      //if there's data
      if (packet.data && typeof packet.data[0] !== 'undefined') {
        req.route.parameters = packet.data[0];
        //try to set stage
        if (req.stage) {
          req.stage.set(packet.data[0])
        }
      }

      //set the response
      res.route = JSON.parse(JSON.stringify(req.route))
      res.route.socket = socket;
      res.route.channel = 'self';

      //trigger request
      if (!await helpers.step('request', router, req, res, next)) {
        //if the request exits, then stop
        return;
      }

      //trigger main event
      if (!await helpers.step(res.route.event, router, req, res, next)) {
        //if the request exits, then stop
        return;
      }

      //interpret

      let channel = res.route.socket;
      // SOCKET LEGEND:
      // channel.emit - send to self
      // channel.nsp.emit - send to namespace
      // channel.server.emit - send to all
      switch (res.route.channel) {
        case 'nsp':
        case 'namespace':
          channel = channel.nsp;
          break;
        case 'all':
        case 'server':
          channel = channel.server;
          break;
      }

      //content > rest

      //if there is content
      if (res.content && res.content.has()) {
        //send it back to client
        channel.emit(res.route.event, res.content.get().toString());
        await helpers.step('response', router, req, res, next);
        return;
      }

      //if there is rest
      if (res.rest && Object.keys(res.rest.get()).length) {
        //send it back to client
        channel.emit(res.route.event, res.rest.get());
        await helpers.step('response', router, req, res, next);
        return;
      }
    };

    next();
  }

  //merge router methods
  const router = new EventEmitter;
  const methods = helpers.getMethods(router);

  Object.keys(methods).forEach(method => {
    SocketRouter[method] = router[method].bind(router);
  });

  SocketRouter.router = router;

  return SocketRouter;
};

createRouter.EventEmitter = EventEmitter;

//adapter
module.exports = createRouter;
