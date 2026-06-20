import mongoose from "mongoose";
import { Users } from "../../services/users.js";
import { Session } from "../../services/Session.js";
import { request } from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const ACCESS_TOKEN_TTL = '30m';
const REFREST_TOKEN_TTL = 14*24*60*60*1000;

const authController = {
    signUp: async (req,res) => {
        try {
            const {username, password} = req.body;
            // kiểm tra nhập đủ chưa
            if(!username || !password){
                return res.status(400).json({success: false,message:"Không thể thiếu username hoặc password"})
            } 
            // kiểm tra có trùng username
            const duplicate = await Users.findOne({username});

            if (duplicate) return res.status(409).json({success:false,message:"Username đã tồn tại"});
            // mã hóa password
            const hashedPassword = await bcrypt.hash(password, 10);
            // tạo user mới
            await Users.create({
            username,
            hashedPassword
            });
            //return
            return res.status(200).json({success:true, message:"Tạo tài khoản thành công"});
        } catch (error) {
            res.status(500).json({success:false,message: error.message});
        }
    },
    signIn: async (req,res) => {
        try {
            const {username, password} = req.body;
            // kiểm tra nhập đủ chưa
            if(!username || !password){
                return res.status(400).json({success: false,message:"Không thể thiếu username hoặc password"})
            }
            // lấy username
            const user = await Users.findOne({username});
            if (!user)
                res.status(401).json({success: false,message:"username hoặc password không chính xác"});
            //kiểm tra password
            const passwordcorrect = await bcrypt.compare(password, user.hashedPassword);

            if (!passwordcorrect) {
                return res.status(401).json({success: false,message:"username hoặc password không chính xác"});
            }
            //nếu khớp, tạo accesstoken

            const accessToken = jwt.sign({userId: user._id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: ACCESS_TOKEN_TTL});

            //tạo refresh token
            const refreshToken = crypto.randomBytes(64).toString('hex');


            //tạo session mới để lưu refreshtoken
            await Session.create({
                userId: user._id,
                refreshToken: refreshToken,
                expiresAt: new Date(Date.now() + REFREST_TOKEN_TTL),
            });
            // trả refresh token về cookies
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                maxAge: REFREST_TOKEN_TTL,
            });
            // trả access token về trong res
            res.status(200).json({success: true, message:`User ${username} đăng nhập thành công`, accessToken});
        } catch (error) {
            res.status(500).json({success:false,message: error.message});
        }
    },
        signOut: async (req,res) => {
            try {
            // lấy refreshtoken từ cookie
            const token = req.cookie?.refreshToken;
            if(token) {
                 // lấy refreshtoken từ trong Db
                await Session.deleteOne({refreshToken: token});
            };          

            // xóa cookie
            res.clearCookie('refreshToken');
            return res.status(204); 
            } catch (error) {
            res.status(500).json({success:false,message: error.message});
            }
        }
    };
    export default authController;