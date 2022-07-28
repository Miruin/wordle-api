import express from 'express'
import cors from 'cors'
import passport from 'passport'
import WebSocket from "ws"
import http from 'http'

import middleware from './middleware/auth'
import config from './config/config';
import rutauser from './routes/routeuser';
import rutaroom from './routes/routeroom'
import { ServerOptions } from 'https'


class Server {
    app: express.Application;
    constructor(){
        this.app = express();
        this.config();
        this.routes();
    }
    config() {
        this.app.set('port', config.port);
        this.app.use(express.urlencoded({ extended: false }));
        this.app.use(express.json());
        this.app.use(cors());
        this.app.use(passport.initialize());
        passport.use(middleware); 
    }
    routes() {
        this.app.use(rutauser);
        this.app.use(rutaroom);
    }
    start() {
        const server = http.createServer(this.app)
        const wss = new WebSocket.Server({ server })
        wss.on("connection", function connection(ws) {
            ws.on("message", function incoming(message, isBinary) {
              console.log(message.toString(), isBinary);
              wss.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                  client.send(message.toString());
                }
              });
            });
          });
        this.app.listen(this.app.get('port'), () => {
            console.log('El servidor esta corriendo en el puerto: ', this.app.get('port'));  
        });
    }
}

const serv = new Server();
serv.start();
