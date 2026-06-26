import axios from 'axios';

const api = axios.create({
    BASE_URL: import.meta.env.MODE === 'development' ? 'http://localhost:5001/api' : 'http://localhost:5001/api',
    withCredentials: true,
});
export default api;