"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const controllersRoom_1 = __importDefault(require("../controllers/controllersRoom"));
const auth = passport_1.default.authenticate("jwt", { session: false });
const optionalAuth = (req, res, next) => {
    if (req.headers["authorization"]) {
        auth(req, res, next);
    }
    else
        next();
};
class Rutasroom {
    constructor() {
        this.router = (0, express_1.Router)();
        this.routes();
    }
    routes() {
        this.router.post('/room', optionalAuth, controllersRoom_1.default.crearRoom);
        this.router.get('/rooms', optionalAuth, controllersRoom_1.default.listRoom);
        this.router.get('/room/:codigo', optionalAuth, controllersRoom_1.default.obtenerRoom);
        this.router.delete('/room/:codigo', optionalAuth, controllersRoom_1.default.borrarRoom);
        this.router.put('/room', optionalAuth, controllersRoom_1.default.modifyRoom);
    }
}
const rutaroom = new Rutasroom();
exports.default = rutaroom.router;
