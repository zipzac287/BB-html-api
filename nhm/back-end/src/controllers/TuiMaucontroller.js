import mongoose from "mongoose";
import { DonorSessions, TuiMau } from '../../services/services.js';
import { request } from "express";

const MTP_prefix = {
    'KHC' : 'R',
    'HTTDL' : 'FP',
    'TCPOOL' : 'P',
    'TL' : 'CRY'
};

export const getTuiMauServices =  async (request,response) => {
    try { 
        const {matm,com_type,blood_type,rhd,thetich,ngayhien,hsd,tinhtrang,location,dsession_id,parent_id,split_level} = request.query;

        const queryFilter = { ...request.query };

        Object.keys(queryFilter).forEach(key => {
            if (queryFilter[key] === undefined || queryFilter[key] === '') {
                delete queryFilter[key];
            }
        });

        const danhSach = (await TuiMau.find(queryFilter).populate('dsession_id'));

        response.status(200).json({
            success:true,
            count: danhSach.length,
            data: danhSach
        });

    } catch (error) {
        console.error("Lỗi khi gọi getTuiMauServices:", error);
        response.status(500).json({message: error});
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
        if (!dataInput.dsession_id || dataInput.dsession_id.trim() === '') {
            delete dataInput.dsession_id;
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
        response.status(500).json({message: error});
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
export const updatedTuiMau = async (req,res) => {
    try {
        const { matm, _id } = req.body;
        if (!matm || !_id) {
            return res.status(400).json({
            success: false,
            message: "Thiếu thông tin mã túi máu (mstui) hoặc id phiên hiến (_id)",
            });
        }
        const updatetm = await TuiMau.findOneAndUpdate({matm: matm},{dsession_id: _id},{new: true});
     
        if (!updatetm) {
            return res.status(404).json({
                    success:false,
                    message:"Không update được dsession_id trong TuiMau"
                });
        }
        const updateses = await DonorSessions.findByIdAndUpdate(_id,{mstui_id: updatetm._id}, {new: true});
        if (!updateses) {
            return res.status(404).json({
                    success:false,
                    message:"Không update được mstui_id trong DonorSession"
                });
        }
        return res.status(200).json({
            success:true,
            message:"Update thành công"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi hệ thống.",
            error: error.message
        });
    }
};

export const splitTM = async (req,res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        
        const { tuichaid, tuicon} = req.body;

        const datatuicha = await TuiMau.findById(tuichaid).session(session);
        if (!datatuicha) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message:"Không tìm thấy túi cha"
            });
        }
        if (datatuicha.tinhtrang === "Đã chiết tách") {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message:"Túi cha đã được chiết tách"
            });
        }
        datatuicha.tinhtrang = "Đã chiết tách";
        datatuicha.location = "Đã chiết tách";
        await datatuicha.save({ session });

        const datatuicon = tuicon.map((child) => ({
            matm: child.matm,
            com_type: child.com_type,
            thetich: child.thetich,
            location: child.location,
            hsd: child.hsd,
            ngaychiettach: child.ngaychiettach,

            blood_type: datatuicha.blood_type,
            rhd: datatuicha.rhd,
            ngayhien: datatuicha.ngayhien,
            dsession_id: datatuicha.dsession_id,

            parent_id: datatuicha._id,
            split_level: (datatuicha.split_level || 0) + 1,

            tinhtrang: "Nhập kho thô",
        }));
        const createdtuicon = await TuiMau.insertMany(datatuicon, {session});
        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message:"Chiết tách thành công",
            data: createdtuicon,
        })
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({
            success: false,
            message:"Lỗi hệ thống",
            error: error.message,
        });
    }
}
