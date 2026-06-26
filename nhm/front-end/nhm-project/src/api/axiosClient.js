import axios from 'axios';
import { useAuthStore } from '@/stores/useAuthStore';

const axiosClient = axios.create({
    BASE_URL : 'http://localhost:5001/api',
});

axiosClient.interceptors.request.use(
    (config) => {
        //lấy token từ ram của zustand
        const token = useAuthStore.getState().accessToken;

        if (token) {
            config.headers.Authorization = 'Bearer ${token}';
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
export default axiosClient;
