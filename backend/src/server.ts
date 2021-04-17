import { Notification } from 'abacus'
import bodyParser from 'body-parser'
import cors from 'cors'
import express from "express";
import fileUpload from 'express-fileupload';
import { createServer } from 'http'
import morgan from 'morgan';
import { Server, Socket } from 'socket.io'
import { createAdapter } from 'socket.io-redis'
import { RedisClient } from 'redis'
import { v4 as uuidv4 } from 'uuid'

import api from "./api";

import * as dotenv from 'dotenv'
dotenv.config()

const PORT = process.env.PORT || 80;

const app = express();
const server = createServer(app);
export const io = new Server(server, {
  serveClient: false,
  cors: {
    origin: "*"
  },
  transports: ['websocket']
});

if (process.env.REDIS_HOST) {
  const { REDIS_HOST: host, REDIS_PASS: auth_pass } = process.env

  const pubClient = new RedisClient({ host, port: 6379, auth_pass })
  const subClient = pubClient.duplicate()

  io.adapter(createAdapter({ pubClient, subClient }))
}

app.use(cors()); // Enables CORS on all endpoints
app.use(bodyParser.json()); // Middleware to parse body of requests as JSON
app.use(fileUpload()); // Middleware for uploading files to express (accessible in req.files)
app.use(morgan('dev'));

app.use(api);
app.get('/loaderio-49210dbfd48d683f3536e6af2bc2110c.txt', (_, res) => {
  res.attachment('loaderio-49210dbfd48d683f3536e6af2bc2110c.txt')
  res.type('txt')
  res.send('loaderio-49210dbfd48d683f3536e6af2bc2110c')
});
app.get('/', (_, res) => res.status(200).send(' ')); // Sends 200 OK when AWS EBS pings server for health check


export const sendNotification = ({ header, to, content, type, context }: Notification) =>
  io.sockets.emit('notification', ({ id: uuidv4(), to, header, content, type, context }))

io.on('connection', (socket: Socket) => {
  socket.on('broadcast', ({ ev, args }) => {
    io.sockets.emit(ev, args)
  })
})

server.listen(PORT, () => {
  console.log(`🚀 Server is running at :${PORT}`);
});
