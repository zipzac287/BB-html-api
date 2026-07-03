// services/donorService.js
// Tầng giao tiếp với backend API — tách biệt hoàn toàn khỏi UI

const BASE_URL = import.meta.env.VITE_API_URL ?? 'mongodb://localhost:27017/';
const ENDPOINT = `${BASE_URL}/api/Donor`;

// ─────────────────────────────────────────────────────────────
// MAPPER: chuyển đổi giữa form state (frontend) ↔ schema (backend)
// ─────────────────────────────────────────────────────────────

/**
 * formData  →  body gửi lên backend
 * Khớp với donorSchema fields
 */
export const toPayload = (formData) => ({
  donor_id:       formData.cccd,            // CCCD dùng làm donor_id
  donor_name:     formData.hoTen,
  donor_ngaysinh: formData.ngaySinh,        // ISO string hoặc Date
  donor_sex:      formData.gioiTinh,        // 'Nam' | 'Nữ' | 'Khác'
  donor_diachi:   formData.diaChi,
  donor_email:    formData.email,
  donor_phone:    formData.soDienThoai,
  donor_abo:      formData.nhomMau,         // 'A' | 'B' | 'AB' | 'O'
  donor_rhd:      formData.rhd ?? '+',      // '+' | '-'
  donor_trihoan:  formData.tinhTrangSucKhoe || null,
});

/**
 * response từ backend  →  object thân thiện với UI
 */
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
  nhomMauDay:      `${doc.donor_abo}${doc.donor_rhd}`,  // "A+", "O-"…
  tinhTrang:       doc.donor_trihoan,
  createdAt:       doc.createdAt,
  updatedAt:       doc.updatedAt,
});

// ─────────────────────────────────────────────────────────────
// HELPER: xử lý response thống nhất
// ─────────────────────────────────────────────────────────────

const handleResponse = async (res) => {
  const json = await res.json();
  if (!res.ok || json.success === false) {
    // Ném lỗi với message từ backend để store bắt được
    throw new Error(json.message ?? `HTTP ${res.status}`);
  }
  return json;
};

// ─────────────────────────────────────────────────────────────
// API FUNCTIONS
// ─────────────────────────────────────────────────────────────

/**
 * GET /api/Donor
 * Lấy danh sách, hỗ trợ filter qua query params
 *
 * @param {Object} filters - ví dụ: { donor_abo: 'A', donor_rhd: '+' }
 * @returns {Promise<{ count: number, data: Array }>}
 *
 * Ví dụ gọi:
 *   const { data } = await donorService.getAll({ donor_abo: 'O' });
 */
export const getAll = async (filters = {}) => {
  // Loại bỏ key có giá trị rỗng trước khi build query string
  const clean = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== '' && v != null)
  );
  const qs = new URLSearchParams(clean).toString();
  const url = qs ? `${ENDPOINT}?${qs}` : ENDPOINT;

  const res  = await fetch(url);
  const json = await handleResponse(res);

  return {
    count: json.count,
    data:  json.data.map(fromResponse),
  };
};

/**
 * GET /api/Donor?donor_id=xxx  (lọc theo 1 donor)
 * Backend hiện dùng find(queryFilter) nên ta filter qua query
 *
 * @param {string} donorId
 * @returns {Promise<Object|null>}
 */
export const getById = async (donorId) => {
  const res  = await fetch(`${ENDPOINT}?donor_id=${encodeURIComponent(donorId)}`);
  const json = await handleResponse(res);

  if (!json.data?.length) return null;
  return fromResponse(json.data[0]);
};

/**
 * POST /api/Donor
 * Tạo người hiến máu mới
 *
 * @param {Object} formData - Zustand formData
 * @returns {Promise<Object>} donor đã tạo (đã map về UI format)
 *
 * Ví dụ gọi:
 *   const donor = await donorService.create(formData);
 */
export const create = async (formData) => {
  const payload = toPayload(formData);

  const res = await fetch(ENDPOINT, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });

  const json = await handleResponse(res);
  return fromResponse(json.data);
};

/**
 * PUT /api/Donor/:id
 * Cập nhật thông tin người hiến
 *
 * @param {string} donorId  - donor_id (CCCD)
 * @param {Object} formData - Zustand formData (có thể partial)
 * @returns {Promise<Object>} donor đã cập nhật
 */
export const update = async (donorId, formData) => {
  const payload = toPayload(formData);

  const res = await fetch(`${ENDPOINT}/${encodeURIComponent(donorId)}`, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });

  const json = await handleResponse(res);
  return fromResponse(json.data);
};

/**
 * DELETE /api/Donor/:id
 *
 * @param {string} donorId
 * @returns {Promise<void>}
 */
export const remove = async (donorId) => {
  const res = await fetch(`${ENDPOINT}/${encodeURIComponent(donorId)}`, {
    method: 'DELETE',
  });
  await handleResponse(res);
};

// Xuất gom lại để import gọn
const donorService = { getAll, getById, create, update, remove, toPayload, fromResponse };
export default donorService;