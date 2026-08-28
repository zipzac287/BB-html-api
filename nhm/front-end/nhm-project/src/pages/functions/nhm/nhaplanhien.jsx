import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, Plus, Save, RefreshCw, AlertCircle, CheckCircle2,Loader2,User,Calendar,Droplet } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { useDonorSesStore } from "@/stores/useDonorSesStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select,SelectContent,SelectItem,SelectValue,SelectTrigger } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import useDonorSesService from "@/services/useDonorSesService";
import { useDonorStore } from "@/stores/useDonorStore";
import { useTuiMauStore } from "@/stores/useTuiMauStore";

export default function Nhaplanhien() {
  const [searchId, setSearchId] = useState("");
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [donorInfo, setDonorInfo] = useState(null);
  const [deletingSessionId, setDeletingSessionId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [masotui, setMasotui] = useState("");

  const donorSessionSchema = z.object({
  ngayhien: z.string().min(1, "Vui lòng chọn ngày hiến"),
  thetichhien: z.coerce.number().min(100, "Thể tích tối thiểu 100ml"),
  ha_tthu: z.coerce.number().optional(),
  ha_ttruong: z.coerce.number().optional(),
  nhiptim: z.coerce.number().optional(),
  cannang: z.coerce.number().optional(),
  hb: z.coerce.number().optional(),
  hbtest: z.string().optional(),
  trihoan: z.boolean().default(false),
  ngaytrihoan: z.string().optional(),
  lidotrihoan: z.string().optional(),
  mstui: z.string(),
  loaicp: z.string()
});
  const { formData: sessionData ,getbyId, createSession, updateSession, deleteSession } = useDonorSesStore();
  const { getDonorbyId }= useDonorStore();
  const { fetchTuiMau, updateTM } = useTuiMauStore();
  const donorData = useDonorStore((state) => state.formData);
  // Cấu hình Form với React Hook Form + Zod
  const form = useForm({
    resolver: zodResolver(donorSessionSchema),
    defaultValues: {
      _id: "",
      donor_id: "",
      ngayhien: new Date().toISOString().split("T")[0],
      thetichhien: 350,
      ha_tthu: 120,
      ha_ttruong: 80,
      nhiptim: 75,
      cannang: 60,
      hb: 130,
      hbtest: "Đạt",
      trihoan: false,
      ngaytrihoan: "",
      lidotrihoan: "",
      mstui: "",
      loaicp: "MTP"
    },
  });

  const { register, handleSubmit, control, reset, setValue, watch, formState: { errors } } = form;
  const isTriHoan = watch("trihoan");
  const VOLUMES = [25, 50, 150, 200, 250, 350, 450, 500];
  const CPM = ["MTP", "TCGT", "HTTĐL", "KHC"];
  // Mock API Fetching / Đọc dữ liệu (Thay thế bằng hàm call API thực tế của bạn)
  const fetchSessions = async (searchId) => {
  if (!searchId) return;

  setLoading(true);
  try {
    // 1. Lấy thông tin Donor từ Store
    const donorResult = await getDonorbyId(searchId);
    
    if (donorResult) {
      // Set dữ liệu trực tiếp vào donorInfo
      setDonorInfo(donorResult);

    } else {
      setDonorInfo([]);
    };
    const donorid = donorResult.id;
    // 2. Lấy lịch sử đợt hiến
    try {
      const sesRes = await useDonorSesService.getbyId(donorid);
      if (sesRes && sesRes.success && Array.isArray(sesRes.data)) {
        setSessions(sesRes.data);
      }
    } catch (sesErr) {
      setSessions([]);
    }

  } catch (err) {
    console.error("❌ Lỗi fetchSessions:", err);
    setDonorInfo(null);
    setSessions([]);
  } finally {
    setLoading(false);
  }
};
  const fetchTuimau = async (masotui) => {
    console.log(masotui);
    if (!masotui) return;
    try {
      const result = await fetchTuiMau({ matm: masotui});
      console.log(result);
      if (!result) return;
      const res = result[0];

      form.setValue("loaicp",res.com_type, {shouldValidate: true});
      
      const ngayhienformat = new Date(res.ngayhien).toISOString().split("T")[0];
      form.setValue("ngayhien",ngayhienformat, {shouldValidate: true});
      form.setValue("thetichhien",res.thetich, {shouldValidate: true});

    } catch (error) {
      console.error("Lỗi fetchTuimau: ",error);
      setMasotui([]);
    }
  };
  useEffect(() => {
    if (searchId) {
    fetchSessions(searchId);
    };
    if (masotui) {
      fetchTuimau(masotui);
    };
  }, []);

  const handleConfirmDelete = async () => {
    console.log(deletingSessionId);
    if (!deletingSessionId) return;

    setIsDeleting(true);
    try {
      // 🟢 Gọi API xóa lượt hiến từ backend service
      await deleteSession(deletingSessionId);

      toast.success("Đã hủy lượt hiến thành công!");

      // 1. Cập nhật lại danh sách local (loại bỏ record vừa xóa)
      setSessions((prev) => prev.filter((s) => s._id !== deletingSessionId));

      // 2. Nếu dòng bị xóa đang được chọn trên Form thì reset Form
      if (selectedId === deletingSessionId) {
        fetchSessions();
      }

      // 3. Đóng Dialog
      setDeletingSessionId(null);
    } catch (error) {
      console.error("Lỗi khi hủy lượt hiến:", error);
    } finally {
      setIsDeleting(false);
    }
  };
  // Xử lý Tra cứu nhanh theo ID
  const handleSearch = async () => {
    await fetchSessions(searchId); 
  };
  const handlenhapmoi = async () => {
    setSelectedId(null);
    form.reset({
    _id: "",
    donor_id: donorInfo?.id || donorInfo?._id || "", // Giữ lại ID người hiến nếu cần
    ngayhien: new Date().toISOString().split("T")[0],
    thetichhien: 350,
    ha_tthu: 120,
    ha_ttruong: 80,
    nhiptim: 75,
    cannang: 60,
    hb: 130,
    hbtest: "Đạt",
    trihoan: false,
    ngaytrihoan: "",
    lidotrihoan: "",
    mstui: "",
    loaicp: "MTP"
  });
    await fetchSessions(searchId);
  };

  // Chọn dòng trong Table -> Đổ dữ liệu lên Form để Edit
  const handleSelectSession = (session) => {
    setSelectedId(session._id);
    
    // Fill dữ liệu từ row chọn vào form
    reset({
      _id: session._id,
      donor_id: typeof session.donor_id === "object" ? session.donor_id._id : session.donor_id,
      ngayhien: session.ngayhien ? new Date(session.ngayhien).toISOString().split("T")[0] : "",
      thetichhien: session.thetichhien || 0,
      ha_tthu: session.ha_tthu || 0,
      ha_ttruong: session.ha_ttruong || 0,
      nhiptim: session.nhiptim || 0,
      cannang: session.cannang || 0,
      hb: session.hb || 0,
      hbtest: session.hbtest || "",
      trihoan: !!session.trihoan,
      ngaytrihoan: session.ngaytrihoan ? new Date(session.ngaytrihoan).toISOString().split("T")[0] : "",
      lidotrihoan: session.lidotrihoan || "",
      mstui: session.mstui,
      loaicp: session.loaicp,
    });
  };

  // Nút tạo mới - Reset Form
  const handlefindSession = async () => {
    const donorid = donorData.id;
    if (!donorid) {
      toast.error("nhận id người hiến");
      return;
    }
    try {
      await getbyId(donorid);
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };
  // Submit Form (Thêm mới hoặc Cập nhật)
  const onSubmit = async (data) => {
    const fullPayload = {
    ...data,
    donor_id: donorData.id,
  };
    if (!selectedId) {
    try {
      console.log(fullPayload);
    const currentDate = new Date(fullPayload.ngayhien);
    if(sessions && sessions.length > 0) {
      const latestsession = [...sessions].sort(
        (a, b) => new Date(b.ngayhien) - new Date(a.ngayhien)
      )[0];
      const ngaygannhat = new Date(latestsession.ngayhien);
      const diff = currentDate.getTime() - ngaygannhat.getTime();
      const diffngay = Math.floor(diff / (1000*3600*24));

      if (diffngay <87) {
        alert("Không đủ thời gian hiến máu:", `${diffngay}`);
        return;
      }
    }
      const res = await createSession(fullPayload);
      const {_id,mstui} = res;
      const res1 = await updateTM(mstui,_id);
    } catch (error) {
      console.error(error);
    }
    } else {
    try {
      const id = selectedId;
      await updateSession(fullPayload,id);
      fetchSessions(searchId);
    } catch (error) {
      console.error(error);
    }}
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-screen">
      {/* 1. Thanh Tra Cứu Thông Tin */}
      <Card className="shadow-sm border-slate-200">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2 w-full sm:w-1/2">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  type="text"
                  placeholder="Nhập Mã người hiến (donor_id)..."
                  className="pl-9 bg-white"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} variant="default" className="bg-red-600 hover:bg-red-700">
                Tra cứu
              </Button>
            </div>

            <Button onClick={handlefindSession} variant="outline" className="w-full sm:w-auto border-red-200 text-red-600 hover:bg-red-50">
              <Plus className="mr-2 h-4 w-4" /> Tìm đợt hiến mới
            </Button>
          </div>
        </CardContent>
      </Card>
{/* 2. KHỐI HIỂN THỊ THÔNG TIN NGƯỜI HIẾN MÁU */}
    <Card className="shadow-sm border-blue-200 bg-blue-50/50">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm text-slate-700">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" />
            <span className="text-slate-500">Họ và tên:</span>
            <span className="font-bold text-blue-950 uppercase">
              {donorInfo?.hoTen || "-"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span className="text-slate-500">Ngày sinh:</span>
            <span className="font-semibold text-slate-800">
              {donorInfo?.ngaySinh 
                ? new Date(donorInfo?.ngaySinh).toLocaleDateString("vi-VN") 
                : "-"}
            </span>
          </div>

          <div>
            <span className="text-slate-500">Giới tính:</span>{" "}
            <span className="font-semibold text-slate-800">{donorInfo?.gioiTinh || "-"}</span>
          </div>

          <div className="flex items-center gap-2">
            <Droplet className="h-4 w-4 text-red-600" />
            <span className="text-slate-500">Nhóm máu:</span>
            <span className="font-bold bg-red-600 text-white px-2.5 py-0.5 rounded text-xs shadow-sm">
              {donorInfo?.nhomMauDay || "Chưa xác định"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
      {/* 2. Form Thông Tin Đợt Hiến Máu (Đồng thời là form Chỉnh sửa) */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-slate-100/50 border-b pb-4">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg text-slate-800">
                {selectedId ? `Chỉnh sửa đợt hiến: ${selectedId}` : "Nhập thông tin đợt hiến máu mới"}
              </CardTitle>
              <CardDescription>
                {selectedId ? "Cập nhật chỉ số sinh hiệu và trạng thái hiến" : "Điền đầy đủ thông tin bên dưới để lưu vào hệ thống"}
              </CardDescription>
            </div>
            {selectedId ? (
              <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50">
                Đang sửa
              </Badge>
            ) : (
              <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50">
                Nhập mới
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit, (err) => console.error(err))} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

              {/* Ngày hiến */}
              <div>
                <Label htmlFor="ngayhien">Ngày hiến *</Label>
                <Input 
                id="ngayhien" 
                
                type="date" {...register("ngayhien")} 
                className="bg-white mt-1" />
                {errors.ngayhien && <p className="text-xs text-red-500 mt-1">{errors.ngayhien.message}</p>}
              </div>

              <div>
                <Label htmlFor="mstui">Mã số túi máu</Label>
                <Input
                id="mstui"
                {...register("mstui", {
               onBlur: (e) => {
                    const val = e.target.value?.trim();
                    if (val) {
                      fetchTuimau(val);
                    }
                  }
                })}
                className={"bg-white mt-1"} />
                {errors.mstui && <p className="text-xs text-red-500 mt-1">{errors.mstui.message}</p>}

              </div>
              {/* Thể tích hiến */}
              <div>
                <label htmlFor="thetichhien">
    Thể tích hiến (ml)
  </label>

  <Controller
    control={control}
    name="thetichhien"
    defaultValue={350}
    render={({ field }) => (
      <Select
        value= {field.value ? String(field.value) : "350"}
        onValueChange={(val) => field.onChange(Number(val))}
      >
        <SelectTrigger id="thetichhien" className="w-full bg-white">
          <SelectValue placeholder="Chọn thể tích..." />
        </SelectTrigger>

        <SelectContent>
          {VOLUMES.map((vol) => (
            <SelectItem key={vol} value={String(vol)}>
              {vol} ml
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )}
  />
  {errors.thetichhien && (
    <p className="text-xs text-red-500 mt-1">{errors.thetichhien.message}</p>
  )}
  </div>
        <div>
          <Label htmlFor="mstui">Loại chế phẩm</Label>
                <Controller
                  control={control}
                  name="loaicp"
                  defaultValue="MTP"
                  render={({ field }) => (
                <Select
                  value= {field.value || "MTP"}
                  onValueChange={(val) => field.onChange(val)}
                >
                <SelectTrigger id="loaicp" className="w-full bg-white">
                  <SelectValue placeholder="Chọn loại CPM" />
                </SelectTrigger>

                <SelectContent>
                  {CPM.map((loai) => (
                    <SelectItem key={loai} value={String(loai)}>
                      {loai}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              )}
            />
            {errors.thetichhien && (
              <p className="text-xs text-red-500 mt-1">{errors.thetichhien.message}</p>
            )}

        </div>
            </div>

            {/* Khám Lâm Sàng & Sinh Hiệu */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
              <h4 className="text-sm font-semibold text-slate-700">Chỉ số khám lâm sàng & Xét nghiệm nhanh</h4>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <div>
                  <Label className="text-xs">HA Tâm thu (mmHg)</Label>
                  <Input
                  value= {donorData.ha_tthu} 
                  type="number" {...register("ha_tthu")} 
                  className="bg-white mt-1 h-9" />
                </div>
                <div>
                  <Label className="text-xs">HA Tâm trương (mmHg)</Label>
                  <Input 
                  value= {donorData.ha_ttruong}
                  type="number" {...register("ha_ttruong")} 
                  className="bg-white mt-1 h-9" />
                </div>
                <div>
                  <Label className="text-xs">Nhịp tim (lần/phút)</Label>
                  <Input 
                  value= {donorData.nhiptim}
                  type="number" {...register("nhiptim")} className="bg-white mt-1 h-9" />
                </div>
                <div>
                  <Label className="text-xs">Cân nặng (kg)</Label>
                  <Input 
                  value={donorData.cannang}
                  type="number" {...register("cannang")} className="bg-white mt-1 h-9" />
                </div>
                <div>
                  <Label className="text-xs">Huyết sắc tố (Hb g/L)</Label>
                  <Input 
                  value={donorData.hb}
                  type="number" {...register("hb")} className="bg-white mt-1 h-9" />
                </div>
                <div>
                  <Label className="text-xs">Kết quả Test Hb</Label>
                  <Input {...register("hbtest")} className="bg-white mt-1 h-9" placeholder="Đạt / Không đạt" />
                </div>
              </div>
            </div>

            {/* Trì Hoãn Hiến Máu */}
            <div className="p-4 bg-red-50/50 rounded-lg border border-red-100 space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="trihoan"
                  checked={isTriHoan}
                  onCheckedChange={(checked) => setValue("trihoan", !!checked)}
                />
                <Label htmlFor="trihoan" className="font-semibold text-red-800 cursor-pointer">
                  Trì hoãn hiến máu đợt này
                </Label>
              </div>

              {isTriHoan && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <Label className="text-xs">Ngày hẹn hiến lại (Trì hoãn đến ngày)</Label>
                    <Input type="date" {...register("ngaytrihoan")} className="bg-white mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Lý do trì hoãn</Label>
                    <Input {...register("lidotrihoan")} className="bg-white mt-1" placeholder="Nhập lý do trì hoãn..." />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button 
              type="button"
              variant="ghost"
              className="text-blue-600 hover:text-blue-900 hover:bg-blue-50"
              onClick={() => handlenhapmoi()}>
                Nhập lần hiến mới
              </Button>
              <Button 
              type="button" 
              variant="ghost"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick= {(e) => {
                e.stopPropagation();
                setDeletingSessionId(selectedId);
              }}>
                Hủy lần hiến
              </Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">
                Lưu đợt hiến mới
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>


      {/* 3. Bảng Danh Sách Các Lần Hiến Máu */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-lg text-slate-800">Lịch sử các đợt hiến máu</CardTitle>
            <CardDescription>Click vào một dòng bất kỳ để xem và chỉnh sửa thông tin</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => fetchSessions()}>
            <RefreshCw className="h-4 w-4 mr-1" /> Tải lại
          </Button>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border bg-white overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[100px]">Mã túi máu</TableHead>
                  <TableHead>Loại chế phẩm</TableHead>
                  <TableHead>Ngày hiến</TableHead>
                  <TableHead>Thể tích</TableHead>

                  <TableHead>Huyết áp</TableHead>
                  <TableHead>Hb</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-slate-500">
                      Đang tải dữ liệu...
                    </TableCell>
                  </TableRow>
                ) : sessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-slate-500">
                      Không tìm thấy đợt hiến máu nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  sessions.map((data) => {
                    const isSelected = selectedId === data._id;
                    const donorName = donorInfo.hoTen;
                    return (
                      <TableRow
                        key={data._id || data._id}
                        onClick={() => handleSelectSession(data)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? "bg-red-50/80 hover:bg-red-50" : "hover:bg-slate-50"
                        }`}
                      >
                        <TableCell className="font-medium text-red-600">{data.mstui}</TableCell>
                        <TableCell>
                          <div className="font-medium">{data.loaicp}</div>
                        </TableCell>
                        <TableCell>{new Date(data.ngayhien).toLocaleDateString("vi-VN")}</TableCell>
                        <TableCell className="font-semibold">{data.thetichhien} ml</TableCell>
                        <TableCell>{data.ha_tthu && data.ha_ttruong ? `${data.ha_tthu}/${data.ha_ttruong}` : "-"}</TableCell>
                        <TableCell>{data.hb ? `${data.hb} g/L` : "-"}</TableCell>
                        <TableCell>
                          {data.trihoan ? (
                            <Badge variant="destructive" className="flex w-fit items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Trì hoãn
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="flex w-fit items-center gap-1 border-emerald-500 text-emerald-600 bg-emerald-50">
                              <CheckCircle2 className="w-3 h-3" /> Thành công
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>

                  );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          <AlertDialog
        open={Boolean(deletingSessionId)}
        onOpenChange={(open) => !open && setDeletingSessionId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận hủy lượt hiến máu?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa hoàn toàn lượt hiến có mã túi{" "}
              <strong className="text-red-600">{deletingSessionId}</strong> khỏi hệ thống. Thao tác này không thể khôi phục.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Bỏ qua
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault(); // Giữ dialog mở để hiển thị trạng thái loading
                handleConfirmDelete();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Đang xử lý..." : "Xác nhận hủy"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
        </CardContent>
      </Card>
    </div>
    
  );
}