// stores/useDonorStore.js
import { create } from "zustand";
import donorService from "@/services/useDonorService"; 

export const useDonorStore = create((set, get) => ({
  formData: {
    hoTen: "",
    cccd: "",
    ngaySinh: "",
    gioiTinh: "Nam",
    soDienThoai: "",
    email: "",
    diaChi: "",
    nhomMau: "",
    rhd: "+",
    tinhTrangSucKhoe: "",
  },
  loading: false,
  error: null,
  success: null,


  updateField: (name, value) => {
    set((state) => ({
      formData: {
        ...state.formData,
        [name]: value, // Cập nhật động giá trị của field dựa vào thuộc tính 'name'
      },
    }));
  },
  // 1. Action: Lấy danh sách người hiến máu
  getDonors: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const result = await donorService.getAll(filters);
      // Cập nhật mảng dữ liệu đã map từ backend về store
      set({ donors: result.data, loading: false });
    } catch (err) {
      // Axios bắt lỗi hệ thống hoặc từ server trả về
      const errorMsg = err.response?.data?.message || err.message;
      set({ error: errorMsg, loading: false });
    }
  },

  // 2. Action: Thêm người hiến máu mới
  addDonor: async (formData) => {
    set({ loading: true, error: null });
    try {
      // Gọi service Axios gửi data lên backend
      const newDonor = await donorService.create(formData);
      
      // Đẩy thành công -> Cập nhật trực tiếp vào mảng local để UI render lại ngay lập tức
      set((state) => ({
        donors: [newDonor, ...state.donors],
        loading: false,
      }));
      
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },
}));