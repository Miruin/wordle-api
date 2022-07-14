import {  Router, Request, Response} from 'express';
import passport from 'passport';

import controllersuser from '../controllers/controllersUser';

const auth = passport.authenticate("jwt", { session: false });

const optionalAuth = (req: Request, res: Response, next: () => void) => {
  if (req.headers["authorization"]) {
    
    auth(req, res, next);
  } else next();
};

class Rutasuser{
  router: Router;
  constructor() {
    this.router = Router();      
    this.routes();
  }
  routes() { 
    this.router.post('/verificacion', controllersuser.verify)
    this.router.post('/registro', controllersuser.reguser);
    this.router.post('/log', controllersuser.login);
    this.router.get('/log', optionalAuth, controllersuser.logout);
    this.router.get('/perfil/:username', optionalAuth, controllersuser.getuser);
    this.router.put('/perfil', optionalAuth, controllersuser.moduser);
    this.router.delete('/perfil', optionalAuth, controllersuser.deleteuser);
  }
}

const rutauser = new Rutasuser();
export default rutauser.router;


