const http = require('http');
const socketio = require('socket.io');

const express = require('express');
const controller = require('./controller');
const app = express();
app.use(controller);


const router = require('../../src');
const events = require('./events');
const socket = router();
socket.use(events);

const server = http.createServer(app);
socketio(server).use(socket);

//listen to server
server.listen(3000);
