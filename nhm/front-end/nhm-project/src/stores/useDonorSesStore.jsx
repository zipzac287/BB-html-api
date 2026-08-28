import { create } from "zustand";
import * as useDonorSesService from "@/services/useDonorSesService";
import { add } from "date-fns";
import { success } from "zod";

export const useDonorSesStore = create ((set, get) => ({
    formData: {
        donor_id: "",
        ngayhien: "",
        thetichhien: "",
        ha_tthu: "",
        ha_ttruong: "",
        nhiptim: "",
        cannang: "",
        hb: "",
        hbtest: "",
        trihoan: "",
        ngaytrihoan: "",
        lidotrihoan: "",
        mstui: "",
        mstui_id: "",
        loaicp: "",
    },
    loading: false,
    error: null,
    success: null,
    getSession: async (filter = {}) => {
        set({ loading: true, error: null });
    try {
    
      const result = await useDonorSesService.getsession(filter);

      // Cập nhật mảng dữ liệu đã map từ backend về store
      set({ formData: result.data, loading: false });
      return result.data;
    } catch (err) {
      // Axios bắt lỗi hệ thống hoặc từ server trả về
      const errorMsg = err.response?.data?.message || err.message;
      set({ error: errorMsg, loading: false });
      return errorMsg;
    }
    },
    getbyId: async (donor_id) => {
        set({ loading: true, error: null});
        try {
            const result = await useDonorSesService.getbyId({donor_id: donor_id});
            if (!result) {
                set({ success: false, message: "Không tìm thấy lần hiến máu"});
            }
            set ({formData: result, loading: false, success: true});
            return result.data;
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message;
            set({ error: errorMsg, loading: false });
            return false;
        }
    },
    createSession: async (formData) => {
        set({ loading: true, error: null });
        try {
            console.log(formData);
            const result = await useDonorSesService.createsession(formData);
            console.log(result);
            if (!result) {
                set({ success: false, message: "Lỗi hệ thống"});
                return false;
            }
            set({formData: result, loading: false, success: true});
            return result;
            console.log(result);
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message;
            set({ error: errorMsg, loading: false });
            return false;
        }
    },
    updateSession: async (formData,_id) => {
        set({ loading: true, error: null});
        try {
            const result = await useDonorSesService.updatesession(formData,_id);
            if (!result) {
                set ({ success: false, message: "Lỗi hệ thống"});
                return false;
            }
            set({ formData: result, loading: false, success: true});
            return result;
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message;
            set({ error: errorMsg, loading: false });
            return false;
        }
    },
    deleteSession: async (_id) => {
        set({ loading: true, error: null});
        try {
            const result = await useDonorSesService.deletesession(_id);
            if (!result) {
                set({ success: false, message: "Lỗi hệ thông"});
            }
            set({ success: true, loading: false});
            return true;
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message;
            set({ error: errorMsg, loading: false });
            return false;
        }
    },
    UpdateDsid: async (_id,matm) => {
        set({loading: true, error: null});
        try {
            const result = await useDonorSesService.updatedsid(_id,matm);
            if (!result) {
                set({success:false, message:"Lỗi hệ thông"});
            }
            set({success:true, loading: false});
            return result;
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message;
            set({ error: errorMsg, loading: false });
            return false;
        }
    },
}
))