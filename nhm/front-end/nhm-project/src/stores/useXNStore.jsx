import { create } from "zustand";
import * as useXNService from '@/services/useXNService';
import { success } from "zod";

export const useXNStore = create ((set, get) => ({
    formData : {
        matm: "",
        hiv: "",
        hbv: "",
        hcv: "",
        syp: "",
        abscreen: "",
        abo_cf: "",
        rhd_cf: "",
        ketluan: "",
        ngaykl: "",
        nguoikl: "",
    },
    XNList: [],
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
  getXN: async (filter = {}) => {
    set({loading: true});
    try {
        const res = await useXNService.getXetNghiem(filter);
        set({tuiMauList: res.data, success: true, loading: false});
        return res.data;
    } catch (error) {
        const errorMsg = error.res?.data?.message || error.message;
        console.log(errorMsg);
        set({error: errorMsg, loading: false, success:false});
        return false;
    }
  },

}))