import express from 'express';
import rootRouter from './routes/indexRoutes.js';
import dotenv from 'dotenv';
dotenv.config();

import { run } from '../config/inventory.js';
import authRoutes from './routes/authRoutes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { protectedRoute } from '../config/middlewares/authMiddlewares.js';
import userRoute from './routes/userRoutes.js';


const app = express();
// cấu hình cors cho phép gọi api giữa 2 server fe và be.
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// middleware
app.use(express.json());
app.use(cookieParser());
// public routes
app.use('/api/auth',authRoutes);
// privite routes

app.use(protectedRoute);
app.use('/api/users', userRoute);

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
