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
  donors: [],


  updateField: (name, value) => {
    set((state) => ({
      formData: {
        ...state.formData,
        [name]: value,
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
  getDonorbyId: async (cccdParam) => {
    set({loading: true, error: null});
    try {
      const cccd = cccdParam?.trim() || get().formData?.cccd?.trim();
      if (!cccd) {
        throw new Error("Chưa nhập CCCD");
      }
      const result = await donorService.getById(cccd);
      if (!result) {
        set({error: "Không tìm thấy căn cước công dân", loading: false});
        return false;
      }

      set({ formData: result, loading: false});
      return True;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      set({ error: errorMsg, loading: false });
    }
  },

  // 2. Action: Thêm người hiến máu mới
  addDonor: async () => {
  set({ loading: true, error: null, success: null });
  try {
    // PHẢI CÓ DÒNG NÀY: Lấy formData hiện tại ra từ Store bằng get()
    const { formData } = get(); 
    
    // Kiểm tra xem formData có tồn tại không để phòng thủ an toàn
    if (!formData) {
      throw new Error("Dữ liệu form không hợp lệ hoặc trống rỗng.");
    }

    // Gọi API qua Axios service
    const newDonor = await donorService.create(formData);
    
    set((state) => ({
      donors: [newDonor, ...state.donors],
      success: "Thêm người hiến máu thành công!",
      loading: false
    }));
    return true; // Trả về true để UI biết mà navigate chuyển trang
  } catch (err) {
    console.error(" CHI TIẾT LỖI 400 TỪ SERVER:", err.response?.data);
    
    const errorMsg = err.response?.data?.message || err.message || "Đã xảy ra lỗi";
    set({ error: errorMsg, loading: false });
    return false;
  }
},
  updateDonor: async () => {
    set({ loading: true, error: null});
    try {
      const { formData } = get();
      const donorId = formData.cccd;
      const updatedDonor = await donorService.update(donorId,formData);
      set({success: true, loading: false});
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },
  clearMessages: () => set({ error: null, success: null })
}));