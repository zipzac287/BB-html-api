import api from '@/lib/axios';

const BASE_URL = 'http://localhost:5001';
const ENDPOINT = `${BASE_URL}/api/TuiMau`;

export const getTuiMau = async (filter = {}) => {
  const cleanFilters = Object.fromEntries(
    Object.entries(filter).filter(([, v]) => v !== '' && v != null && v !== 'all')
  );
  const response = await api.get(ENDPOINT, { params: cleanFilters });
  return response.data;
};

export const createTuiMau = async (data) => {
  const response = await api.post(ENDPOINT, data);
  return response.data;
};

export const updateTuiMau = async (matm, data) => {
  const response = await api.put(`${ENDPOINT}/${matm}`, data);
  return response.data;
};

export const deleteTuiMau = async (matm) => {
  const response = await api.delete(`${ENDPOINT}/${matm}`);
  return response.data;
};
export const updateTM = async (matm,_id) => {
  const response = await api.put(`${ENDPOINT}`,{matm,_id});
  return response.data;
};
export const splitTM = async (tuichaid, tuicon) => {
  const response = await api.post(`${ENDPOINT}/chiet-tach`,{tuichaid, tuicon});
  return response.data;
};

const useTuiMauService = {
  getTuiMau,
  createTuiMau,
  updateTuiMau,
  deleteTuiMau,
  updateTM,
  splitTM,
};

export default useTuiMauService;
