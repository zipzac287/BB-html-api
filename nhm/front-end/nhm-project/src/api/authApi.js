import axios from "axios";

const BASE_URL = 'http://localhost:5001/api/auth';

export const authApi = {
    signup: async (userData) => {
        const res = await axios.post(`${BASE_URL}/signup`,userData, {
            withCredentials: true
        });
        return res.data;
    }
};