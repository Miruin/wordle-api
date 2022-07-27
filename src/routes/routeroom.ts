import {  Router, Request, Response} from 'express';
import passport from 'passport';

import controllersroom from '../controllers/controllersRoom';

const auth = passport.authenticate("jwt", { session: false });

const optionalAuth = (req: Request, res: Response, next: () => void) => {
  if (req.headers["authorization"]) {
    
    auth(req, res, next);
  } else next();
};

class Rutasroom{
  router: Router;
  constructor() {
    this.router = Router();      
    this.routes();
  }
  routes() {
    this.router.post('/room', optionalAuth, controllersroom.crearRoom)
    this.router.get('/rooms', optionalAuth, controllersroom.listRoom)
    this.router.get('/room/:codigo', optionalAuth, controllersroom.obtenerRoom)
    this.router.delete('/room/:codigo', optionalAuth, controllersroom.borrarRoom)
    this.router.put('/room', optionalAuth, controllersroom.modifyRoom)
  }
}

const rutaroom = new Rutasroom();
export default rutaroom.router;


