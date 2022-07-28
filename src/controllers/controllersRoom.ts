import { Request, Response} from 'express';
import sql from 'mssql';

import config from "../config/config";
import { getcon, getdatosuser } from '../database/connection';


class Controllersroom {
    constructor() {
    }
    async crearRoom (req: Request, res: Response): Promise<any> {
        try {
            let {Timer, Try, Words, Rounds} = req.body;
            let codigo                   
            let pool = await getcon()
            let usuario = await getdatosuser(pool, String(req.user))
            let room
            do {
                codigo = Math.floor(Math.random() * (99999 - 11111 + 1)) + 11111;
                room = await pool.request()
                .input('codigo', sql.Int, codigo)
                .query(String(config.q4));
            } while (room.recordset.length != 0);
            room = await pool.request()
            .input('codigo', sql.Int, codigo)
            .input('iduser', sql.Int, usuario.recordset[0].id_usuario)
            .query(String(config.q5))
            for (let i = 1; i <= Rounds; i++) {
                await pool.request()
                .input('idroom', sql.Int, room.recordset[0].id_room)
                .input('ronda', sql.Int, i)
                .input('palabra', sql.Int, Words)
                .input('intentos', sql.Int, Try)
                .input('tiempo', sql.Int, Timer)
                .query(String(config.q6))
            }
            pool.close()
            return res.status(200).send({msg: 'hecho'})
        } catch (error) {
            console.error(error);
            return res.status(500).send({msg: 'error en el servidor al crear el room'})
        }
    }
    async listRoom(req: Request, res: Response): Promise<any> {
        try {
            let pool = await getcon();
            let usuario = await getdatosuser(pool, String(req.user))
            type rooms = {
                codigoroom: number,
                autor: string
            }
            const datosRoom: rooms[] = []
            let room = await pool.request()
            .input('iduser', sql.Int, usuario.recordset[0].id_usuario)
            .query(String(config.q7));
            for (const key in room.recordset) {
                
                const datoRoom: rooms = {
                    codigoroom: room.recordset[key].codigo_room,
                    autor: usuario.recordset[0].nick_usuario
                }
                datosRoom.push(datoRoom)
            }
            return res.status(200).send({datosRoom})
        } catch (error) {
            console.error(error);
            return res.status(500).send({msg: 'error en el servidor al listar los room'});
        }
    }
    async borrarRoom(req: Request, res: Response): Promise<any>{
        try {
            let codigo = req.params.codigo
            let pool = await getcon();
            let usuario = await getdatosuser(pool, String(req.user))
            let room = await pool.request()
            .input('codigo', sql.Int, codigo)
            .input('iduser', sql.Int, usuario.recordset[0].id_usuario)
            .query(String(config.q9))
            if (room.recordset.length == 0) 
                return res.status(400).send({msg: 'La sala no existe o no es el autor de la sala'})
            await pool.request()
            .input('codigo', sql.Int, codigo)
            .query(String(config.q9_1))
            pool.close();
            return res.status(200).send({msg: 'se ha borrado la sala'})
        } catch (error) {
            console.error(error);
            return res.status(500).send({msg: 'error en el servidor al borrar room'});
        }
    }
    async modifyRoom(req: Request, res: Response): Promise<any>{
        try {
            let {Code, Try, Timer, Words, Rounds} = req.body
            let pool = await getcon();
            let usuario = await getdatosuser(pool, String(req.user))
            let room = await pool.request()
            .input('codigo', sql.Int, Code)
            .input('iduser', sql.Int, usuario.recordset[0].id_usuario)
            .query(String(config.q9))
            if (room.recordset.length == 0) 
                return res.status(400).send({msg: 'La sala no existe o no es el autor de la sala'});
            await pool.request()
            .input('idroom', sql.Int, room.recordset[0].id_room)
            .query(String(config.q10_1));
            for (let i = 1; i <= Rounds; i++) {
                await pool.request()
                .input('idroom', sql.Int, room.recordset[0].id_room)
                .input('ronda', sql.Int, i)
                .input('palabra', sql.Int, Words)
                .input('intentos', sql.Int, Try)
                .input('tiempo', sql.Int, Timer)
                .query(String(config.q10));
            }
            pool.close()
            return res.status(200).send({msg: 'hecho'})
        } catch (error) {
            console.error(error);
            return res.status(500).send({msg: 'error en el servidor al modificar room'});
        }
    }
    async obtenerRoom(req:Request, res:Response): Promise<any>{
        try {
            let codigo = req.params.codigo
            let pool = await getcon()
            let room = await pool.request()
            .input('codigo', sql.Int, codigo)
            .query(String(config.q11));
            if (room.recordset.length != 0) {
                const reglas = {
                    rounds: room.recordset.length,
                    trys: room.recordset[0].intentos,
                    wordLength: room.recordset[0].palabra,
                    timer: room.recordset[0].tiempo_ronda
                }
                pool.close();
                return res.status(200).send({Reglas: reglas})
            } else {
                pool.close()
                return res.status(400).send({msg: 'error no se encuentras las reglas del room'})
            } 
        } catch (error) {
            console.error(error);
            return res.status(500).send({msg: 'error en el servidor al obtener room'});
        }
    }
}

const controllersroom = new Controllersroom();
export default controllersroom;