"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const passport_1 = __importDefault(require("passport"));
const ws_1 = __importStar(require("ws"));
const http_1 = __importDefault(require("http"));
const auth_1 = __importDefault(require("./middleware/auth"));
const config_1 = __importDefault(require("./config/config"));
const routeuser_1 = __importDefault(require("./routes/routeuser"));
const routeroom_1 = __importDefault(require("./routes/routeroom"));
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        this.config();
        this.routes();
    }
    config() {
        this.app.set('port', config_1.default.port1);
        this.app.use(express_1.default.urlencoded({ extended: false }));
        this.app.use(express_1.default.json());
        this.app.use((0, cors_1.default)());
        this.app.use(passport_1.default.initialize());
        passport_1.default.use(auth_1.default);
    }
    routes() {
        this.app.use(routeuser_1.default);
        this.app.use(routeroom_1.default);
    }
    start() {
        const server = http_1.default.createServer(this.app);
        const wss = new ws_1.default.Server({ server });
        const server2 = new ws_1.WebSocketServer({ port: Number(config_1.default.port) });
        const clients = new Set();
        server2.on("connection", (socket) => {
            clients.add(socket);
            clients.forEach((value) => {
                console.log(value);
            });
            socket.on("message", (data) => {
                const packet = JSON.parse(String(data));
                switch (packet.type) {
                    case "conectado":
                        console.log(packet.user + ' se ha conectado');
                        socket.send(JSON.stringify({
                            type: 'conectado',
                            msg: 'te has conectando'
                        }));
                        break;
                }
            });
        });
        wss.on("connection", (ws) => {
            clients.add(ws);
            ws.on('message', (data) => {
                const packet = JSON.parse(data.toString());
                switch (packet.type) {
                    case "conectado":
                        console.log(packet.user + ' se ha conectado');
                        clients.forEach((value) => {
                            console.log(value);
                        });
                        ws.send(JSON.stringify({
                            type: 'conectado',
                            msg: 'te has conectando'
                        }));
                        break;
                    case "puntos":
                        console.log(packet.user + ' ha obtenido ' + packet.puntos);
                        break;
                }
            });
        });
        this.app.listen(this.app.get('port'), () => {
            console.log('El servidor esta corriendo en el puerto: ', this.app.get('port'));
        });
    }
}
const serv = new Server();
serv.start();
