import { Request, Response} from 'express';
import sql from 'mssql';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Twilio } from 'twilio'

import config from "../config/config";
import { getcon, getdatosuser } from '../database/connection';

function creartoken(id: any) {
    if (!config.secrettoken) return "ERROR en token" 
    return "Bearer "+jwt.sign(id, config.secrettoken);
}

async function changePassword(op: string, np: string, req: Request, pool: sql.ConnectionPool) {
    const result = await pool.request()
    .input('username', req.user)
    .query(String(config.q2_1)); 
    if (result.recordset[0]) {
        const pwv = await bcrypt.compare(op, result.recordset[0].pw_usuario);
        if (pwv) {        
            let rondas = 10;
            let pwh = await bcrypt.hash(np, rondas);
            await pool.request()
            .input('nick', sql.VarChar, req.user)
            .input('pw', sql.VarChar, pwh)
            .query(String(config.q3));
            return 'se ha cambiado la password';            
        } else {
            return 'no se ha podido cambiar la password';
        }
    } else {
        return 'no existe usuario'
    } 

}

class Controllersuser {
    constructor() {
    }

    async reguser (req: Request, res: Response): Promise<any>{
        try {
            const pool = await getcon();
            let { Username, Password, Telefono } = req.body;    
            if(!Username || !Password || !Telefono) {
                return res.status(400).json({ msg : 'No se han llenado los valores correctamente'});
            } else {
                const result = await getdatosuser(pool, Username);
                if (result.recordset[0]) {       
                    pool.close();
                    return res.status(400).send({msg: 'Ya se esta usando este usuario'});
                } else {
                    let rondas = 10;
                    let pwh = await bcrypt.hash(Password, rondas);
                    await pool.request()
                    .input('nick', sql.VarChar, Username)
                    .input('pw', sql.VarChar, pwh)
                    .input('tlf', sql.VarChar, Telefono)
                    .query(String(config.q1));
                    pool.close();
                    return res.status(200).send({msg: 'Se ha registrado satisfactoriamente', token: creartoken(Username) });
                }
            }
        } catch(e) {
            console.error(e);
            return res.status(500).send({msg: 'Error en el servidor'});
        }
    }
    
    
    async login(req: Request, res: Response): Promise<any> {
        try {
            let { Username, Password} = req.body;
            if (!Username || !Password) {
                return res.status(400).send({ msg : 'No se han llenado los valores correctamente'});   
            } else {
                const pool = await getcon();
                const result = await pool.request()
                .input('username', Username)
                .query(String(config.q2_1));
                if (result.recordset[0]) {
                    const pwv = await bcrypt.compare(Password, result.recordset[0].pw_usuario);
                    if (pwv) {   
                        pool.close();
                        return res.status(200).send({token: creartoken(Username), msg: 'Se ha iniciado secion satisfactoriamente'});  
                    } else {
                        pool.close();
                        return res.status(400).send({msg: 'La contrasena no coincide'});
                    }
                } else {
                    pool.close();
                    return res.status(400).send({msg: 'No se ha encontrado el usuario'})
                } 
            }
        } catch (error) {     
            console.error(error);
            return res.status(500).send({msg: 'Error en el servidor'});
        }
    }

    async moduser(req: Request, res: Response): Promise<any> {
        try {
            let { Username, Telefono, oldPassword, newPassword} = req.body;
            const pool = await getcon();
            const result = await getdatosuser(pool, String(req.user));
            let {tlf_usuario, nick_usuario} = result.recordset[0]
            if ((Username == nick_usuario || Username =='') &&
                (Telefono == tlf_usuario || Telefono == '') &&
                ((oldPassword == null || oldPassword =='') ||
                (newPassword == null || newPassword == ''))) {
                pool.close();
                return res.status(400).send({msg: 'No se ha cambiado ningun valor...'}) ;
            }
            let fTlf = null;
            if(Telefono != null && Telefono != tlf_usuario && Telefono!= ''){
                await pool.request()
                .input('tlf', sql.VarChar, Telefono)
                .input('nickname', req.user)
                .query(String(config.q3_2));
                fTlf = 1;
            }
            let fUser = null;
            let token = ''; 
            if(Username != null && Username != nick_usuario && Username != ''){ 
                const r1 = await getdatosuser(pool, String(Username));
                if (r1.recordset[0]) {
                    fUser = 0;                  
                } else {
                    await pool.request()
                    .input('nick', sql.VarChar, Username)
                    .input('nickname', req.user)
                    .query(String(config.q3_3));
                    token = creartoken(Username);
                    fUser = 1; 
                }    
            }
            let fCp = null
            if(oldPassword != null &&
                oldPassword != '' &&
                newPassword != null &&
                newPassword != ''){
                let r = await changePassword(oldPassword, newPassword, req, pool);
                fCp = 1;
            }
            return res.status(200).send({
                estadoTlf: fTlf,
                estadoUsername: fUser,
                estadoPassword: fCp, 
                newToken: token
            })  
        } catch (error) {
            console.error(error);
            return res.status(500).send({msg: 'Error en el servidor'});   
        }
    }

    async getuser(req: Request, res: Response): Promise<any> {
        let username = req.params.username
        try {
            if(username == '0' && req.user) username = String(req.user)
            const pool = await getcon();
            const result = await getdatosuser(pool, username);
            let {nick_usuario, followers_usuario, name_usuario, lastname_usuario} = result.recordset[0];
            const Usuario = {
                username: nick_usuario,
                nombre: name_usuario,
                apellido: lastname_usuario,
                followers: followers_usuario
            }
            pool.close();
            return res.status(200).send({usuario: Usuario});
        } catch (error) {
            console.error(error);
            return res.status(500).send({msg: 'Error en el servidor'});  
        }
    }
    
    async logout(req: Request, res: Response): Promise<any> {
        try {
            const pool = await getcon();
            const result = await getdatosuser(pool, String(req.user));
            if (result.recordset[0]) {
                pool.close();
                return res.status(200).send({msg: 'Tienes permiso para deslogearte'});
            } else {
                pool.close();
                return res.status(500).send({msg: 'No se encuentra este usuario en la DB'});
            }
        } catch (error) {
            console.error(error);
            return res.status(500).send({msg: 'Error en el servidor'});
        }
    } 

    async verify(req: Request, res: Response): Promise <any> {
        try {
            let { Telefono } = req.body
            let expresion = /^\+\d{1,3}\d{2,3}\d{6,7}$/
            let r = expresion.test(Telefono)
            console.log(r)
            const pool = await getcon()
            const existTlf = await pool.request()
            .input('tlf', sql.VarChar, Telefono)
            .query(String(config.q2_2))
            if (!r || existTlf.recordset.length != 0){
                return res.status(400).send({msg: 'ERROR no se puede registrar con un telefono que ya ha sido registrado o los datos no son validos'})
            }
            let code = Math.floor(Math.random() * (999999 - 111111 + 1)) + 111111;
            if (config.accountSid && config.authToken) {
                const client = new Twilio(config.accountSid, config.authToken)
                client.messages.create({
                    from: config.myNumber,
                    to: Telefono,
                    body: 'Tu coidgo de verificacion es '+code
                })
                .then((msg) => console.log(msg.sid));
            }
            let rondas = 10;
            let codeh = await bcrypt.hash(String(code), rondas);
            return res.status(200).send({msg:'porfavor ingresar codigo de verificacion', codigo: codeh})
        } catch (error) {
            console.error(error);
            return res.status(500).send({msg: 'Error en el servidor'});
        }
    }

    async deleteuser(req: Request, res: Response): Promise<any> {
        try {
            if(req.user){
                let pool = await getcon();
                let result = await getdatosuser(pool, String(req.user)) 
                if(result.recordset[0]){
                    await pool.request()
                    .input('user', sql.VarChar, req.user)
                    .query(String(config.q1_1))
                } else {
                    return res.status(400).send({msg: 'no se encuentra este usuario'})
                }
                return res.status(200).send({msg: 'el usuario ha sido eliminado'})             
            } else {
                return res.status(400).send({msg: 'no tienes permitido borrar el usuario'})
            }
        } catch (error) {
            
        }
    }
}

const controllersuser = new Controllersuser();
export default controllersuser;