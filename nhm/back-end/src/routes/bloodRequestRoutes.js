import express from 'express';
import BloodRequestController from '../controllers/bloodReqcontroller.js';


const router = express.Router();

router.get('/',BloodRequestController.getBloodRequest);
router.post('/',BloodRequestController.createBloodRequest);
router.put('/:id',BloodRequestController.updateBloodRequest);
router.delete('/:id',BloodRequestController.deleteBloodRequest);

export default router;