import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { 
  PlusCircle, 
  Search, 
  RotateCcw, 
  Droplet, 
  Box, 
  Calendar, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  Filter,
  Trash2,
  Edit,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTuiMauStore } from "@/stores/useTuiMauStore";
import { useDonorSesStore } from "@/stores/useDonorSesStore";
import { updateTuiMau } from "@/services/useTuiMauService";

// Zod Schema cho validation form nhập túi máu
const tuiMauSchema = z.object({
  matm: z.string().min(1, "Vui lòng nhập hoặc sinh mã túi máu"),
  com_type: z.string(),
  blood_type: z.string(),
  rhd: z.string(),
  thetich: z.string(),
  ngayhien: z.string(),
  hsd: z.string(),
  location: z.string(),
  tinhtrang: z.string().default("Nhập kho thô"),
});

export default function NhapTTTho() {
  const [submitting, setSubmitting] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [matmchon, setMatmchon] = useState("");

  // Filter Form State
  const [filterMatm, setFilterMatm] = useState("");
  const [filterComType, setFilterComType] = useState("all");
  const [filterBloodType, setFilterBloodType] = useState("all");
  const [filterRhd, setFilterRhd] = useState("all");
  const [filterngayhien, setFilterngayhien] = useState("");

  const { formData, updateField, tuiMauList, fetchTuiMau, addTuiMau, editTuiMau, removeTuiMau, loading, clearTMList } = useTuiMauStore();
  const { getSession,UpdateDsid } = useDonorSesStore();

  // Form Khởi tạo nhập túi máu
  const form = useForm({
    resolver: zodResolver(tuiMauSchema),
    defaultValues: {
      matm: "",
      com_type: "MTP",
      blood_type: "",
      rhd: "+",
      thetich: "",
      ngayhien: new Date().toISOString().split("T")[0],
      hsd: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      location: "",
      tinhtrang: "Nhập kho thô",
      dsession_id: null,
      parent_id: null,
      split_level: 0,
    },
  });
  const handleFetchTM = () => {
    fetchTuiMau({ tinhtrang: "Nhập kho thô"});
  };

  const filteredList = tuiMauList.filter((item) => {
    // Chỉ hiển thị các túi ở kho thô
    if (item.tinhtrang !== "Nhập kho thô") return false;
    if (item.split_level !== 0) return false;
    if (filterMatm && !item.matm.toLowerCase().includes(filterMatm.toLowerCase())) return false;
    if (filterComType !== "all" && item.com_type !== filterComType) return false;
    if (filterBloodType !== "all" && item.blood_type !== filterBloodType) return false;
    if (filterRhd !== "all" && item.rhd !== filterRhd) return false;
    if (filterngayhien && new Date(item.ngayhien).toISOString().split("T")[0] !== filterngayhien) return false;
    
    return true;
  });
  const tumau = [1,2,3,4,5]

  // Tự động cập nhật Hạn sử dụng khi đổi loại chế phẩm hoặc ngày hiến
  const handleDateOrTypeChange = (newNgayHien, newComType) => {
    if (!newNgayHien) return;
    const baseDate = new Date(newNgayHien);
    let daysToAdd = 42;

    if (newComType === "HTTDL" || newComType === "TL") daysToAdd = 730; 
    if (newComType === "TCGT" || newComType === "TPPOOL") daysToAdd = 5;

    const expiryDate = new Date(baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    form.setValue("hsd", expiryDate.toISOString().split("T")[0], { shouldValidate: true });
  };

  // Xử lý gửi Form Thêm mới túi máu
  const onSubmitForm = async (data) => {
    setSubmitting(true);
    try {
      Object.entries({
      ...data,
      tinhtrang: "Nhập kho thô",
      split_level: 0,
    }).forEach(([key, value]) => {
      updateField(key, value);
    });
      const res = await addTuiMau();
      if (res) {
        const {_id,matm} = res;
        const result = await UpdateDsid(_id,matm);
        console.log(result);
        toast.success(res.message || "Đã lưu túi máu vào kho thô thành công!");
        // Reset form và tự sinh mã mới
        form.reset({
          matm: "",
          com_type: "MTP",
          blood_type: "",
          rhd: "+",
          thetich: "",
          ngayhien: new Date().toISOString().split("T")[0],
          hsd: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          location: "",
          tinhtrang: "Nhập kho thô",
        });
      } else {
        toast.error(res.message || "Không thể lưu túi máu");
      }
    } catch (err) {
      toast.error("Lỗi hệ thống khi nhập túi máu");
    } finally {
      setSubmitting(false);
    }
  };


  const handleRefresh = () => {
    clearTMList();
    form.reset({
          matm: "",
          com_type: "MTP",
          blood_type: "",
          rhd: "+",
          thetich: "",
          ngayhien: new Date().toISOString().split("T")[0],
          hsd: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          location: "",
          tinhtrang: "Nhập kho thô",
        });
  };

  // Chọn / Bỏ chọn tất cả các dòng
  const handleSelectAll = () => {
    if (filteredList.length > 0 && selectedRows.length === filteredList.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredList.map((row) => row.matm));
    }
  };

  // Chọn / Bỏ chọn từng dòng
  const handleSelectRow = (id) => {
  setSelectedRows((prev) => {
    const isSelected = prev.includes(id);
    const matmchon = isSelected 
      ? prev.filter((id) => id !== id) 
      : [...prev, id];
    setMatmchon(matmchon);

    return matmchon;
  });
};

  // Xóa túi máu
  const handleDelete = async (matm) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa túi máu ${matm} khỏi kho thô không?`)) {
      const res = await removeTuiMau(matm);
      if (res.success) {
        toast.success(`Đã xóa túi máu ${matm}`);
        setSelectedRows((prev) => prev.filter((id) => id !== matm));
      } else {
        toast.error(res.message || "Xóa túi máu thất bại");
      }
    }
  };

  // Mở modal sửa
  const handleOpenEdit = (item) => {
    setEditingItem({
      ...item,
      ngayhien: item.ngayhien ? new Date(item.ngayhien).toISOString().split("T")[0] : "",
      hsd: item.hsd ? new Date(item.hsd).toISOString().split("T")[0] : "",
    });
    setIsEditDialogOpen(true);
  };

  // Lưu thông tin chỉnh sửa
  const handleSaveEdit = async () => {
    if (!editingItem) return;
    const res = await editTuiMau(editingItem.matm, editingItem);
    if (res) {
      const {_id,matm} = res.data;
      const result = await UpdateDsid(_id,matm);
      toast.success(`Đã cập nhật thông tin túi máu ${editingItem.matm}`);
      setIsEditDialogOpen(false);
      fetchTuiMau({ tinhtrang: "Nhập kho thô" });
    } else {
      toast.error(res.message || "Cập nhật thất bại");
    }
  };

  const handleTMSession = async () => {
    
    const matmInput = form.getValues("matm");

    if (!matmInput || matmInput.trim() === "") {
      toast.error("Vui lòng nhập mã túi máu trước khi tra cứu");
      return;
    }
    const res = await getSession({ mstui: matmInput.trim() });

    if (!res || !Array.isArray(res) || res.length === 0) {
      toast.error("Không tìm thấy đợt hiến máu nào có mã túi này");
      return;
    }

    const session = res[0];
      form.setValue("com_type", session.loaicp, { shouldValidate: true });


    if (session.donor_id?.donor_abo) {
      form.setValue("blood_type", session.donor_id.donor_abo, { shouldValidate: true });
    }

    // 3. Yếu tố RhD (từ object donor_id)
    if (session.donor_id?.donor_rhd) {
      form.setValue("rhd", session.donor_id.donor_rhd, { shouldValidate: true });
    }

    if (session.ngayhien) {
      const formattedNgayHien = new Date(session.ngayhien).toISOString().split("T")[0];
      form.setValue("ngayhien", formattedNgayHien, { shouldValidate: true });
      handleDateOrTypeChange(formattedNgayHien, session.loaicp || form.getValues("com_type"));
    }

    // 5. Thể tích (thetichhien -> thetich)
    if (session.thetichhien) {
      form.setValue("thetich", String(session.thetichhien), { shouldValidate: true });
    }

    toast.success("Đã tìm thấy & tự động điền thông tin đợt hiến!");
    console.log("Kết quả tra cứu đợt hiến:", session);
  };
  
  return (
    <div className="p-6 max-w-[1500px] mx-auto space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Box className="w-7 h-7 text-red-600" />
            Nhập Trực Tiếp Kho Thô
          </h1>
        </div>

        <Button
          variant="outline"
          onClick={handleRefresh}
          className="flex items-center gap-2 bg-white border-slate-300 shadow-sm"
        >
          <RotateCcw className="w-4 h-4 text-slate-600" />
          Làm mới dữ liệu
        </Button>
      </div>

      {/* Form Nhập Trực Tiếp Túi Máu Kho Thô */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="pb-3 border-b bg-slate-50/50">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-800">
            <PlusCircle className="w-5 h-5 text-red-600" />
            Nhập Thông Tin Túi Máu
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-5">
          <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Mã Túi Máu */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="matm" className="text-xs font-medium text-slate-700">
                    Mã Túi Máu <span className="text-red-500">*</span>
                  </Label>
                </div>
                <Input
                  id="matm"
                  {...form.register("matm")}
                  className="bg-white font-semibold text-red-600 border-slate-300"
                />
                {form.formState.errors.matm && (
                  <p className="text-[11px] text-red-500">{form.formState.errors.matm.message}</p>
                )}
              </div>

              {/* Loại Chế Phẩm Máu */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">
                  Loại Chế Phẩm <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={form.control}
                  name="com_type"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val);
                        handleDateOrTypeChange(form.getValues("ngayhien"), val);
                      }}
                    >
                      <SelectTrigger className="bg-white border-slate-300">
                        <SelectValue placeholder="Chọn loại chế phẩm" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MTP">MTP - Máu toàn phần</SelectItem>
                        <SelectItem value="KHC">KHC - Khối hồng cầu gạn tách</SelectItem>
                        <SelectItem value="HTTDL">HTTDL - Huyết tương gạn tách</SelectItem>
                        <SelectItem value="TCGT">TCGT - Tiểu cầu gạn tách</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Nhóm Máu ABO */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">
                  Nhóm Máu ABO <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={form.control}
                  name="blood_type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-white border-slate-300">
                        <SelectValue placeholder="Chọn nhóm máu" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">Nhóm A</SelectItem>
                        <SelectItem value="B">Nhóm B</SelectItem>
                        <SelectItem value="O">Nhóm O</SelectItem>
                        <SelectItem value="AB">Nhóm AB</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Yếu Tố RhD */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">
                  Yếu Tố RhD <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={form.control}
                  name="rhd"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-white border-slate-300">
                        <SelectValue placeholder="Chọn RhD" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="+">Rh(+)</SelectItem>
                        <SelectItem value="-">Rh(-)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Thể Tích (ml) */}
              <div className="space-y-1.5">
                <Label htmlFor="thetich" className="text-xs font-medium text-slate-700">
                  Thể Tích (ml) <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={form.control}
                  name="thetich"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-white border-slate-300">
                        <SelectValue placeholder="Chọn thể tích" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="150">150 ml</SelectItem>
                        <SelectItem value="200">200 ml</SelectItem>
                        <SelectItem value="250">250 ml</SelectItem>
                        <SelectItem value="350">350 ml</SelectItem>
                        <SelectItem value="450">450 ml</SelectItem>
                        <SelectItem value="500">500 ml</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Ngày Hiến */}
              <div className="space-y-1.5">
                <Label htmlFor="ngayhien" className="text-xs font-medium text-slate-700">
                  Ngày Hiến <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="ngayhien"
                  type="date"
                  {...form.register("ngayhien", {
                    onChange: (e) => handleDateOrTypeChange(e.target.value, form.getValues("com_type")),
                  })}
                  className="bg-white border-slate-300"
                />
              </div>

              {/* Hạn Sử Dụng */}
              <div className="space-y-1.5">
                <Label htmlFor="hsd" className="text-xs font-medium text-slate-700">
                  Hạn Sử Dụng <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="hsd"
                  type="date"
                  {...form.register("hsd")}
                  className="bg-white border-slate-300"
                />
              </div>

              {/* Vị Trí Lưu Kho Thô */}
              <div className="space-y-1.5">
                <Label htmlFor="location" className="text-xs font-medium text-slate-700">
                  Vị Trí Kho Thô <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-white border-slate-300">
                        <SelectValue placeholder="Chọn tủ lưu" />
                      </SelectTrigger>
                      <SelectContent>
                        {tumau.map((sotu) => (
                          <SelectItem key={sotu} value={String(sotu)}>
                            {sotu}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
               <Button 
                type="button"
                variant="outline"
                className="flex items-center gap-2 bg-white border-slate-300 shadow-sm"
                onClick={() => {
    // Nếu matmchon là Mảng, lấy phần tử đầu tiên/mới nhất:
    const selectedId = Array.isArray(matmchon) ? matmchon[matmchon.length - 1] : matmchon;
    
    if (selectedId) {
      updatematm(selectedId);
    }
  }}
              >
                Cập nhật túi máu
              </Button>
              <Button 
                type="button"
                variant="outline"
                className="flex items-center gap-2 bg-white border-slate-300 shadow-sm"
                onClick={handleTMSession}
              >
                Tra cứu túi máu
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-6"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                {submitting ? "Đang lưu..." : "Nhập Kho Thô"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Tra cứu & Bảng Danh Sách Kho Thô */}
      <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold text-slate-800 space-y-1">
              Danh Sách Túi Máu Trong Kho Thô ({filteredList.length})
            </CardTitle>
          </div>

          <div className="flex gap-2 over-flow-x-auto pb-1">
            <div className="w-40 shrink-0">
              <Input
                placeholder="Mã túi máu..."
                value={filterMatm}
                onChange={(e) => setFilterMatm(e.target.value)}
                className="h-8 text-xs bg-white border-slate-300"
              />
            </div>
            <div className="w-32 shrink-0">
              <Select value={filterComType} onValueChange={setFilterComType}>
                <SelectTrigger className="h-8 text-xs bg-white border-slate-300">
                  <SelectValue placeholder="Loại CP" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả CP</SelectItem>
                  <SelectItem value="MTP">MTP</SelectItem>
                  <SelectItem value="KHC">KHC</SelectItem>
                  <SelectItem value="HTTDL">HTTDL</SelectItem>
                  <SelectItem value="TCGT">TCGT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-28 shrink-0">
              <Select value={filterBloodType} onValueChange={setFilterBloodType}>
                <SelectTrigger className="h-8 text-xs bg-white border-slate-300">
                  <SelectValue placeholder="Nhóm máu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả ABO</SelectItem>
                  <SelectItem value="A">Nhóm A</SelectItem>
                  <SelectItem value="B">Nhóm B</SelectItem>
                  <SelectItem value="O">Nhóm O</SelectItem>
                  <SelectItem value="AB">Nhóm AB</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-24 shrink-0">
              <Select value={filterRhd} onValueChange={setFilterRhd}>
                <SelectTrigger className="h-8 text-xs bg-white border-slate-300">
                  <SelectValue placeholder="RhD" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả Rh</SelectItem>
                  <SelectItem value="+">Rh(+)</SelectItem>
                  <SelectItem value="-">Rh(-)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-45 shrink-0">
              <Input
                placeholder="Ngày hiến:YYYY-MM-DD"
                
                value={filterngayhien}
                onChange={(e) => setFilterngayhien(e.target.value)}
                className="h-8 text-xs bg-white border-slate-300"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <Button 
                type="button"
                variant="outline"
                className="flex items-center gap-2 bg-white border-slate-300 shadow-sm"
                onClick= {handleFetchTM}
              >
                Tìm kho thô
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-100/70 hover:bg-slate-100/70">
                  <TableHead className="w-10 text-center">
                    <Checkbox
                      checked={filteredList.length > 0 && selectedRows.length === filteredList.length}
                      onCheckedChange={handleSelectAll}
                      aria-label="Chọn tất cả"
                    />
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 w-12 text-center">STT</TableHead>
                  <TableHead className="font-semibold text-slate-700">Mã Túi Máu</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center">Loại Chế Phẩm</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center">Nhóm Máu</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">Thể Tích</TableHead>
                  <TableHead className="font-semibold text-slate-700">Ngày Hiến</TableHead>
                  <TableHead className="font-semibold text-slate-700">Hạn Sử Dụng</TableHead>
                  <TableHead className="font-semibold text-slate-700">Vị Trí Kho Thô</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center">Trạng Thái</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center">Thao Tác</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-slate-500">
                      Đang tải danh sách túi máu...
                    </TableCell>
                  </TableRow>
                ) : filteredList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-slate-500">
                      Chưa có túi máu nào trong Kho Thô.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredList.map((row, index) => {
                    const isSelected = selectedRows.includes(row._id);
                    return (
                      <TableRow
                        key={row._id}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? "bg-red-50/70 hover:bg-red-50" : "hover:bg-slate-50/40"
                        }`}
                        onClick={() => handleSelectRow(row._id)}
                      >
                        {/* Checkbox chọn dòng */}
                        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleSelectRow(row._id)}
                            aria-label={`Chọn túi máu ${row._id}`}
                          />
                        </TableCell>

                        {/* STT */}
                        <TableCell className="font-medium text-center text-slate-500 w-12">
                          {index + 1}
                        </TableCell>

                        {/* Mã túi máu */}
                        <TableCell className="font-bold text-red-600">
                          {row.matm}
                        </TableCell>

                        {/* Loại Chế Phẩm */}
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="bg-slate-100 text-slate-800 border-slate-200">
                            {row.com_type}
                          </Badge>
                        </TableCell>

                        {/* Nhóm máu ABO / RhD */}
                        <TableCell className="text-center">
                          <Badge variant="outline" className="font-bold border-red-200 bg-red-50 text-red-700">
                            {row.blood_type} Rh({row.rhd})
                          </Badge>
                        </TableCell>

                        {/* Thể tích */}
                        <TableCell className="text-right font-medium">
                          {row.thetich} ml
                        </TableCell>

                        {/* Ngày hiến */}
                        <TableCell>
                          {row.ngayhien ? new Date(row.ngayhien).toLocaleDateString("vi-VN") : "—"}
                        </TableCell>

                        {/* Hạn sử dụng */}
                        <TableCell className="text-slate-600">
                          {row.hsd ? new Date(row.hsd).toLocaleDateString("vi-VN") : "—"}
                        </TableCell>

                        {/* Vị trí kho */}
                        <TableCell className="text-slate-700 font-medium">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {row.location}
                          </span>
                        </TableCell>

                        {/* Trạng thái */}
                        <TableCell className="text-center">
                          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-300">
                            {row.tinhtrang}
                          </Badge>
                        </TableCell>

                        {/* Thao tác */}
                        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(row)}
                              title="Chỉnh sửa"
                              className="h-8 w-8 text-slate-600 hover:text-slate-900"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(row.matm)}
                              title="Xóa"
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>

              <TableFooter className="bg-slate-50/80">
                <TableRow>
                  <TableCell colSpan={11} className="p-3">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <div className="font-medium flex items-center gap-2">
                        <span>Đã chọn:</span>
                        <span className="font-bold text-red-600 text-sm">{selectedRows.length}</span>
                        <span>/</span>
                        <span className="font-bold text-slate-900 text-sm">{filteredList.length}</span>
                        <span>túi máu kho thô</span>
                      </div>
                      {selectedRows.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedRows([])}
                          className="h-7 text-xs text-slate-500 hover:text-slate-900"
                        >
                          Bỏ chọn tất cả
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Chỉnh Sửa Thông Tin Túi Máu Kho Thô */}
      {editingItem && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px] bg-white">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-800">
                Chỉnh Sửa Túi Máu: <span className="text-red-600">{editingItem.matm}</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Cập nhật thông tin chi tiết túi máu trong kho thô
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-3 py-2 text-xs">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Loại Chế Phẩm</Label>
                <Select
                  value={editingItem.com_type}
                  onValueChange={(val) => setEditingItem({ ...editingItem, com_type: val })}
                >
                  <SelectTrigger className="h-9 bg-white border-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MTP">MTP - Máu toàn phần</SelectItem>
                    <SelectItem value="KHC">KHC - Khối hồng cầu</SelectItem>
                    <SelectItem value="HTTDL">HTTDL - Huyết tương tươi đông lạnh</SelectItem>
                    <SelectItem value="TCGT">TCGT - Tiểu cầu gạn tách</SelectItem>
                    <SelectItem value="TPPOOL">TPPOOL - Tiểu cầu pool</SelectItem>
                    <SelectItem value="TL">TL - Tủa lạnh</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Nhóm Máu ABO</Label>
                <Select
                  value={editingItem.blood_type}
                  onValueChange={(val) => setEditingItem({ ...editingItem, blood_type: val })}
                >
                  <SelectTrigger className="h-9 bg-white border-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Nhóm A</SelectItem>
                    <SelectItem value="B">Nhóm B</SelectItem>
                    <SelectItem value="O">Nhóm O</SelectItem>
                    <SelectItem value="AB">Nhóm AB</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Yếu Tố RhD</Label>
                <Select
                  value={editingItem.rhd}
                  onValueChange={(val) => setEditingItem({ ...editingItem, rhd: val })}
                >
                  <SelectTrigger className="h-9 bg-white border-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+">Rh(+)</SelectItem>
                    <SelectItem value="-">Rh(-)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Thể Tích (ml)</Label>
                <Input
                  value={editingItem.thetich}
                  onChange={(e) => setEditingItem({ ...editingItem, thetich: e.target.value })}
                  className="h-9 bg-white border-slate-300"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Ngày Hiến</Label>
                <Input
                  type="date"
                  value={editingItem.ngayhien}
                  onChange={(e) => setEditingItem({ ...editingItem, ngayhien: e.target.value })}
                  className="h-9 bg-white border-slate-300"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Hạn Sử Dụng</Label>
                <Input
                  type="date"
                  value={editingItem.hsd}
                  onChange={(e) => setEditingItem({ ...editingItem, hsd: e.target.value })}
                  className="h-9 bg-white border-slate-300"
                />
              </div>

              <div className="col-span-2 space-y-1">
                <Label className="text-xs font-medium">Vị Trí Kho Thô</Label>
                <Input
                  value={editingItem.location}
                  onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value })}
                  className="h-9 bg-white border-slate-300"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(false)}>
                Hủy
              </Button>
              <Button size="sm" onClick={handleSaveEdit} className="bg-red-600 hover:bg-red-700 text-white">
                Lưu Thay Đổi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
