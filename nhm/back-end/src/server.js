import express from 'express';
import rootRouter from './routes/indexRoutes.js';
import dotenv from 'dotenv';
dotenv.config();

import { run } from '../config/inventory.js';




const app = express();

app.use(express.json());

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
