import mongoose from "mongoose";
import { request } from "express";
import { DonorSessions } from "../../services/services.js";

const DonorSesController = {
    getDonorSessions: async(req, res) => {
        try {
            
            const danhsach = await DonorSessions.find()
            .populate('donor_id')
            .sort({ngayhien: -1});

            res.status(200).json({ success: true, data: danhsach, count: danhsach.length})
        } catch (error) {
            res.status(500).json({ success: false, message: error.message})
        }
    },
    getSessionsByDonorId: async (req, res) => {
        try {
        const { donor_id } = req.params; // Lấy ID của người hiến
  
        const danhsach = await DonorSessions.find({ donor_id }) // CHỈ lọc theo donor_id này
            .populate('donor_id')
            .sort({ ngayhien: -1 });
        if (!danhsach || danhsach.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy lần hiến",
            });
        }
        return res.status(200).json({ success: true, data: danhsach });
        } catch (error) {
            return res.status(500).json({ success:false, error: error.message});
        }
    },
    addDonorSessions: async(req, res) => {
        try {
            const newSes = new DonorSessions(req.body);
            const saved = await newSes.save();
            return res.status(201).json({ success: true, data: saved});
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message});
        }
    },
    updateDonorSessions: async(req, res) => {
        try {
            const { id } = req.params;

            const updatedSession = await DonorSessions.findOneAndUpdate(
                { dsession_id: id },
                req.body,
                { new: true, runValidators: true }
            ).populate('donor_id');
            if (!updatedSession) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy đợt hiến máu",
                });
            }
            return res.status(200).json({
                success: true,
                message:"Cập nhật thành công",
                data: updatedSession,
            });
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    },
    deleteDonorSession: async(req, res) => {
        try {
            const { id } = req.params;
            const deletedSession = await DonorSessions.findOneAndDelete({ dsession_id: id });
            if (!deletedSession) {
                return res.status(404).json({
                    success: false,
                    message: " Không tìm thấy lần hiến máu",
                });
            }
            return res.status(200).json({
                success: true,
                message: "Xóa lần hiến thành công",
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
};
export default DonorSesController;