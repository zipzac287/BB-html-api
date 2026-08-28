import api from '@/lib/axios';

const BASE_URL = 'http://localhost:5001';
const ENDPOINT = `${BASE_URL}/api/xetNghiem`;

export const getXetNghiem = async (filter = {}) => {
    const response = await api.get(ENDPOINT, filter);
    return response;
};
export const createXetNghiem = async (data) => {
    const response = await api.post(ENDPOINT, data);
    return response;
};
export const updateXN = async (_id,formData) => {
    const response = await api.put(ENDPOINT/`${_id}`,formData);
    return response;
};
export const deleteXN = async (_id) => {
    const response = await api.delete(ENDPOINT/`${_id}`);
    return true;
};

const useXNService = { getXetNghiem, createXetNghiem, updateXN, deleteXN};
export default useXNService;
