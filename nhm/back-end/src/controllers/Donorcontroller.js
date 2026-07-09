import mongoose from "mongoose";
import { Donor } from "../../services/services.js";
import { request } from "express";

const DonorController = {
    // [GET] /api/Donor
    getDonor: async (req, res) => {
        try {
            const queryFilter = { ...req.query };
            // Xóa các trường tìm kiếm bị rỗng
            Object.keys(queryFilter).forEach(key => {
                if (queryFilter[key] === undefined || queryFilter[key] === '') delete queryFilter[key];
            });

            const danhSach = await Donor.find(queryFilter);
            res.status(200).json({ success: true, count: danhSach.length, data: danhSach });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // [POST] /api/Donor
    createDonor: async (req, res) => {
        try {
            const { donor_id } = req.body;
            const checkExist = await Donor.findOne({ donor_id });
            if (checkExist) {
                return res.status(400).json({ success: false, message: `Mã người hiến ${donor_id} đã tồn tại!` });
            }

            const newDonor = new Donor(req.body);
            const saved = await newDonor.save();
            res.status(201).json({ success: true, message: 'Thêm người hiến máu thành công', data: saved });
        } catch (error) {
            console.error("❌ LỖI DATABASE TẠI BACKEND:", error.message);
            return res.status(400).json({ success: false, message: `${error.message}` });
        }
    },

    // [PATCH] /api/Donor/:donor_id
    updateDonor: async (req, res) => {
        try {
            const { donor_id } = req.params;
            const updated = await Donor.findOneAndUpdate(
                { donor_id },
                req.body,
                { returnDocument: 'after', runValidators: true }
            );

            if (!updated) {
                return res.status(404).json({ success: false, message: `Không tìm thấy người hiến có mã ${donor_id}` });
            }
            res.status(200).json({ success: true, message: 'Cập nhật thành công', data: updated });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // [DELETE] /api/Donor/:donor_id
    deleteDonor: async (req, res) => {
        try {
            const { donor_id } = req.params;
            const deleted = await Donor.findOneAndDelete({ donor_id });
            if (!deleted) {
                return res.status(404).json({ success: false, message: `Không tìm thấy người hiến có mã ${donor_id}` });
            }
            res.status(200).json({ success: true, message: `Đã xóa người hiến ${donor_id} thành công` });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

export default DonorController;