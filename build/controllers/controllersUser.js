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
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const twilio_1 = require("twilio");
const config_1 = __importDefault(require("../config/config"));
const connection_1 = require("../database/connection");
function creartoken(id) {
    if (!config_1.default.secrettoken)
        return "ERROR en token";
    return "Bearer " + jsonwebtoken_1.default.sign(id, config_1.default.secrettoken);
}
function changePassword(op, np, req, pool) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield pool.request()
            .input('username', req.user)
            .query(String(config_1.default.q2_1));
        if (result.recordset[0]) {
            const pwv = yield bcrypt_1.default.compare(op, result.recordset[0].pw_usuario);
            if (pwv) {
                let rondas = 10;
                let pwh = yield bcrypt_1.default.hash(np, rondas);
                yield pool.request()
                    .input('nick', mssql_1.default.VarChar, req.user)
                    .input('pw', mssql_1.default.VarChar, pwh)
                    .query(String(config_1.default.q3));
                return 'se ha cambiado la password';
            }
            else {
                return 'no se ha podido cambiar la password';
            }
        }
        else {
            return 'no existe usuario';
        }
    });
}
class Controllersuser {
    constructor() {
    }
    reguser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const pool = yield (0, connection_1.getcon)();
                let { Username, Password, Telefono } = req.body;
                if (!Username || !Password || !Telefono) {
                    return res.status(400).json({ msg: 'No se han llenado los valores correctamente' });
                }
                else {
                    const result = yield (0, connection_1.getdatosuser)(pool, Username);
                    if (result.recordset[0]) {
                        pool.close();
                        return res.status(400).send({ msg: 'Ya se esta usando este usuario' });
                    }
                    else {
                        let rondas = 10;
                        let pwh = yield bcrypt_1.default.hash(Password, rondas);
                        yield pool.request()
                            .input('nick', mssql_1.default.VarChar, Username)
                            .input('pw', mssql_1.default.VarChar, pwh)
                            .input('tlf', mssql_1.default.VarChar, Telefono)
                            .query(String(config_1.default.q1));
                        pool.close();
                        return res.status(200).send({ msg: 'Se ha registrado satisfactoriamente', token: creartoken(Username) });
                    }
                }
            }
            catch (e) {
                console.error(e);
                return res.status(500).send({ msg: 'Error en el servidor' });
            }
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { Username, Password } = req.body;
                if (!Username || !Password) {
                    return res.status(400).send({ msg: 'No se han llenado los valores correctamente' });
                }
                else {
                    const pool = yield (0, connection_1.getcon)();
                    const result = yield pool.request()
                        .input('username', Username)
                        .query(String(config_1.default.q2_1));
                    if (result.recordset[0]) {
                        const pwv = yield bcrypt_1.default.compare(Password, result.recordset[0].pw_usuario);
                        if (pwv) {
                            pool.close();
                            return res.status(200).send({ token: creartoken(Username), msg: 'Se ha iniciado secion satisfactoriamente' });
                        }
                        else {
                            pool.close();
                            return res.status(400).send({ msg: 'La contrasena no coincide' });
                        }
                    }
                    else {
                        pool.close();
                        return res.status(400).send({ msg: 'No se ha encontrado el usuario' });
                    }
                }
            }
            catch (error) {
                console.error(error);
                return res.status(500).send({ msg: 'Error en el servidor' });
            }
        });
    }
    moduser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { Username, Telefono, oldPassword, newPassword } = req.body;
                const pool = yield (0, connection_1.getcon)();
                const result = yield (0, connection_1.getdatosuser)(pool, String(req.user));
                let { tlf_usuario, nick_usuario } = result.recordset[0];
                if ((Username == nick_usuario || Username == '') &&
                    (Telefono == tlf_usuario || Telefono == '') &&
                    ((oldPassword == null || oldPassword == '') ||
                        (newPassword == null || newPassword == ''))) {
                    pool.close();
                    return res.status(400).send({ msg: 'No se ha cambiado ningun valor...' });
                }
                let fTlf = null;
                if (Telefono != null && Telefono != tlf_usuario && Telefono != '') {
                    yield pool.request()
                        .input('tlf', mssql_1.default.VarChar, Telefono)
                        .input('nickname', req.user)
                        .query(String(config_1.default.q3_2));
                    fTlf = 1;
                }
                let fUser = null;
                let token = '';
                if (Username != null && Username != nick_usuario && Username != '') {
                    const r1 = yield (0, connection_1.getdatosuser)(pool, String(Username));
                    if (r1.recordset[0]) {
                        fUser = 0;
                    }
                    else {
                        yield pool.request()
                            .input('nick', mssql_1.default.VarChar, Username)
                            .input('nickname', req.user)
                            .query(String(config_1.default.q3_3));
                        token = creartoken(Username);
                        fUser = 1;
                    }
                }
                let fCp = null;
                if (oldPassword != null &&
                    oldPassword != '' &&
                    newPassword != null &&
                    newPassword != '') {
                    let r = yield changePassword(oldPassword, newPassword, req, pool);
                    fCp = 1;
                }
                return res.status(200).send({
                    estadoTlf: fTlf,
                    estadoUsername: fUser,
                    estadoPassword: fCp,
                    newToken: token
                });
            }
            catch (error) {
                console.error(error);
                return res.status(500).send({ msg: 'Error en el servidor' });
            }
        });
    }
    getuser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let username = req.params.username;
            try {
                if (username == '0' && req.user)
                    username = String(req.user);
                const pool = yield (0, connection_1.getcon)();
                const result = yield (0, connection_1.getdatosuser)(pool, username);
                let { nick_usuario, followers_usuario, name_usuario, lastname_usuario } = result.recordset[0];
                const Usuario = {
                    username: nick_usuario,
                    nombre: name_usuario,
                    apellido: lastname_usuario,
                    followers: followers_usuario
                };
                pool.close();
                return res.status(200).send({ usuario: Usuario });
            }
            catch (error) {
                console.error(error);
                return res.status(500).send({ msg: 'Error en el servidor' });
            }
        });
    }
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const pool = yield (0, connection_1.getcon)();
                const result = yield (0, connection_1.getdatosuser)(pool, String(req.user));
                if (result.recordset[0]) {
                    pool.close();
                    return res.status(200).send({ msg: 'Tienes permiso para deslogearte' });
                }
                else {
                    pool.close();
                    return res.status(500).send({ msg: 'No se encuentra este usuario en la DB' });
                }
            }
            catch (error) {
                console.error(error);
                return res.status(500).send({ msg: 'Error en el servidor' });
            }
        });
    }
    verify(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { Telefono } = req.body;
                let expresion = /^\+\d{1,3}\d{2,4}\d{6,7}$/;
                let r = expresion.test(Telefono);
                if (!r) {
                    return res.status(400).send({ msg: 'ERROR no se puede registrar con un telefono que ya ha sido registrado o los datos no son validos' });
                }
                let code = Math.floor(Math.random() * (999999 - 111111 + 1)) + 111111;
                if (config_1.default.accountSid && config_1.default.authToken) {
                    const client = new twilio_1.Twilio(config_1.default.accountSid, config_1.default.authToken);
                    client.messages.create({
                        from: config_1.default.myNumber,
                        to: Telefono,
                        body: 'Tu coidgo de verificacion es ' + code
                    })
                        .then((msg) => console.log(msg.sid));
                }
                let rondas = 10;
                let codeh = yield bcrypt_1.default.hash(String(code), rondas);
                return res.status(200).send({ msg: 'porfavor ingresar codigo de verificacion', codigo: codeh });
            }
            catch (error) {
                console.error(error);
                return res.status(500).send({ msg: 'Error en el servidor' });
            }
        });
    }
    deleteuser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (req.user) {
                    let pool = yield (0, connection_1.getcon)();
                    let result = yield (0, connection_1.getdatosuser)(pool, String(req.user));
                    if (result.recordset[0]) {
                        yield pool.request()
                            .input('user', mssql_1.default.VarChar, req.user)
                            .query(String(config_1.default.q1_1));
                    }
                    else {
                        return res.status(400).send({ msg: 'no se encuentra este usuario' });
                    }
                    return res.status(200).send({ msg: 'el usuario ha sido eliminado' });
                }
                else {
                    return res.status(400).send({ msg: 'no tienes permitido borrar el usuario' });
                }
            }
            catch (error) {
            }
        });
    }
}
const controllersuser = new Controllersuser();
exports.default = controllersuser;
