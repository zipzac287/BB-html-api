import { create } from 'zustand';
import { toast } from 'sonner';
import axios from 'axios';
import { persist } from 'zustand/middleware';
import { authService } from '@/services/authService';
import api from '@/lib/axios';


export const useAuthStore = create(
        (set) => ({
    accessToken: null,
    user: null,
    loading: true,
    error: null,

    setAccessToken: (token) => set({accessToken: token}),

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
            const { accessToken, user } = data;
        }
            set({
                accessToken: data.accessToken,
                user: data.user,
                loading:false
            });
            return { success: true, message:"Đăng nhập thành công"};
        } catch (error) {
            console.error(`Chi tiết lỗi API:`, error);
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
    
  try {
    await authService.signOut();
  } catch (error) {
    console.error(`Chi tiết lỗi API SignOut ngầm:`, error.response?.data || error.message);
  } finally {
    
    set({
    user: null,
    accessToken: null,
    loading: false,
    error: null
  });
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
            const {accessToken} = data;
            set({
                accessToken: newAccessToken,
             });

            const meData = await authService.authMe(newAccessToken);
            const {user} = meData.user;
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