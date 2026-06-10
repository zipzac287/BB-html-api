import express from 'express';
import DonorController from '../controllers/Donorcontroller.js';

const router = express.Router();

router.get('/',DonorController.getDonor);
router.post('/',DonorController.createDonor);
router.put('/:donor_id',DonorController.updateDonor);
router.delete('/:donor_id',DonorController.deleteDonor);

export default router;