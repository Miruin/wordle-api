"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const passport_1 = __importDefault(require("passport"));
const ws_1 = __importDefault(require("ws"));
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
        this.app.set('port', config_1.default.port);
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
        const clients = new Set();
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
