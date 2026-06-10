import express from 'express';
import CapMauController from '../controllers/capMaucontroller.js';

const router = express.Router();

router.get('/',CapMauController.getCapMau);
router.post('/',CapMauController.createCapMau);
router.put('/:id',CapMauController.updateCapMau);
router.delete('/:id',CapMauController.deleteCapMau);

export default router;
