import express from 'express'
import cors from 'cors'
import passport from 'passport'
import WebSocket from "ws"
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
        const server = http.createServer(this.app)
        const wss = new WebSocket.Server({ server })
        const clients = new Set();
        wss.on("connection", (ws) => {
            clients.add(ws)
            ws.on('message', (data) => {
                const packet = JSON.parse(data.toString());
                switch (packet.type) {
                    case "conectado":
                        console.log(packet.user+' se ha conectado');
                        clients.forEach((value) => {
                            console.log(value)
                        })
                        ws.send(JSON.stringify({
                            type: 'conectado',
                            msg: 'te has conectando'
                        }))
                    break
                    case"puntos":
                        console.log(packet.user+' ha obtenido '+packet.puntos);
                    break
                }
            })
        });
        this.app.listen(this.app.get('port'), () => {
            console.log('El servidor esta corriendo en el puerto: ', this.app.get('port'));  
        });
    }
}

const serv = new Server();
serv.start();
