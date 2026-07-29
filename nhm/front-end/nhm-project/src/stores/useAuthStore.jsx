import { create } from 'zustand';
import { toast } from 'sonner';
import axios from 'axios';
import { persist } from 'zustand/middleware';
import { authService } from '@/services/authService';


export const useAuthStore = create(
        (set) => ({
    accessToken: null,
    user: null,
    loading: true,
    error: null,

    signUp: async (data) => {

        try {
            set({loading: true, error: null});

            await authService.signUp(data);

            toast.success('Đăng ký thành công!')
        } catch (error) {
            console.error(`Chi tiết lỗi API:`, error.response?.data);
             const errorMsg = error.response?.data?.message || `Lỗi khi đăng ký`;
            toast.error(errorMsg)
            throw error;
        } finally {
            set({ loading: false});
        }
    },
    signIn: async (credentials) => {
        
        try {
            set({loading: true, error: null});
            const data = await authService.signIn(credentials);
            if (data.accessToken) {
            localStorage.setItem("accessToken", data.accessToken);
        }
            set({
                accessToken: data.accessToken,
                user: data.user,
                loading:false
            });
            return true
        } catch (error) {
            console.error(`Chi tiết lỗi API:`, error.response?.data);
            const errorMsg = error.response?.data?.message || `Lỗi khi đăng nhập`;
            toast.error(errorMsg)
            set ({
                loading: false,
                error: error.response?.data?.message
            });
            throw error;
        }
    },
    signOut: async () => {
    set({
    user: null,
    accessToken: null,
    loading: false,
    error: null
  });
    localStorage.removeItem('accessToken');
  try {
    await authService.signOut();
  } catch (error) {
    console.error(`Chi tiết lỗi API SignOut ngầm:`, error.response?.data);
  }
},
    checkAuth: async () => {
        try {
            set({ loading: true, error: null});
            const data = await authService.checkAuth();
            const newAccessToken = data?.accessToken;

            if (!newAccessToken) {
                throw new Error("không nhận được accessToken");
            }
            localStorage.setItem("accessToken", newAccessToken);
            set({ accessToken: newAccessToken });

            const meData = await authService.authMe(newAccessToken);
            set({
                user: meData.user,
                loading: false
            });
            return true;
        } catch (error) {
            set({
                user: null,
                accessToken: null,
                loading: false,
            });
            return false;
        }
    }    
})  
    )