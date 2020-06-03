import express, { request, response } from 'express';
import ItemsController from './controllers/ItemsController';
import PointsController from './controllers/PointsController';

const routes = express.Router();
const pointsController = new PointsController();
const itemsController = new ItemsController();

routes.get('/items', itemsController.listar);

routes.post('/points', pointsController.create);

export default routes;