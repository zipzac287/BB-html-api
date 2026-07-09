
import axios from 'axios';
import { useAuthStore } from '@/stores/useAuthStore';

const api = axios.create({
    baseURL: 'http://localhost:5001/api',
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    // 🚀 KIỂM TRA: Nếu request có gắn cờ skipAuth: true thì BỎ QUA không gắn Token
    if (config.skipAuth) {
        return config;
    }

    const token = useAuthStore.getState().accessToken;
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
        } else {
            console.log("CẢNH BÁO: Không tìm thấy token trong localStorage khi gọi API:", config.url);
    }
    return config;
});

export default api;