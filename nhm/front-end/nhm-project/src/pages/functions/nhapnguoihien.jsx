import React from "react";
import { useDonorStore } from "@/stores/useDonorStore"; // Đảm bảo đúng đường dẫn file store của bạn

export default function NhapNguoiHien() {
  // Lấy state và các hàm cần thiết từ Zustand Store
  const { formData, updateField, resetForm } = useDonorStore();

  // Hàm xử lý khi thay đổi dữ liệu trong các ô Input
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateField(name, value); // Gọi hàm của Zustand
  };

  // Hàm xử lý khi nhấn nút Lưu (Submit Form)
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dữ liệu người hiến máu lưu trong Zustand:", formData);
    alert("Lưu thông tin người hiến máu thành công!");
    
    // Bạn có thể gọi API Axios tại đây:
    // axios.post('/api/nguoi-hien-mau', formData)...
  };

  return (
    <div className="w-full flex flex-col bg-white/70 backdrop-blur-md rounded-xl shadow-sm border border-slate-200/80">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-800">Hồ Sơ Đăng Ký Hiến Máu</h2>
        <p className="text-xs text-slate-500 mt-1">Vui lòng điền chính xác thông tin của người hiến máu vào biểu mẫu dưới đây.</p>
      </div>

      {/* PHẦN THÂN BIỂU MẪU (Bọc trong vùng cuộn tự động)
        - Dùng flex-1 overflow-y-auto để nếu form dài quá màn hình, nó sẽ tự xuất hiện thanh cuộn 
          CHỈ bên trong ô này, chứ không làm sập hay đẩy lệch toàn bộ layout Sidebar + Header.
      */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[calc(100vh-12rem)]">
        
        {/* KHỐI 1: THÔNG TIN CÁ NHÂN */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-red-600 uppercase tracking-wider">1. Thông tin cá nhân</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="flex flex-col gap-1.5 col-span-1">
              <label className="text-xs font-semibold text-slate-600">Số CCCD / CMND <span className="text-red-500">*</span></label>
              <input
                required
                type="text"
                name="cccd"
                value={formData.cccd}
                onChange={handleChange}
                placeholder="001xxxxxxxx"
                className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              />
            </div>
          </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">Họ và tên <span className="text-red-500">*</span></label>
              <input
                required
                type="text"
                name="hoTen"
                value={formData.hoTen}
                onChange={handleChange}
                placeholder="Nguyễn Văn A"
                className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">Ngày sinh <span className="text-red-500">*</span></label>
              <input
                required
                type="date"
                name="ngaySinh"
                value={formData.ngaySinh}
                onChange={handleChange}
                className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">Giới tính</label>
              <select
                name="gioiTinh"
                value={formData.gioiTinh}
                onChange={handleChange}
                className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">Số điện thoại <span className="text-red-500">*</span></label>
              <input
                required
                type="tel"
                name="soDienThoai"
                value={formData.soDienThoai}
                onChange={handleChange}
                placeholder="0912345678"
                className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@gmail.com"
                className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Địa chỉ thường trú</label>
            <input
              type="text"
              name="diaChi"
              value={formData.diaChi}
              onChange={handleChange}
              placeholder="Số nhà, Đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố"
              className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
            />
          </div>
        </div>

        <Separator className="my-2 bg-slate-100" />

        {/* KHỐI 2: LÂM SÀNG & SỨC KHỎE BAN ĐẦU */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-red-600 uppercase tracking-wider">2. Trạng thái lâm sàng</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">Nhóm máu (Nếu biết trước)</label>
              <select
                name="nhomMau"
                value={formData.nhomMau}
                onChange={handleChange}
                className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              >
                <option value="Chưa xác định">Chưa xác định</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">Cân nặng (kg) <span className="text-red-500">*</span></label>
              <input
                required
                type="number"
                name="canNang"
                value={formData.canNang}
                onChange={handleChange}
                placeholder="Ví dụ: 60"
                className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">Kết luận khám nhanh</label>
              <input
                type="text"
                name="tinhTrangSucKhoe"
                value={formData.tinhTrangSucKhoe}
                onChange={handleChange}
                placeholder="Đủ điều kiện hiến máu"
                className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Ghi chú / Tiền sử bệnh lý (Nếu có)</label>
            <textarea
              name="ghiChu"
              value={formData.ghiChu}
              onChange={handleChange}
              rows={2}
              placeholder="Nhập các lưu ý đặc biệt..."
              className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none"
            />
          </div>
        </div>

        {/* PHẦN ĐẾ (Nút bấm thao tác - Cố định ở cuối card) */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center justify-center rounded-lg text-xs font-semibold border border-slate-200 bg-white px-4 h-9 shadow-sm hover:bg-slate-50 text-slate-600 transition-colors"
          >
            Xóa nhập lại
          </button>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg text-xs font-semibold bg-red-600 text-white px-5 h-9 shadow-sm hover:bg-red-700 transition-colors"
          >
            Lưu hồ sơ người hiến
          </button>
        </div>

      </form>
    </div>
  );
}

// Component phân cách nhỏ gọn thay thế cho thẻ hr
function Separator({ className }) {
  return <div className={`h-[1px] w-full ${className}`} />;
}