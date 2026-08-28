import { create } from "zustand";
import * as useTuiMauService from "@/services/useTuiMauService";
import { success } from "zod";

export const useTuiMauStore = create((set, get) => ({
  formData: {
    matm: "",
    com_type: "",
    blood_type: "",
    rhd: "",
    thetich: "",
    ngayhien: "",
    hsd: "",
    tinhtrang: "",
    location: "",
    dsession_id: "",
    parent_id: "",
    split_level: "",
  },
  tuiMauList: [],
  loading: false,
  error: null,
  success: false,

  updateField: (name,value) => {
    set((state) => ({
      formData: {
        ...state.formData,
        [name]: value,
      },
    }));
  },

  fetchTuiMau: async (filter = {}) => {
    set({ loading: true, error: null });
    try {
      const result = await useTuiMauService.getTuiMau(filter);
      set({ tuiMauList: result.data || [], loading: false });
      return result.data || [];
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      set({ error: errorMsg, loading: false });
      return [];
    }
  },

  addTuiMau: async () => {
    set({ loading: true, error: null });
    try {
      const { formData } = get();
      const payload = {
        ...formData,
        dsession_id: formData.dsession_id || null,
        parent_id: formData.parent_id || null,
      };
      const result = await useTuiMauService.createTuiMau(payload);
      set((state) => ({
        tuiMauList: [result.data, ...state.tuiMauList],
        loading: false,
        success: true,
      }));
      return result.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      set({ error: errorMsg, loading: false });
      return { success: false, message: errorMsg };
    }
  },

  editTuiMau: async (matm, data) => {
    set({ loading: true, error: null });
    try {
      const result = await useTuiMauService.updateTuiMau(matm, data);
      set((state) => ({
        tuiMauList: state.tuiMauList.map((item) => (item.matm === matm ? result.data : item)),
        loading: false
      }));
      return { success: true, message: result.message || "Cập nhật thành công", data: result.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      set({ error: errorMsg, loading: false });
      return { success: false, message: errorMsg };
    }
  },

  removeTuiMau: async (matm) => {
    set({ loading: true, error: null });
    try {
      const result = await useTuiMauService.deleteTuiMau(matm);
      set((state) => ({
        tuiMauList: state.tuiMauList.filter((item) => item.matm !== matm),
        loading: false
      }));
      return { success: true, message: result.message || "Đã xóa túi máu" };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      set({ error: errorMsg, loading: false });
      return { success: false, message: errorMsg };
    }
  },
  clearTMList: async () => {
    try {
      set({tuiMauList: []});
    } catch (error) {
      const errorMsg = err.response?.data?.message || err.message;
      set({ error: errorMsg, loading: false });
      return { success: false, message: errorMsg };
    }
  },
  updateTM: async (matm, _id) => {
    set({ loading: true, error: null });
    try {
      const result = await useTuiMauService.updateTM(matm,_id);
      set({loading:false});
      return { success: true, message: result?.message || "Cập nhật thành công", data: result?.data };
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      console.log(errorMsg);
      set({ error: errorMsg, loading: false });
      return { success: false, message: errorMsg };
    }
  },
  splitTM: async (tuichaid, tuicon) => {
    set({ loading: true, error: null});
    try {
      const res = await useTuiMauService.splitTM(tuichaid, tuicon);
      if (!res) {
        set ({ loading: false, success: false, message: res?.message});
      } else {
      return ({ success: true, loading: false, data: res?.data});
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      console.log(errorMsg);
      set({ error: errorMsg, loading: false });
      return { success: false, message: errorMsg };
    }
  }
}));
