import { create } from 'zustand';
import { toast } from 'sonner';

export const useAuthStore = create((set,get) => ({
    accessToken: null,
    user: null,
    loading: false

    signUp: async (username,password) => {
        try {
            set({loading: true});


            toast.success('Đăng ký thành công!')
        } catch (error) {
            console.error(error);
            toast.error('Lỗi khi đăng ký tài khoản')
        } finally {
            set({ loading: false});
        }
    }
}))