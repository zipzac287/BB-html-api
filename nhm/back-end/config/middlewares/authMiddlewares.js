import jwt from 'jsonwebtoken';
import { Users } from '../../services/users.js';

export const protectedRoute = (req,res,next) => {
    try {
        // lấy accesstoken client gửi từ header
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        console.log(token);
        if (!token) {
            return res.status(401).json({message:"không tìm thấy token"});
        }
        // xác nhận token hợp lệ
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decodedUsers) => {
            if (err) {
                console.error(err);

                return res.status(401).json({success: false,message: "Accesstoken hết hạn hoặc không hợp lệ"});
            }
        console.log(decodedUsers.userId);
        const user = await Users.findById(decodedUsers.userId);
            // tìm user
            if (!user) {
                return res.status(404).json({success:false, message:"user không tồn tại"});
            }
            // trả user về req
            req.user = user;
            next();
        });
                  
    } catch (error) {
        console.error(`Lỗi khi xác minh jwt trong authmiddleware`, error);
        res.status(500).json({message: "Lỗi hệ thống"});
    }
}