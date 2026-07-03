import { create } from "zustand";
import * as donorService from '../services/useDonorService';

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
  selectedDonor:  null,   // donor đang xem / sửa (UI format)

  // ── Danh sách ─────────────────────────────────────────────
  donors:  [],
  count:   0,
  filters: {},            // { donor_abo: 'O', donor_rhd: '+', ... }

  // ── Trạng thái async ──────────────────────────────────────
  loading: false,
  error:   null,
  success: null,
  // Hàm xử lý khi gõ input (tương tự handleChange)
  updateField: (name, value) =>
    set((state) => ({
      formData: {
        ...state.formData,
        [name]: value,
      },
    })),
  updateFields: (partial) =>
    set((state) => ({
      formData: { ...state.formData, ...partial },
      error:    null,
    })),

  // Hàm xóa dữ liệu nhập lại (Reset form)
  resetForm: () => set({ formData: initialFormState }),

// store/useDonorStore.js

  /** Nạp donor đang chọn vào form (dùng khi mở modal Edit) */
  loadDonorToForm: (donor) =>
    set({
      selectedDonor: donor,
      formData: {
        hoTen:            donor.hoTen,
        ngaySinh:         donor.ngaySinh,
        gioiTinh:         donor.gioiTinh,
        cccd:             donor.cccd,
        soDienThoai:      donor.soDienThoai,
        email:            donor.email,
        diaChi:           donor.diaChi,
        nhomMau:          donor.nhomMau,
        rhd:              donor.rhd,
        tinhTrangSucKhoe: donor.tinhTrang ?? '',
      },
      error:   null,
      success: null,
    }),

  clearSelected: () =>
    set({ selectedDonor: null }),

  clearMessages: () =>
    set({ error: null, success: null }),

  // ═══════════════════════════════════════════════════════════
  // FILTER ACTIONS
  // ═══════════════════════════════════════════════════════════

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),

  clearFilters: () =>
    set({ filters: {} }),

  // ═══════════════════════════════════════════════════════════
  // ASYNC API ACTIONS
  // ═══════════════════════════════════════════════════════════

  /**
   * Lấy danh sách người hiến máu
   * Dùng filters trong store, hoặc truyền override
   *
   * Cách dùng trong component:
   *   const { fetchDonors } = useDonorStore();
   *   useEffect(() => { fetchDonors(); }, []);
   */
  fetchDonors: async (overrideFilters) => {
    const filters = overrideFilters ?? get().filters;
    set({ loading: true, error: null });
    try {
      const { count, data } = await donorService.getAll(filters);
      set({ donors: data, count, loading: false });
    } catch (err) {
      set({ loading: false, error: err.message });
    }
  },

  /**
   * Lấy 1 donor theo ID và set vào selectedDonor
   *
   * Cách dùng:
   *   await fetchDonorById('CCCD_hoặc_donor_id');
   */
  fetchDonorById: async (donorId) => {
    set({ loading: true, error: null });
    try {
      const donor = await donorService.getById(donorId);
      set({ selectedDonor: donor, loading: false });
      return donor;
    } catch (err) {
      set({ loading: false, error: err.message });
      return null;
    }
  },

  /**
   * Tạo người hiến máu mới từ formData hiện tại
   *
   * Cách dùng:
   *   const ok = await createDonor();
   *   if (ok) navigate('/donors');
   */
  createDonor: async () => {
    set({ loading: true, error: null, success: null });
    try {
      const newDonor = await donorService.create(get().formData);

      // Thêm vào đầu danh sách local, không cần fetch lại
      set((state) => ({
        donors:  [newDonor, ...state.donors],
        count:   state.count + 1,
        loading: false,
        success: `Đã thêm người hiến máu: ${newDonor.hoTen}`,
      }));

      get().resetForm();
      return true;
    } catch (err) {
      set({ loading: false, error: err.message });
      return false;
    }
  },

  /**
   * Cập nhật donor đang chọn (selectedDonor) từ formData hiện tại
   *
   * Cách dùng:
   *   const ok = await updateDonor();
   */
  updateDonor: async () => {
    const { selectedDonor, formData } = get();
    if (!selectedDonor?.donorId) {
      set({ error: 'Chưa chọn người hiến để cập nhật.' });
      return false;
    }

    set({ loading: true, error: null, success: null });
    try {
      const updated = await donorService.update(selectedDonor.donorId, formData);

      // Cập nhật lại trong danh sách local
      set((state) => ({
        donors: state.donors.map((d) =>
          d.donorId === updated.donorId ? updated : d
        ),
        selectedDonor: updated,
        loading:       false,
        success:       `Đã cập nhật: ${updated.hoTen}`,
      }));

      return true;
    } catch (err) {
      set({ loading: false, error: err.message });
      return false;
    }
  },

  /**
   * Xóa donor
   *
   * Cách dùng:
   *   await deleteDonor('CCCD');
   */
  deleteDonor: async (donorId) => {
    set({ loading: true, error: null });
    try {
      await donorService.remove(donorId);

      set((state) => ({
        donors:        state.donors.filter((d) => d.donorId !== donorId),
        count:         state.count - 1,
        selectedDonor: state.selectedDonor?.donorId === donorId ? null : state.selectedDonor,
        loading:       false,
        success:       'Đã xóa người hiến máu.',
      }));

      return true;
    } catch (err) {
      set({ loading: false, error: err.message });
      return false;
    }
  },
}));