import mongoose from "mongoose";
import { CapMau } from "../../services/services.js";
import { request } from "express";

const CapMauController = {
    // [GET] /api/CapMau
    getCapMau: async (req, res) => {
        try {
            const queryFilter = { ...req.query };
            Object.keys(queryFilter).forEach(key => {
                if (queryFilter[key] === undefined || queryFilter[key] === '') delete queryFilter[key];
            });

            const danhSach = await CapMauModel.find(queryFilter);
            res.status(200).json({ success: true, data: danhSach });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // [POST] /api/CapMau
    createCapMau: async (req, res) => {
        try {
            const { id } = req.body;
            const checkExist = await CapMauModel.findOne({ id });
            if (checkExist) {
                return res.status(400).json({ success: false, message: `Mã phiếu cấp máu ${id} đã tồn tại!` });
            }

            const newCapMau = new CapMauModel(req.body);
            const saved = await newCapMau.save();
            res.status(201).json({ success: true, message: 'Lập phiếu cấp phát máu thành công', data: saved });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    // [PATCH] /api/CapMau/:id
    updateCapMau: async (req, res) => {
        try {
            const { id } = req.params;
            const updated = await CapMauModel.findOneAndUpdate(
                { id },
                req.body,
                { returnDocument: 'after', runValidators: true }
            );

            if (!updated) {
                return res.status(404).json({ success: false, message: `Không tìm thấy phiếu cấp máu mã ${id}` });
            }
            res.status(200).json({ success: true, data: updated });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // [DELETE] /api/CapMau/:id
    deleteCapMau: async (req, res) => {
        try {
            const { id } = req.params;
            const deleted = await CapMauModel.findOneAndDelete({ id });
            if (!deleted) {
                return res.status(404).json({ success: false, message: `Không tìm thấy phiếu cấp máu để xóa` });
            }
            res.status(200).json({ success: true, message: 'Đã xóa phiếu cấp máu thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

export default CapMauController;