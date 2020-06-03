import express, { request, response } from 'express';
import ItemsController from './controllers/ItemsController';
import PointsController from './controllers/PointsController';

const pointsController = new PointsController();
const itemsController = new ItemsController();

const routes = express.Router();

routes.get('/items', itemsController.index);

routes.get('/points/:id', pointsController.show);
routes.post('/points', pointsController.create);

export default routes;
