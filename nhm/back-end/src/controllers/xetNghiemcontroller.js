import mongoose from "mongoose";
import { XetNghiem } from "../../services/services.js";
import { request } from "express";

const XetNghiemController = {

    getXetNghiem: async (req, res) => {
        try {
            const queryFilter = { ...req.query };
            Object.keys(queryFilter).forEach(key => {
                if (queryFilter[key] === undefined || queryFilter[key] === '') delete queryFilter[key];
            });

            const danhSach = await XetNghiem.find(queryFilter);
            res.status(200).json({ success: true, data: danhSach });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    createXetNghiem: async (req, res) => {
        try {
            const { matm, ketluan } = req.body;
            const checkExist = await XetNghiem.findOne({ matm });
            if (checkExist) {
                return res.status(400).json({ success: false, message: `Túi máu ${matm} đã có hồ sơ xét nghiệm!` });
            }

            const dataInput = { ...req.body };

            if (ketluan && ketluan !== 'Chờ kết luận') {
                dataInput.ngaykl = new Date();
            }

            const newXetNghiem = new XetNghiem(dataInput);
            const saved = await newXetNghiem.save();
            res.status(201).json({ success: true, data: saved });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },


    updateXetNghiem: async (req, res) => {
        try {
            const { matm } = req.params;
            const updateData = { ...req.body };

            // Tự động cập nhật hoặc xóa ngày kết luận dựa theo trạng thái kết luận mới
            if (updateData.ketluan) {
                if (updateData.ketluan !== 'Chờ kết luận') {
                    updateData.ngaykl = new Date();
                } else {
                    updateData.ngaykl = null;
                }
            }

            const updated = await XetNghiem.findOneAndUpdate(
                { matm },
                updateData,
                { returnDocument: 'after', runValidators: true }
            );

            if (!updated) {
                return res.status(404).json({ success: false, message: `Không tìm thấy phiếu xét nghiệm của túi máu ${matm}` });
            }
            res.status(200).json({ success: true, data: updated });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    deleteXetNghiem: async (req, res) => {
        try {
            const { matm } = req.params;
            const deleted = await XetNghiem.findOneAndDelete({ matm });
            if (!deleted) {
                return res.status(404).json({ success: false, message: `Không tìm thấy phiếu xét nghiệm để xóa` });
            }
            res.status(200).json({ success: true, message: 'Đã xóa phiếu xét nghiệm' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

export default XetNghiemController;