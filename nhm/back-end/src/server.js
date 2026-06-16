import express from 'express';
import rootRouter from './routes/indexRoutes.js';
import dotenv from 'dotenv';
dotenv.config();

import { run } from '../config/inventory.js';
import authRoutes from './routes/authRoutes.js';



const app = express();
// middleware

app.use(express.json());

// public routes
app.use('/api/auth',authRoutes);
// privite routes


app.use("/api",rootRouter);
async function startSever() {
    try {
        await run();
        app.listen(5001, () => {
            console.log('server bắt đầu trên cổng 5001');
});
    } catch (error) {
        console.error("❌ Không thể khởi động server do lỗi DB:", error);
        process.exit(1);
    }
};
startSever();
