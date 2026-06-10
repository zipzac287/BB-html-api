import express from 'express';
import TuiMauRoutes from './TuiMauRoutes.js';
import bloodRequestRoutes from './bloodRequestRoutes.js';
import capMauRoutes from './capMauRoutes.js';
import xetNghiemRoutes from './xetNghiemRoutes.js';
import DonorRoutes from './DonorRoutes.js';

const rootRouter = express.Router();

rootRouter.use("/TuiMau",TuiMauRoutes);
rootRouter.use('/Donor',DonorRoutes);
rootRouter.use('/xetNghiem',xetNghiemRoutes);
rootRouter.use('/capMau',capMauRoutes);
rootRouter.use('/bloodRequest',bloodRequestRoutes);

export default rootRouter;