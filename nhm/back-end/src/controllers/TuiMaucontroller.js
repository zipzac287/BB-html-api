import mongoose from "mongoose";
import { TuiMau } from '../../services/services.js';
import { request } from "express";

export const getTuiMauServices =  async (request,response) => {
    try { 
        const {matm,com_type,blood_type,rhd,thetich,ngayhien,hsd,tinhtrang,location} = request.query;

        const queryFilter = { ...request.query };

        Object.keys(queryFilter).forEach(key => {
            if (queryFilter[key] === undefined || queryFilter[key] === '') {
                delete queryFilter[key];
            }
        });
        
        const danhSach = (await TuiMau.find(queryFilter).populate('nhm_id'));

        response.status(200).json({
            success:true,
            count: danhSach.length,
            data: danhSach
        });

    } catch (error) {
        console.error("Lỗi khi gọi getTuiMauServices:", error);
        response.status(500).json({message: "Lỗi hệ thống"});
    }
};

export const createTuiMauServices = async (request,response) => {
    try {
        const dataInput = request.body;
        const checkTuiMau = (await TuiMau.findOne({matm: dataInput.matm}));
        if (checkTuiMau) {
            return response.status(400).json({
                success: false,
                message: `Mã túi máu ${dataInput.matm} đã tồn tại`
            });
        } 
        const newTuiMau = new TuiMau(dataInput);
        const savedTuiMau = await newTuiMau.save();

        response.status(200).json({
            success: true,
            message: `Mã túi máu ${dataInput.matm} đã lưu thành công`,
            data: savedTuiMau
        });
    } catch (error) {
        console.error('Lỗi khi nhập túi máu:', error),
        response.status(500).json({message: "Lỗi hệ thống"});
    }
};

export const updateTuiMauServices = async (request,response) => {
    try {
        const { matm } = request.params;
        const updateData = request.body;

        const updateTuiMau = (await TuiMau.findOneAndUpdate(
            { matm: matm},
            updateData,
            {returnDocument: "after", runValidators: true}
        ));

        if (!updateTuiMau) {
            return response.status(404).json({
                success: false,
                message: `Không tìm thấy túi máu ${matm}.`
            });
        }
        response.status(200).json({
            success: true,
            message: "Đã cập nhật túi máu thành công",
            data: updateTuiMau
        });
    } catch (error) {
        response.status(500).json({
            success: false,
            message: "Lỗi hệ thống.",
            error: error.message
        });
    }
};
export const deleteTuiMauServices = async (request,response) => {
    try {
        const { matm } = request.params;

        const deleteTuiMau = (await TuiMau.findOneAndDelete({ matm: matm }));

        if (!deleteTuiMau) {
            return response.status(404).json({
                success: false,
                message: `Không tìm thấy túi máu ${matm}.`
            });
        }
        response.status(200).json({
            success: true,
            message: "Đã xóa túi máu thành công",
            data: deleteTuiMau
        });
    } catch (error) {
        response.status(500).json({
            success: false,
            message: "Lỗi hệ thống.",
            error: error.message
        });
    }
};
