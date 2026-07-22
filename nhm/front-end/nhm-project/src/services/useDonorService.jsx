import axios from 'axios';
import api from '@/lib/axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5001';
const ENDPOINT = `${BASE_URL}/api/Donor`;

// Tạo một cấu hình Axios instance riêng cho Donor API
const apiClient = axios.create({
  baseURL: ENDPOINT,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const toPayload = (formData) => ({
  donor_id:       formData.cccd,
  donor_name:     formData.hoTen,
  donor_ngaysinh: formData.ngaySinh,
  donor_sex:      formData.gioiTinh,
  donor_diachi:   formData.diaChi,
  donor_email:    formData.email,
  donor_phone:    formData.soDienThoai,
  donor_abo:      formData.nhomMau,
  donor_rhd:      formData.rhd ?? '+',
  donor_trihoan:  formData.tinhTrangSucKhoe || null,
});

export const fromResponse = (doc) => ({
  id:              doc._id,
  donorId:         doc.donor_id,
  hoTen:           doc.donor_name,
  ngaySinh:        doc.donor_ngaysinh ? doc.donor_ngaysinh.slice(0, 10) : '',
  gioiTinh:        doc.donor_sex,
  cccd:            doc.donor_id,
  soDienThoai:     doc.donor_phone ?? '',
  email:           doc.donor_email ?? '',
  diaChi:          doc.donor_diachi ?? '',
  nhomMau:         doc.donor_abo,
  rhd:             doc.donor_rhd,
  nhomMauDay:      `${doc.donor_abo}${doc.donor_rhd}`,
  tinhTrang:       doc.donor_trihoan,
  createdAt:       doc.createdAt,
  updatedAt:       doc.updatedAt,
});

// ─────────────────────────────────────────────────────────────
// API FUNCTIONS (Bằng Axios)
// ─────────────────────────────────────────────────────────────

export const getAll = async (filters = {}) => {
  // Loại bỏ key rỗng
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== '' && v != null)
  );

  // Axios tự bọc URLSearchParams tự động thông qua cấu hình `params`
  const response = await api.get('/', { params: cleanFilters });
  const json = response.data;

  return {
    count: json.count,
    data:  json.data.map(fromResponse),
  };
};

export const getById = async (cccd) => {
  // Gửi qua query param giống cấu hình cũ của bạn
  const response = await api.get('/Donor', { 
    params: { donor_id: cccd } 
  });
  const json = response.data;

  if (!json.data?.length) return null;
  return fromResponse(json.data[0]);
};

export const create = async (formData) => {
  const payload = toPayload(formData);
  const response = await api.post('/Donor', payload);
  return fromResponse(response.data.data);
};

export const update = async (donorId, formData) => {
  const payload = toPayload(formData);
  const response = await apiClient.put(`/${encodeURIComponent(donorId)}`, payload);
  return fromResponse(response.data.data);
};

export const remove = async (donorId) => {
  await apiClient.delete(`/${encodeURIComponent(donorId)}`);
};

const donorService = { getAll, getById, create, update, remove, toPayload, fromResponse };
export default donorService;