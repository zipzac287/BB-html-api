import { create } from 'zustand';
import { toast } from 'sonner';
import axios from 'axios';
import { persist } from 'zustand/middleware';
import { authService } from '@/services/authService';


export const useAuthStore = create(
    persist(
        (set,get) => ({
    accessToken: null,
    user: null,
    loading: false,
    error: null,

    signUp: async (data) => {

        try {
            set({loading: true, error: null});

            await authService.signUp(data);

            toast.success('Đăng ký thành công!')
        } catch (error) {
            console.error(`Chi tiết lỗi API:`, error.response?.data);
            toast.error('Lỗi khi đăng ký tài khoản');
            throw error;
        } finally {
            set({ loading: false});
        }
    },
    signIn: async (credentials) => {
        
        try {
            set({loading: true, error: null});
            const data = await authService.signIn(credentials);
            set({
                accessToken: data.accessToken,
                user: data.user,
                loading:false
            });
            
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
        
        try {
            set({loading: true});
            await authService.signOut();
        
        } catch (error) {
            console.error(`Chi tiết lỗi API:`, error.response?.data);
    } finally {
        set({
            user: null,
            accessToken: null,
            loading: false,
            error: null
        });
        toast.success("Đã đăng xuất tài khoản!")
    }
    },
    }),
    {
        name: 'nganhangmau-auth-storage', // Tên key lưu trữ dưới LocalStorage của trình duyệt
    }
));