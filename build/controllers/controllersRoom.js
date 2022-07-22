"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mssql_1 = __importDefault(require("mssql"));
const config_1 = __importDefault(require("../config/config"));
const connection_1 = require("../database/connection");
class Controllersroom {
    constructor() {
    }
    crearRoom(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { Timer, Try, Words, Rounds } = req.body;
                let codigo;
                let pool = yield (0, connection_1.getcon)();
                let usuario = yield (0, connection_1.getdatosuser)(pool, String(req.user));
                let room;
                do {
                    codigo = Math.floor(Math.random() * (99999 - 11111 + 1)) + 11111;
                    room = yield pool.request()
                        .input('codigo', mssql_1.default.Int, codigo)
                        .query(String(config_1.default.q4));
                } while (room.recordset.length != 0);
                room = yield pool.request()
                    .input('codigo', mssql_1.default.Int, codigo)
                    .input('iduser', mssql_1.default.Int, usuario.recordset[0].id_usuario)
                    .query(String(config_1.default.q5));
                for (let i = 1; i <= Rounds; i++) {
                    yield pool.request()
                        .input('idroom', mssql_1.default.Int, room.recordset[0].id_room)
                        .input('ronda', mssql_1.default.Int, i)
                        .input('palabra', mssql_1.default.Int, Words)
                        .input('intentos', mssql_1.default.Int, Try)
                        .input('tiempo', mssql_1.default.Int, Timer)
                        .query(String(config_1.default.q6));
                }
                pool.close();
                return res.status(200).send({ msg: 'hecho' });
            }
            catch (error) {
                console.error(error);
                return res.status(500).send({ msg: 'error en el servidor al crear el room' });
            }
        });
    }
    listRoom(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let pool = yield (0, connection_1.getcon)();
                let usuario = yield (0, connection_1.getdatosuser)(pool, String(req.user));
                const datosRoom = [];
                let room = yield pool.request()
                    .input('iduser', mssql_1.default.Int, usuario.recordset[0].id_usuario)
                    .query(String(config_1.default.q7));
                for (const key in room.recordset) {
                    const datoRoom = {
                        codigoroom: room.recordset[key].codigo_room,
                        autor: usuario.recordset[0].nick_usuario
                    };
                    datosRoom.push(datoRoom);
                }
                return res.status(200).send({ datosRoom });
            }
            catch (error) {
                console.error(error);
                return res.status(500).send({ msg: 'error en el servidor al listar los room' });
            }
        });
    }
    borrarRoom(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let codigo = req.params.codigo;
                let pool = yield (0, connection_1.getcon)();
                let usuario = yield (0, connection_1.getdatosuser)(pool, String(req.user));
                let room = yield pool.request()
                    .input('codigo', mssql_1.default.Int, codigo)
                    .input('iduser', mssql_1.default.Int, usuario.recordset[0].id_usuario)
                    .query(String(config_1.default.q9));
                if (room.recordset.length == 0)
                    return res.status(400).send({ msg: 'La sala no existe o no es el autor de la sala' });
                yield pool.request()
                    .input('codigo', mssql_1.default.Int, codigo)
                    .query(String(config_1.default.q9_1));
                pool.close();
                return res.status(200).send({ msg: 'se ha borrado la sala' });
            }
            catch (error) {
                console.error(error);
                return res.status(500).send({ msg: 'error en el servidor al borrar room' });
            }
        });
    }
    modifyRoom(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { Code, Try, Timer, Words, Rounds } = req.body;
                let pool = yield (0, connection_1.getcon)();
                let usuario = yield (0, connection_1.getdatosuser)(pool, String(req.user));
                let room = yield pool.request()
                    .input('codigo', mssql_1.default.Int, Code)
                    .input('iduser', mssql_1.default.Int, usuario.recordset[0].id_usuario)
                    .query(String(config_1.default.q9));
                if (room.recordset.length == 0)
                    return res.status(400).send({ msg: 'La sala no existe o no es el autor de la sala' });
                for (let i = 1; i <= Rounds; i++) {
                    yield pool.request()
                        .input('idroom', mssql_1.default.Int, room.recordset[0].id_room)
                        .input('ronda', mssql_1.default.Int, i)
                        .input('palabra', mssql_1.default.Int, Words)
                        .input('intentos', mssql_1.default.Int, Try)
                        .input('tiempo', mssql_1.default.Int, Timer)
                        .query(String(config_1.default.q10));
                }
                pool.close();
                return res.status(200).send({ msg: 'hecho' });
            }
            catch (error) {
                console.error(error);
                return res.status(500).send({ msg: 'error en el servidor al modificar room' });
            }
        });
    }
}
const controllersroom = new Controllersroom();
exports.default = controllersroom;
