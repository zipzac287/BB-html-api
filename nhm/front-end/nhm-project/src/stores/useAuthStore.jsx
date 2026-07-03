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
    set({
    user: null,
    accessToken: null,
    loading: false,
    error: null
  });

  // 2. XÓA SẠCH BỘ NHỚ LƯU TRỮ CỨNG DƯỚI LOCALSTORAGE
  try {
    localStorage.removeItem('nganhangmau-auth-storage'); // Cách xóa trực tiếp, an toàn tuyệt đối không lo lỗi thư viện
  } catch (e) {
    console.error("Lỗi xóa localStorage:", e);
  }

  // 3. CHẠY NGẦM GỌI API SANG BACKEND (DÙ THÀNH CÔNG HAY THẤT BẠI THÌ USER ĐÃ THOÁT)
  try {
    await authService.signOut();
  } catch (error) {
    console.error(`Chi tiết lỗi API SignOut ngầm:`, error.response?.data);
  }
},
    }),
    {
        name: 'nganhangmau-auth-storage', // Tên key lưu trữ dưới LocalStorage của trình duyệt
    }
));