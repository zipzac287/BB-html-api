import mongoose from "mongoose";
import { request } from "express";
import { DonorSessions, Donor, TuiMau } from "../../services/services.js";

const DonorSesController = {
    getDonorSessions: async(req, res) => {
        try {
            const { abo, rhd, donor_id, mstui, trihoan, fromDate, toDate, ngayhientu, ngayhienden } = req.query;

            const donorQuery = {};
            if (abo && abo !== '' && abo !== 'all') {
                donorQuery.donor_abo = abo;
            }
            if (rhd && rhd !== '' && rhd !== 'all') {
                donorQuery.donor_rhd = rhd;
            }
            if (donor_id && donor_id.trim() !== '') {
                const searchVal = donor_id.trim();
                donorQuery.$or = [
                    { donor_id: searchVal }, // Tìm CHÍNH XÁC theo Mã/CCCD người hiến
                    { donor_name: { $regex: searchVal, $options: 'i' } } // Tìm tương đối nếu người dùng nhập Tên
                ];
            }

            const sessionQuery = {};

            // Nếu có điều kiện lọc liên quan tới Người Hiến (ABO, RhD, Mã/Tên người hiến)
            if (Object.keys(donorQuery).length > 0) {
                const matchingDonors = await Donor.find(donorQuery).select('_id');
                const donorObjectIds = matchingDonors.map(d => d._id);
                sessionQuery.donor_id = { $in: donorObjectIds };
            }

            if (mstui && mstui.trim() !== '') {
                const targetMstui = mstui.trim();

                // Tìm ObjectId của túi máu trong collection TuiMau theo mã hiển thị/mã vạch
                const tuiMauDoc = await TuiMau.findOne({ matm: targetMstui }).select('_id').lean();

                if (!tuiMauDoc) {
                    // Không tìm thấy túi máu nào khớp với mã truyền vào -> Trả về mảng rỗng
                    return res.status(200).json({ success: true, count: 0, data: [] });
                }

                // Gán ObjectId thực sự của TuiMau vào query
                sessionQuery.mstui = tuiMauDoc._id;
            }

            if (trihoan !== undefined && trihoan !== '' && trihoan !== 'all') {
                sessionQuery.trihoan = trihoan === 'true';
            }

            const startDate = fromDate || ngayhientu;
            const endDate = toDate || ngayhienden;
            if (startDate || endDate) {
                sessionQuery.ngayhien = {};
                if (startDate) sessionQuery.ngayhien.$gte = new Date(startDate);
                if (endDate) {
                    const end = new Date(endDate);
                    end.setHours(23, 59, 59, 999);
                    sessionQuery.ngayhien.$lte = end;
                }
            }

            const danhsach = await DonorSessions.find(sessionQuery)
                .populate('donor_id')
                .sort({ ngayhien: -1 });

            res.status(200).json({ success: true, count: danhsach.length, data: danhsach });
        } catch (error) {
            console.error("Lỗi getDonorSessions:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    getSessionsByDonorId: async (req, res) => {
        try {
        const { id } = req.params; // Lấy ID của người hiến
            
        const danhsach = await DonorSessions.find({ 
            donor_id: id 
        }) // CHỈ lọc theo donor_id này
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
                { returnDocument: 'after', runValidators: true }
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
    },
    updatedsid: async(req, res) => {
        try {
            const { _id, matm} = req.body;
            if (!_id || !matm) {
                return res.status(400).json({
            success: false,
            message: "Thiếu thông tin id phiên hiến (_id) hoặc mstui",
            });
            }

            const update = await DonorSessions.findOneAndUpdate({mstui: matm},{mstui_id: _id}, {new: true});
            if (!update) {
                return res.status(404).json({
                    success: false,
                    message: "Không update được mstui_id ở DonorSession"
                });
            }
            const update1 = await TuiMau.findByIdAndUpdate(_id,{dsession_id: update._id}, {new: true});
            console.log(update1);
            if (!update1) {
                return res.status(404).json({
                    success: false,
                    message: "Không update được dsession_id ở TuiMau"
                });
            }
            return res.status(200).json({
                success: true,
                message:"update 2 luồng thành công"
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