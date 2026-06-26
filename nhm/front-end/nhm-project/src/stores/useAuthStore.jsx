import { create } from 'zustand';
import { toast } from 'sonner';
import axios from 'axios';
import { persist } from 'zustand/middleware';
import { authService } from '@/services/authService';

const BASE_URL = 'http://localhost:5001/api/auth';


export const useAuthStore = create(
    persist(
        (set,get) => ({
    accessToken: null,
    user: null,
    loading: false,
    error: null,

    signUp: async ({username,password}) => {

        try {
            set({loading: true, error: null});

            await authService.signUp(username,password);

            toast.success('Đăng ký thành công!')
        } catch (error) {
            console.error(`Chi tiết lỗi API:`, error.response?.data);
            toast.error('Lỗi khi đăng ký tài khoản')
        } finally {
            set({ loading: false});
        }
    },
    signIn: async (credentials) => {
        
        try {
            set({loading: true, error: null});
            const {accessToken} = await authService.signIn(credentials);
            set({accessToken:res.data.accessToken,user: res.data.user, loading:false});
            
        } catch (error) {
            console.error(`Chi tiết lỗi API:`, error.response?.data);
            toast.error('Lỗi khi đăng nhập tài khoản')
            set ({
                loading: false,
                error: error.response?.data?.message
            })
        }
    },
    signOut: async () => {
        set({loading: true});
        try {
            await axios.post(`${BASE_URL}/signout`, {}, {
                withCredentials: true,
            });
            set({user: null,loading: false,error: null})
        } catch (error) {
            console.error(`Chi tiết lỗi API:`, error.response?.data);
    }
    },
    }),
    {
        name: 'nganhangmau-auth-storage', // Tên key lưu trữ dưới LocalStorage của trình duyệt
    }
));