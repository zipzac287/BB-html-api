import express from 'express';
import DonorSesController from '../controllers/donorSesController.js';

const router = express.Router();

router.get('/', DonorSesController.getDonorSessions);
router.get('/:id', DonorSesController.getSessionsByDonorId);
router.post('/', DonorSesController.addDonorSessions);
router.put('/:id', DonorSesController.updateDonorSessions);
router.delete('/:id', DonorSesController.deleteDonorSession);

export default router;
