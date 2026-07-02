import { create } from "zustand";

// Khởi tạo giá trị mặc định của form để tái sử dụng
const initialFormState = {
  hoTen: "",
  ngaySinh: "",
  gioiTinh: "Nam",
  cccd: "",
  soDienThoai: "",
  email: "",
  diaChi: "",
  nhomMau: "Chưa xác định",
  canNang: "",
  tinhTrangSucKhoe: "",
  ghiChu: "",
};

export const useDonorStore = create((set) => ({
  // State chứa dữ liệu form
  formData: initialFormState,

  // Hàm xử lý khi gõ input (tương tự handleChange)
  updateField: (name, value) =>
    set((state) => ({
      formData: {
        ...state.formData,
        [name]: value,
      },
    })),

  // Hàm xóa dữ liệu nhập lại (Reset form)
  resetForm: () => set({ formData: initialFormState }),
}));