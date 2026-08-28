import axios from 'axios';
import api from '@/lib/axios';

const BASE_URL = 'http://localhost:5001';
const ENDPOINT = `${BASE_URL}/api/donorsessions`;

const apiClient = axios.create({
  baseURL: ENDPOINT,
  headers: {
    'Content-Type': 'application/json',
  },
});
export const toPayload = (formData) => ({
    _id: formData._id,
    donor_id: formData.donor_id,
    ngayhien: formData.ngayhien,
    thetichhien: formData.thetichhien,
    ha_tthu: formData.ha_tthu,
    ha_ttruong: formData.ha_ttruong,
    nhiptim: formData.nhiptim,
    cannang: formData.cannang,
    hb: formData.hb,
    hbtest: formData.hbtest,
    trihoan: formData.trihoan,
    ngaytrihoan: formData.ngaytrihoan,
    lidotrihoan: formData.lidotrihoan,
    mstui: formData.mstui,
    loaicp: formData.loaicp,
});
export const getbyId = async (donor_id) => {
        const data = await api.get(`${ENDPOINT}/${donor_id}`);
        
        return data.data;
        };
export const createsession = async (formData) => {
  const data = await api.post(`${ENDPOINT}`, formData);

  return data.data;
};
export const updatesession = async (formData, donor_id) => {
  const data = await api.put(`${ENDPOINT}/${donor_id}`, formData);
  return data.data;

};
export const deletesession = async (_id) => {
  const result = await api.delete(`${ENDPOINT}/${_id}`);
  return result;
};
export const getsession = async (filter = {}) => {

  const response = await api.get(`${ENDPOINT}`, filter);
  const json = response.data;
  return {
    count: json.count,
    data: json.data,
  }
};
export const updatedsid = async (_id,matm) => {
  const response = await api.put(`${ENDPOINT}/update`, { _id,matm });
  return response;
}

const useDonorSesService = { toPayload, getbyId, getsession, deletesession, updatesession, updatedsid };
export default useDonorSesService;