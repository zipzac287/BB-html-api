import express from 'express';
import XetNghiemController from '../controllers/xetNghiemcontroller.js';

const router = express.Router();

router.get('/',XetNghiemController.getXetNghiem);
router.post('/',XetNghiemController.createXetNghiem);
router.put('/:matm',XetNghiemController.updateXetNghiem);
router.delete('/:matm',XetNghiemController.deleteXetNghiem);

export default router;
