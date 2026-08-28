import mongoose from "mongoose";

const TuiMauSchema = new mongoose.Schema({
        
    matm: {
        type : String,
        required : true,
        trim : true,
        unique : true
    },
    com_type: {
        type : String,
        enum: [
            'MTP',
            'KHC',
            'HTTDL',
            'TCGT',
            'TPPOOL',
            'TL'
        ],
        required: true
    },
    blood_type: {
        type : String,
        enum: ['A','B','O','AB'],
        required : true
    },
    rhd: {
        type: String,
        enum: ['+','-'],
        required : true
    },
    thetich: {
        type: String,
        required : true
    },
    ngayhien: {
        type : Date,
        required : true
    },
    hsd : {
        type : Date
    },
    tinhtrang: {
        type : String,
        enum: ['Nhập kho thô','Đã chiết tách','Nhập kho sạch','Đã cấp','Đã hủy',"Phế thải"],
        required : true
    },
    location: {
        type: String,
        required: true
    },
    dsession_id: {   
        type : mongoose.Schema.Types.ObjectId,
        ref: 'DonorSession',
        sparse: true,
        default: null,
    },
    parent_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TuiMau',
        default: null,
    },
    split_level: {
        type: Number,
        default: 0,
    },
    ngaychiettach: {
        type: Date,
    }
},{ timestamps : true,
    collection : 'tuimau'
 });

const donorSchema = new mongoose.Schema({
 donor_id: {
 type: String,
 required: true,
 unique: true,
 trim: true
 },
 donor_name: {
 type: String,
 required: true,
 trim: true
 },
 donor_ngaysinh: {
 type: Date,
 required: true
 },
 donor_sex: {
 type: String,
 enum: ['Nam', 'Nữ', 'Khác'],
 required: true
 },
 donor_diachi: {
 type: String,
 trim: true
 },
 donor_email: {
 type: String,
 trim: true,
 lowercase: true
 },
 donor_phone: {
 type: String,
 trim: true
 },
 donor_abo: {
 type: String,
 enum: ['A', 'B', 'AB', 'O'],
 required: true
 },
 donor_rhd: {
 type: String,
 enum: ['+', '-'],
 required: true
 },
 donor_trihoan: {
 type: String,
 default: null
 }
}, {
 timestamps: true,
 collection: 'donors'
});

const xetNghiemSchema = new mongoose.Schema({
 matm: {
 type: String,
 ref: 'TuiMau',
 required: true,
 unique: true
 },
 hiv: {
 type: String,
 enum: ['Âm tính', 'Dương tính', 'Chưa xét nghiệm'],
 default: 'Chưa xét nghiệm'
 },
 hbv: {
 type: String,
 enum: ['Âm tính', 'Dương tính', 'Chưa xét nghiệm'],
 default: 'Chưa xét nghiệm'
 },
 hcv: {
 type: String,
 enum: ['Âm tính', 'Dương tính', 'Chưa xét nghiệm'],
 default: 'Chưa xét nghiệm'
 },
 syp: {
 type: String,
 enum: ['Âm tính', 'Dương tính', 'Chưa xét nghiệm'],
 default: 'Chưa xét nghiệm'
 },
 abscreen: {
 type: String,
 enum: ['Âm tính', 'Dương tính', 'Chưa xét nghiệm'],
 default: 'Chưa xét nghiệm'
 },
 abo_cf: {
 type: String,
 trim: true
 },
 rhd_cf: {
 type: String,
 trim: true
 },
 ketluan: {
 type: String,
 enum: ['Đạt', 'Không đạt', 'Chờ kết luận'],
 default: 'Chờ kết luận'
 },
 ngaykl: {
 type: Date
 },
 nguoikl: {
 type: String,
 trim: true
 }
}, {
 timestamps: true,
 collection: 'xetnghiem'
});

const bloodRequestSchema = new mongoose.Schema({
 id: {
 type: String,
 required: true,
 unique: true,
 trim: true
 },
 patient_id: {
 type: String,
 required: true,
 trim: true
 },
 patient_name: {
 type: String,
 required: true,
 trim: true
 },
 patient_ngaysinh: {
 type: Date,
 required: true
 },
 patient_abo: {
 type: String,
 enum: ['A', 'B', 'AB', 'O'],
 required: true
 },
 patient_rhd: {
 type: String,
 enum: ['Pos', 'Neg'],
 required: true
 },
 com_request: {
 type: String,
 required: true,
 trim: true
 },
 quantity: {
 type: Number,
 required: true,
 min: 1
 },
 req_status: {
 type: String,
 enum: ['Chờ xử lý', 'Đang xử lý', 'Hoàn thành', 'Hủy'],
 default: 'Chờ xử lý'
 }
}, {
 timestamps: true,
 collection: 'blood_requests'
});

const capMauSchema = new mongoose.Schema({
 id: {
 type: String,
 required: true,
 unique: true,
 trim: true
 },
 patient_id: {
 type: String,
 ref: 'BloodRequest',
 required: true
 },
 matm: {
 type: String,
 ref: 'TuiMau',
 required: true
 },
 ngaycap: {
 type: Date,
 required: true,
 default: Date.now
 },
 test_result: {
 type: String,
 enum: ['Phù hợp', 'Không phù hợp'],
 required: true
 },
 nguoikl: {
 type: String,
 required: true,
 trim: true
 }
}, {
 timestamps: true,
 collection: 'capmau'
});

const DonorSessionSchema = new mongoose.Schema({
donor_id : {
type: mongoose.Schema.Types.ObjectId,
ref: 'Donor',
required: true
},
ngayhien: {
type: Date,
required: true
},
thetichhien: {
type: Number,
required: true
},
ha_tthu: {
type: Number
},
ha_ttruong: {
type: Number
},
nhiptim: {
type: Number
},
cannang: {
type: Number,
},
hb: {
type: Number,
},
hbtest: {
type: String
},
trihoan: {
type: Boolean
},
ngaytrihoan: {
type: Date,
},
lidotrihoan: {
type: String,
},
mstui_id: {
type: mongoose.Schema.Types.ObjectId,
ref: "TuiMau",
unique: true,
sparse: true,
default: null
},
mstui: {
type:String,
unique: true,
},
loaicp: {
type: String,
},
},{
    timestamps: true,
    collection: 'donorsession'
});


// ============================================
// INDEXES
// ============================================
donorSchema.index({ donor_abo: 1, donor_rhd: 1 });
donorSchema.index({ donor_phone: 1 });
donorSchema.index({ donor_email: 1 });

TuiMauSchema.index({ blood_type: 1, rhd: 1 });
TuiMauSchema.index({ tinhtrang: 1 });
TuiMauSchema.index({ hsd: 1 });
TuiMauSchema.index({ nhm_id: 1 });

xetNghiemSchema.index({ ketluan: 1 });
xetNghiemSchema.index({ ngaykl: 1 });

bloodRequestSchema.index({ patient_id: 1 });
bloodRequestSchema.index({ req_status: 1 });
bloodRequestSchema.index({ patient_abo: 1, patient_rhd: 1 });

capMauSchema.index({ patient_id: 1 });
capMauSchema.index({ matm: 1 });
capMauSchema.index({ ngaycap: 1 });

DonorSessionSchema.index({ donor_id: 1 });
DonorSessionSchema.index({ ngayhien: 1 });

// ============================================
// MODELS EXPORT
// ============================================
export const Donor = mongoose.model('Donor', donorSchema);
export const TuiMau = mongoose.model('TuiMau', TuiMauSchema);
export const XetNghiem = mongoose.model('XetNghiem', xetNghiemSchema);
export const BloodRequest = mongoose.model('BloodRequest', bloodRequestSchema);
export const CapMau = mongoose.model('CapMau', capMauSchema);
export const DonorSessions = mongoose.model('DonorSession', DonorSessionSchema);




