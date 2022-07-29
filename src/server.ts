import express from 'express'
import cors from 'cors'
import passport from 'passport'
import WebSocket, {WebSocketServer} from "ws"
import http from 'http'

import middleware from './middleware/auth'
import config from './config/config';
import rutauser from './routes/routeuser';
import rutaroom from './routes/routeroom'


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
        this.app.listen(this.app.get('port'), () => {
            console.log('El servidor esta corriendo en el puerto: ', this.app.get('port'));  
        });
        const server2 = http.createServer(this.app)
        console.log(server2);
        
        const server = new WebSocketServer({ server: server2});
        const clients = new Set();
        server.on("connection", (socket) => {
            clients.add(socket);
            socket.on("message", (data) => {
                const packet = JSON.parse(String(data));
                switch (packet.type) { 
                    case "conectado":
                        socket.send(JSON.stringify({
                            type: 'conectado',
                            msg: 'te has conectando'
                        }));
                    break;
                    case"puntos":
                        console.log(packet.user+' ha obtenido '+packet.puntos);
                    break
                }
              })
        })
    }
}

const serv = new Server();
serv.start();
