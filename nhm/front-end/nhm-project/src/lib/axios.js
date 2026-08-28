
import axios from 'axios';
import { useAuthStore } from '@/stores/useAuthStore';
import createAuthRefreshInterceptor from 'axios-auth-refresh';

const api = axios.create({
    baseURL: 'http://localhost:5001/api',
    withCredentials: true,
});
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const refreshAuthLogic = async (failedRequest) => {
    try {
        
        // Gọi API refresh token của Backend bằng thực thể axios gốc (tránh lặp vô hạn)
        const response = await axios.post('http://localhost:5001/api/auth/refresh-token', {}, { withCredentials: true });
        const { accessToken } = response.data;

        // Lưu Token mới vào bộ nhớ
        useAuthStore.getState().setAccessToken(accessToken);

        // 🚀 CẬP NHẬT LẠI TOKEN MỚI CHO CHÍNH REQUEST BỊ LỖI BAN ĐẦU
        failedRequest.response.config.headers['Authorization'] = `Bearer ${accessToken}`;
        return Promise.resolve();
    } catch (error) {
        useAuthStore.getState().signOut();

        if(window.location.pathname !== '/login') {
            window.Location.href = '/login';
        };
        return Promise.reject(error);
    }
};

createAuthRefreshInterceptor(api, refreshAuthLogic, {
    statusCodes: [401], 
    pauseInstanceWhileRefreshing: true ,
    shouldResetQueryChain: false,
    skipWhileRefreshing: true,// Chặn các request chức năng khác lại, đợi lấy xong token mới cho đi tiếp
});
export default api;