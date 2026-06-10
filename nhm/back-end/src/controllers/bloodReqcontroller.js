import mongoose from "mongoose";
import { BloodRequest } from "../../services/services.js";
import { request } from "express";

const BloodRequestController = {
    // [GET] /api/BloodRequest
    getBloodRequest: async (req, res) => {
        try {
            const queryFilter = { ...req.query };
            Object.keys(queryFilter).forEach(key => {
                if (queryFilter[key] === undefined || queryFilter[key] === '') delete queryFilter[key];
            });

            const danhSach = await BloodRequestModel.find(queryFilter);
            res.status(200).json({ success: true, data: danhSach });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // [POST] /api/BloodRequest
    createBloodRequest: async (req, res) => {
        try {
            const { id } = req.body;
            const checkExist = await BloodRequestModel.findOne({ id });
            if (checkExist) {
                return res.status(400).json({ success: false, message: `Mã yêu cầu ${id} đã tồn tại!` });
            }

            const newRequest = new BloodRequestModel(req.body);
            const saved = await newRequest.save();
            res.status(201).json({ success: true, data: saved });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    // [PATCH] /api/BloodRequest/:id
    updateBloodRequest: async (req, res) => {
        try {
            const { id } = req.params;
            const updated = await BloodRequestModel.findOneAndUpdate(
                { id },
                req.body,
                { returnDocument: 'after', runValidators: true }
            );

            if (!updated) {
                return res.status(404).json({ success: false, message: `Không tìm thấy yêu cầu nhận máu có mã ${id}` });
            }
            res.status(200).json({ success: true, data: updated });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // [DELETE] /api/BloodRequest/:id
    deleteBloodRequest: async (req, res) => {
        try {
            const { id } = req.params;
            const deleted = await BloodRequestModel.findOneAndDelete({ id });
            if (!deleted) {
                return res.status(404).json({ success: false, message: `Không tìm thấy yêu cầu để xóa` });
            }
            res.status(200).json({ success: true, message: 'Đã xóa yêu cầu nhận máu thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

export default BloodRequestController;