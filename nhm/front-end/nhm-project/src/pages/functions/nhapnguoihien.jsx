import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Phone, Mail, MapPin, Droplets,
  Calendar, CreditCard, AlertCircle,
  CheckCircle2, Loader2, RotateCcw, Save,
  ArrowLeft, HeartPulse, Info,
} from "lucide-react";

import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

import { z } from "zod";
import { useDonorStore } from "@/stores/useDonorStore";

// ─── Constants ───────────────────────────────────────────────

const ABO_LIST = ["A", "B", "AB", "O"];

const ABO_STYLE = {
  A:  { border: "#dc2626", bg: "rgba(220,38,38,0.08)",  text: "#b91c1c", ring: "rgba(220,38,38,0.3)"  },
  B:  { border: "#ea580c", bg: "rgba(234,88,12,0.08)",  text: "#c2410c", ring: "rgba(234,88,12,0.3)"  },
  AB: { border: "#7c3aed", bg: "rgba(124,58,237,0.08)", text: "#6d28d9", ring: "rgba(124,58,237,0.3)" },
  O:  { border: "#0369a1", bg: "rgba(3,105,161,0.08)",  text: "#075985", ring: "rgba(3,105,161,0.3)"  },
};

const BLOOD_NOTE = {
  "O-":  "Người cho phổ thông — hiến được cho tất cả nhóm máu",
  "AB+": "Người nhận phổ thông — nhận được từ tất cả nhóm máu",
};

// ─── Validation (Zod) ────────────────────────────────────────

const donorSchema = z.object({
  hoTen: z
    .string()
    .min(1, "Họ tên không được để trống.")
    .min(2, "Họ tên quá ngắn.")
    .trim(),

  ngaySinh: z
    .string()
    .min(1, "Vui lòng chọn ngày sinh.")
    .refine((val) => {
      const age = Math.floor((Date.now() - new Date(val)) / 3.156e10);
      return age >= 17;
    }, "Người hiến phải đủ 17 tuổi.")
    .refine((val) => {
      const age = Math.floor((Date.now() - new Date(val)) / 3.156e10);
      return age <= 70;
    }, "Người hiến không quá 70 tuổi."),

  cccd: z
    .string()
    .min(1, "Số CCCD không được để trống.")
    .regex(/^\d{9,12}$/, "CCCD phải là 9–12 chữ số.")
    .trim(),

  soDienThoai: z
    .string()
    .trim()
    .refine(
      (val) => val === "" || /^(0|\+84)\d{8,9}$/.test(val),
      "Số điện thoại không hợp lệ."
    ),

  email: z
    .string()
    .trim()
    .refine(
      (val) => val === "" || z.string().email().safeParse(val).success,
      "Email không hợp lệ."
    ),

  nhomMau: z
    .string()
    .refine(
      (val) => ["A", "B", "AB", "O"].includes(val),
      "Vui lòng chọn nhóm máu ABO."
    ),

  // các field còn lại không cần validate — luôn pass
  gioiTinh:         z.string().optional(),
  rhd:              z.string().optional(),
  diaChi:           z.string().optional(),
  tinhTrangSucKhoe: z.string().optional(),
});

// Chạy zod parse, trả về object { field: "message" } giống API cũ
function validate(fd) {
  const result = donorSchema.safeParse(fd);
  if (result.success) return {};

  return result.error.issues.reduce((acc, issue) => {
    const field = issue.path[0];
    // Chỉ giữ lỗi đầu tiên của mỗi field
    if (field && !acc[field]) acc[field] = issue.message;
    return acc;
  }, {});
}

// ─── FieldGroup ──────────────────────────────────────────────

function FieldGroup({ label, required, hint, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
      {hint && !error && (
        <p className="flex items-center gap-1 text-xs text-gray-400">
          <Info size={11} />
          {hint}
        </p>
      )}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500">
          <AlertCircle size={11} />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── SectionCard ─────────────────────────────────────────────

function SectionCard({ icon: Icon, title, desc, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="h-0.5 w-full bg-gradient-to-r from-red-600 via-red-400 to-transparent" />
      <div className="p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-red-50 border border-red-100">
            <Icon size={16} className="text-red-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 leading-none">{title}</p>
            {desc && <p className="text-xs text-gray-400 mt-1">{desc}</p>}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── SummaryRow ──────────────────────────────────────────────

function SummaryRow({ label, value, accent }) {
  return (
    <div className="flex justify-between items-baseline gap-2 py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-400 shrink-0">{label}</span>
      <span
        className={`text-right text-xs truncate max-w-[58%] ${
          accent
            ? "text-red-600 font-bold text-sm"
            : "text-gray-700 font-medium"
        }`}
      >
        {value || <span className="text-gray-300">—</span>}
      </span>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────

export default function NhapNguoiHien() {
  const navigate = useNavigate();
  const alertRef = useRef(null);
  const [vErr, setVErr] = useState({});

  const {
    formData,
    updateField,
    resetForm,
    createDonor,
    loading,
    error,
    success,
    clearMessages,
  } = useDonorStore();

  useEffect(() => {
    if (success || error)
      alertRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [success, error]);

  useEffect(() => () => clearMessages(), [clearMessages]);

  const set = (name) => (e) => {
    updateField(name, e.target.value);
    if (vErr[name]) setVErr((p) => ({ ...p, [name]: undefined }));
  };

  const setDirect = (name, value) => {
    updateField(name, value);
    if (vErr[name]) setVErr((p) => ({ ...p, [name]: undefined }));
  };

  const handleReset = () => {
    resetForm();
    setVErr({});
    clearMessages();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    const errors = validate(formData);
    if (Object.keys(errors).length) {
      setVErr(errors);
      document.getElementById(`f-${Object.keys(errors)[0]}`)?.focus();
      return;
    }
    setVErr({});
    const ok = await createDonor();
    if (ok) setTimeout(() => navigate("/donors"), 1800);
  };

  const hasBlood = formData.nhomMau && formData.nhomMau !== "Chưa xác định";
  const bloodKey = `${formData.nhomMau}${formData.rhd}`;

  // input className helper — error state đổi border đỏ
  const inputCls = (name) =>
    vErr[name]
      ? "border-red-400 focus-visible:ring-red-400"
      : "border-gray-300 focus-visible:ring-red-400";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-5">

        {/* ── Header ── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="text-gray-500 hover:text-gray-800 hover:bg-gray-100"
            >
              <ArrowLeft size={18} />
            </Button>
            <div>
              <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900 tracking-tight">
                <Droplets size={20} className="text-red-600" />
                Nhập người hiến máu
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Đăng ký người hiến mới vào hệ thống ngân hàng máu
              </p>
            </div>
          </div>

          {/* Blood badge preview */}
          {hasBlood && (
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-base border-2 transition-all"
              style={{
                color:       ABO_STYLE[formData.nhomMau].text,
                borderColor: ABO_STYLE[formData.nhomMau].border,
                background:  ABO_STYLE[formData.nhomMau].bg,
                boxShadow:   `0 0 16px ${ABO_STYLE[formData.nhomMau].ring}`,
              }}
            >
              {formData.nhomMau}{formData.rhd}
            </div>
          )}
        </div>

        {/* ── Alerts ── */}
        <div ref={alertRef}>
          {success && (
            <Alert className="border-green-300 bg-green-50 text-green-800">
              <CheckCircle2 size={16} className="text-green-600" />
              <AlertDescription className="flex flex-col gap-0.5">
                <span className="font-semibold text-green-800">{success}</span>
                <span className="text-xs text-green-600">Đang chuyển về danh sách…</span>
              </AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert className="border-red-300 bg-red-50 text-red-800">
              <AlertCircle size={16} className="text-red-500" />
              <AlertDescription className="flex flex-col gap-0.5">
                <span className="font-semibold text-red-700">Lỗi từ máy chủ</span>
                <span className="text-xs text-red-500">{error}</span>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5">

            {/* ═══ CỘT TRÁI ════════════════════════════════════ */}
            <div className="flex flex-col gap-5">

              {/* Card 1: Thông tin cá nhân */}
              <SectionCard icon={User} title="Thông tin cá nhân" desc="Họ tên, CCCD, ngày sinh, giới tính">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <FieldGroup label="Họ và tên" required error={vErr.hoTen}>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <Input
                        id="f-hoTen"
                        value={formData.hoTen}
                        onChange={set("hoTen")}
                        disabled={loading}
                        placeholder="Nguyễn Văn A"
                        className={`pl-9 text-gray-800 placeholder:text-gray-400 ${inputCls("hoTen")}`}
                        autoComplete="name"
                      />
                    </div>
                  </FieldGroup>

                  <FieldGroup
                    label="Số CCCD / Định danh"
                    required
                    hint="Dùng làm mã định danh duy nhất"
                    error={vErr.cccd}
                  >
                    <div className="relative">
                      <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <Input
                        id="f-cccd"
                        value={formData.cccd}
                        onChange={set("cccd")}
                        disabled={loading}
                        placeholder="0123456789"
                        inputMode="numeric"
                        maxLength={12}
                        className={`pl-9 text-gray-800 placeholder:text-gray-400 ${inputCls("cccd")}`}
                      />
                    </div>
                  </FieldGroup>

                  <FieldGroup
                    label="Ngày sinh"
                    required
                    hint="Người hiến từ 17 – 70 tuổi"
                    error={vErr.ngaySinh}
                  >
                    <div className="relative">
                      <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <Input
                        id="f-ngaySinh"
                        type="date"
                        value={formData.ngaySinh}
                        onChange={set("ngaySinh")}
                        disabled={loading}
                        max={new Date().toISOString().slice(0, 10)}
                        className={`pl-9 text-gray-800 ${inputCls("ngaySinh")}`}
                      />
                    </div>
                  </FieldGroup>

                  <FieldGroup label="Giới tính" required>
                    <Select
                      value={formData.gioiTinh}
                      onValueChange={(v) => setDirect("gioiTinh", v)}
                      disabled={loading}
                    >
                      <SelectTrigger className="border-gray-300 text-gray-800 focus:ring-red-400 h-10 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Nam">Nam</SelectItem>
                        <SelectItem value="Nữ">Nữ</SelectItem>
                        <SelectItem value="Khác">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldGroup>

                </div>
              </SectionCard>

              {/* Card 2: Liên hệ */}
              <SectionCard icon={Phone} title="Thông tin liên hệ" desc="Điện thoại, email, địa chỉ (không bắt buộc)">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <FieldGroup label="Số điện thoại" error={vErr.soDienThoai}>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <Input
                        id="f-soDienThoai"
                        value={formData.soDienThoai}
                        onChange={set("soDienThoai")}
                        disabled={loading}
                        placeholder="0901234567"
                        inputMode="tel"
                        className={`pl-9 text-gray-800 placeholder:text-gray-400 ${inputCls("soDienThoai")}`}
                      />
                    </div>
                  </FieldGroup>

                  <FieldGroup label="Email" error={vErr.email}>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <Input
                        id="f-email"
                        type="email"
                        value={formData.email}
                        onChange={set("email")}
                        disabled={loading}
                        placeholder="example@email.com"
                        className={`pl-9 text-gray-800 placeholder:text-gray-400 ${inputCls("email")}`}
                      />
                    </div>
                  </FieldGroup>

                  <div className="sm:col-span-2">
                    <FieldGroup label="Địa chỉ">
                      <div className="relative">
                        <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <Input
                          id="f-diaChi"
                          value={formData.diaChi}
                          onChange={set("diaChi")}
                          disabled={loading}
                          placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                          className="pl-9 text-gray-800 placeholder:text-gray-400 border-gray-300 focus-visible:ring-red-400"
                        />
                      </div>
                    </FieldGroup>
                  </div>

                </div>
              </SectionCard>

              {/* Card 3: Sức khoẻ */}
              <SectionCard icon={HeartPulse} title="Tình trạng sức khoẻ" desc="Ghi chú trì hoãn hoặc chống chỉ định nếu có">
                <FieldGroup
                  label="Lý do trì hoãn / Ghi chú y tế"
                  hint="Để trống nếu người hiến đủ điều kiện bình thường"
                >
                  <Textarea
                    id="f-tinhTrangSucKhoe"
                    value={formData.tinhTrangSucKhoe}
                    onChange={set("tinhTrangSucKhoe")}
                    disabled={loading}
                    rows={3}
                    placeholder="VD: Đang dùng thuốc kháng sinh, vừa phẫu thuật, huyết áp cao…"
                    className="text-gray-800 placeholder:text-gray-400 border-gray-300 focus-visible:ring-red-400 resize-none text-sm"
                  />
                </FieldGroup>
              </SectionCard>

            </div>

            {/* ═══ CỘT PHẢI ════════════════════════════════════ */}
            <div className="flex flex-col gap-5">

              {/* Card: Nhóm máu */}
              <SectionCard icon={Droplets} title="Nhóm máu" desc="Chọn ABO và Rh factor">

                {/* ABO */}
                <div className="flex flex-col gap-2 mb-4">
                  <Label className="text-sm font-medium text-gray-700">
                    Nhóm máu ABO <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-4 gap-2">
                    {ABO_LIST.map((type) => {
                      const s        = ABO_STYLE[type];
                      const selected = formData.nhomMau === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          disabled={loading}
                          onClick={() => setDirect("nhomMau", type)}
                          className="h-11 rounded-lg font-bold text-sm border-2 transition-all duration-150 cursor-pointer disabled:opacity-40"
                          style={{
                            color:       selected ? s.text  : "#9ca3af",
                            borderColor: selected ? s.border : "#e5e7eb",
                            background:  selected ? s.bg    : "transparent",
                            boxShadow:   selected ? `0 0 10px ${s.ring}` : "none",
                            transform:   selected ? "scale(1.06)" : "scale(1)",
                          }}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                  {vErr.nhomMau && (
                    <p className="flex items-center gap-1 text-xs text-red-500">
                      <AlertCircle size={11} />
                      {vErr.nhomMau}
                    </p>
                  )}
                </div>

                {/* Rh factor */}
                <div className="flex flex-col gap-2 mb-4">
                  <Label className="text-sm font-medium text-gray-700">
                    Rh Factor <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {["+", "-"].map((rh) => {
                      const selected = formData.rhd === rh;
                      const isPos    = rh === "+";
                      return (
                        <button
                          key={rh}
                          type="button"
                          disabled={loading}
                          onClick={() => updateField("rhd", rh)}
                          className="h-10 rounded-lg font-bold text-base border-2 transition-all duration-150 cursor-pointer disabled:opacity-40"
                          style={{
                            color:       selected ? (isPos ? "#15803d" : "#dc2626") : "#9ca3af",
                            borderColor: selected ? (isPos ? "#16a34a" : "#dc2626") : "#e5e7eb",
                            background:  selected ? (isPos ? "rgba(22,163,74,0.08)" : "rgba(220,38,38,0.08)") : "transparent",
                            boxShadow:   selected ? (isPos ? "0 0 10px rgba(22,163,74,0.25)" : "0 0 10px rgba(220,38,38,0.25)") : "none",
                            transform:   selected ? "scale(1.04)" : "scale(1)",
                          }}
                        >
                          Rh {rh}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Preview */}
                {hasBlood && (
                  <div className="flex flex-col items-center gap-2 pt-4 border-t border-gray-100">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest">
                      Xác nhận nhóm máu
                    </span>
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center font-bold text-xl border-2 transition-all"
                      style={{
                        color:       ABO_STYLE[formData.nhomMau].text,
                        borderColor: ABO_STYLE[formData.nhomMau].border,
                        background:  ABO_STYLE[formData.nhomMau].bg,
                        boxShadow:   `0 0 20px ${ABO_STYLE[formData.nhomMau].ring}`,
                      }}
                    >
                      {formData.nhomMau}{formData.rhd}
                    </div>
                    <p className="text-xs text-gray-500 text-center leading-snug">
                      {BLOOD_NOTE[bloodKey] ?? `Nhóm ${formData.nhomMau}${formData.rhd}`}
                    </p>
                  </div>
                )}

              </SectionCard>

              {/* Card: Xem trước + Submit */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 sticky top-4 flex flex-col gap-4">
                <p className="text-sm font-semibold text-gray-800">Xem trước</p>

                <div className="flex flex-col">
                  <SummaryRow label="Họ tên"     value={formData.hoTen} />
                  <SummaryRow label="CCCD"        value={formData.cccd} />
                  <SummaryRow
                    label="Ngày sinh"
                    value={
                      formData.ngaySinh
                        ? new Date(formData.ngaySinh).toLocaleDateString("vi-VN")
                        : ""
                    }
                  />
                  <SummaryRow label="Giới tính"   value={formData.gioiTinh} />
                  <SummaryRow label="Điện thoại"  value={formData.soDienThoai} />
                  <SummaryRow label="Email"        value={formData.email} />
                  <SummaryRow
                    label="Nhóm máu"
                    value={hasBlood ? `${formData.nhomMau}${formData.rhd}` : ""}
                    accent
                  />
                </div>

                <Separator />

                <div className="flex flex-col gap-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-10 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm gap-2"
                  >
                    {loading ? (
                      <><Loader2 size={15} className="animate-spin" />Đang lưu…</>
                    ) : (
                      <><Save size={15} />Lưu người hiến</>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    disabled={loading}
                    onClick={handleReset}
                    className="w-full h-9 text-gray-500 hover:text-gray-700 hover:bg-gray-100 text-sm gap-2"
                  >
                    <RotateCcw size={13} />
                    Nhập lại
                  </Button>
                </div>

                <p className="text-xs text-gray-400 text-center">
                  Trường có dấu <span className="text-red-500">*</span> là bắt buộc
                </p>
              </div>

            </div>
          </div>
        </form>

      </div>
    </div>
  );
}