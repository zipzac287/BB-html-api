import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from 'zod';
// Imports từ Shadcn UI
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, CheckCircle2, XCircle, Loader2, TestTube2 } from "lucide-react";
import { useXNStore } from "@/stores/useXNStore";
import { useTuiMauStore } from "@/stores/useTuiMauStore";

const xetNghiemFormSchema = z.object({

    matm: z.string().optional(),
    ngayhien: z.string().optional(),
    blood_type: z.string().optional(),
    thetich: z.string().optional(),
    com_type: z.string().optional(),
  });
const testResults = z.object({
    hiv: z.enum(["Âm tính", "Dương tính", "Chưa xét nghiệm"]),
    hbv: z.enum(["Âm tính", "Dương tính", "Chưa xét nghiệm"]),
    hcv: z.enum(["Âm tính", "Dương tính", "Chưa xét nghiệm"]),
    syp: z.enum(["Âm tính", "Dương tính", "Chưa xét nghiệm"]),
    abscreen: z.enum(["Âm tính", "Dương tính", "Chưa xét nghiệm"]),
    abo_cf: z.string().optional(),
    rhd_cf: z.string().optional(),
  });

const TEST_OPTIONS = ["Âm tính", "Dương tính", "Chưa xét nghiệm"];
const BLOOD_TYPES = ["A", "B", "AB", "O"];
const RHD_TYPES = ["Rh(+)", "Rh(-)"];

export default function XetNghiemPage() {
  
  const [loading, setLoading] = useState(false);

  const { getXN, XNList } = useXNStore();
  const { fetchTuiMau, tuiMauList } = useTuiMauStore();

  const form = useForm({
    resolver: zodResolver(xetNghiemFormSchema),
    defaultValues: {
      filter: { matm: "", ngayhien: "", blood_type: "", thetich: "", com_type: "" },
      selectedBagIds: [],
      testResults: {
        hiv: "Âm tính",
        hbv: "Âm tính",
        hcv: "Âm tính",
        syp: "Âm tính",
        abscreen: "Âm tính",
        abo_cf: "",
        rhd_cf: "",
      },
    },
  });

  const selectedBagIds = form.watch("selectedBagIds") || [];

  // 1. Hàm Tìm Kiếm Túi Máu
  const handleSearch = async () => {
    setLoading(true);

    const filterValues = form.getValues("filter");
    console.log(filterValues);
    try {
      await fetchTuiMau(filterValues);
      // Gọi API lấy danh sách túi máu chờ xét nghiệm từ backend
      // const res = await api.get('/tui-mau/xet-nghiem', { params: filterValues });
      // setTuiMauList(res.data);
      
      form.setValue("selectedBagIds", []); // Reset checkbox chọn
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Logic Checkbox Chọn tất cả / Chọn từng dòng
  const isAllSelected = tuiMauList.length > 0 && selectedBagIds.length === tuiMauList.length;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      form.setValue("selectedBagIds", [], { shouldValidate: true });
    } else {
      const allIds = tuiMauList.map((item) => item._id);
      form.setValue("selectedBagIds", allIds, { shouldValidate: true });
    }
  };

  const handleToggleSelectOne = (id) => {
    const exists = selectedBagIds.includes(id);
    const newSelected = exists
      ? selectedBagIds.filter((item) => item !== id)
      : [...selectedBagIds, id];
    form.setValue("selectedBagIds", newSelected, { shouldValidate: true });
  };

  // 3. Hàm Xử lý LƯU KẾT QUẢ XÉT NGHIỆM
  const handleSaveResult = async (ketluanStatus) => {
    // Validate form bằng RHF + Zod
    const isValid = await form.trigger(["selectedBagIds", "testResults"]);
    if (!isValid) return;

    const values = form.getValues();
    const payload = {
      tuiMauIds: values.selectedBagIds, // Mảng ID các túi máu được áp dụng kết quả này
      xetNghiemData: {
        ...values.testResults,
        ketluan: ketluanStatus, // 'Đạt' hoặc 'Không đạt'
        ngaykl: new Date(),
        nguoikl: "BS. Nguyễn Văn A", // ID/Name kỹ thuật viên đăng nhập
      },
    };

    try {
      setLoading(true);
      console.log("👉 Payload gửi lên API Backend:", payload);
      // await api.post('/xet-nghiem/batch-update', payload);

      alert(`Đã cập nhật kết quả xét nghiệm [${ketluanStatus}] cho ${payload.tuiMauIds.length} túi máu!`);
      
      form.setValue("selectedBagIds", []);
    } catch (err) {
      alert("Lỗi khi lưu kết quả xét nghiệm!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-6xl">
      <div className="flex items-center gap-3 border-b pb-4">
        <TestTube2 className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Cập Nhật Kết Quả Xét Nghiệm Túi Máu</h1>
          <p className="text-sm text-muted-foreground">
            Nhập các chỉ số xét nghiệm sàng lọc HIV, HBV, HCV, Giang mai, AbScreen và kết luận chất lượng túi máu.
          </p>
        </div>
      </div>

      {/* SECTION 1: TÌM KIẾM TÚI MÁU */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">1. Tìm kiếm túi máu chờ xét nghiệm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Mã túi máu</Label>
              <Input
                placeholder="Nhập mã..."
                {...form.register("filter.matm")}
              />
            </div>

            <div className="space-y-2">
              <Label>Ngày hiến</Label>
              <Input
                type="date"
                {...form.register("filter.ngayhien")}
              />
            </div>

            <div className="space-y-2">
              <Label>Nhóm máu (ABO)</Label>
              <Select
                value={form.watch("filter.blood_type") || "ALL"}
                onValueChange={(val) => {
                  form.setValue("filter.blood_type", val === "ALL"? "": val, {shouldValidate:true});
                }}
              >
                <SelectTrigger><SelectValue placeholder="-- Tất cả --" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">-- Tất cả --</SelectItem>
                  {BLOOD_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Thể tích (ml)</Label>
              <Input
                placeholder="VD: 350"
                {...form.register("filter.thetich")}
              />
            </div>

            <div className="space-y-2">
              <Label>Loại chế phẩm</Label>
              <Input
                placeholder="KHC, HTTDL..."
                {...form.register("filter.com_type")}
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button type="button" onClick={handleSearch} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Tìm kiếm
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 2: BẢNG DANH SÁCH TÚI MÁU VỚI CHECKBOX */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base font-semibold">
              2. Danh sách túi máu ({tuiMauList.length})
            </CardTitle>
            <span className="text-sm font-medium text-primary">
              Đã chọn: {selectedBagIds.length} túi
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {form.formState.errors.selectedBagIds && (
            <p className="text-sm font-medium text-destructive mb-2">
              {form.formState.errors.selectedBagIds.message}
            </p>
          )}
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] text-center">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleToggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Mã túi máu</TableHead>
                  <TableHead>Ngày hiến</TableHead>
                  <TableHead>Nhóm máu (ABO/Rh)</TableHead>
                  <TableHead>Thể tích</TableHead>
                  <TableHead>Chế phẩm</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tuiMauList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                      Chưa có dữ liệu. Hãy bấm "Tìm kiếm".
                    </TableCell>
                  </TableRow>
                ) : (
                  tuiMauList.map((bag) => {
                    const isChecked = selectedBagIds.includes(bag._id);
                    return (
                      <TableRow key={bag._id} className={isChecked ? "bg-muted/50" : ""}>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => handleToggleSelectOne(bag._id)}
                          />
                        </TableCell>
                        <TableCell className="font-semibold">{bag.matm}</TableCell>
                        <TableCell>{bag.ngayhien.split("T")[0]}</TableCell>
                        <TableCell>{bag.blood_type} {bag.rhd}</TableCell>
                        <TableCell>{bag.thetich} ml</TableCell>
                        <TableCell>{bag.com_type}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 3: NHẬP KẾT QUẢ XÉT NGHIỆM */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            3. Nhập kết quả xét nghiệm (Áp dụng cho các túi được chọn)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* HIV */}
            <div className="space-y-2">
              <Label className="font-bold text-red-600">HIV</Label>
              <Select
                value={form.watch("testResults.hiv")}
                onValueChange={(val) => form.setValue("testResults.hiv", val)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TEST_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* HBV */}
            <div className="space-y-2">
              <Label className="font-bold text-red-600">HBV (Viêm gan B)</Label>
              <Select
                value={form.watch("testResults.hbv")}
                onValueChange={(val) => form.setValue("testResults.hbv", val)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TEST_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* HCV */}
            <div className="space-y-2">
              <Label className="font-bold text-red-600">HCV (Viêm gan C)</Label>
              <Select
                value={form.watch("testResults.hcv")}
                onValueChange={(val) => form.setValue("testResults.hcv", val)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TEST_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* SYP */}
            <div className="space-y-2">
              <Label className="font-bold text-red-600">SYP (Giang mai)</Label>
              <Select
                value={form.watch("testResults.syp")}
                onValueChange={(val) => form.setValue("testResults.syp", val)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TEST_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ABSCREEN */}
            <div className="space-y-2">
              <Label className="font-bold">AbScreen (KBT)</Label>
              <Select
                value={form.watch("testResults.abscreen")}
                onValueChange={(val) => form.setValue("testResults.abscreen", val)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TEST_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* ABO Confirm */}
            <div className="space-y-2">
              <Label>Định nhóm máu ABO định kỳ (abo_cf)</Label>
              <Select
                value={form.watch("testResults.abo_cf") || ""}
                onValueChange={(val) => form.setValue("testResults.abo_cf", val)}
              >
                <SelectTrigger><SelectValue placeholder="-- Chọn ABO xác nhận --" /></SelectTrigger>
                <SelectContent>
                  {BLOOD_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>Nhóm {type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* RhD Confirm */}
            <div className="space-y-2">
              <Label>Định nhóm máu RhD định kỳ (rhd_cf)</Label>
              <Select
                value={form.watch("testResults.rhd_cf") || ""}
                onValueChange={(val) => form.setValue("testResults.rhd_cf", val)}
              >
                <SelectTrigger><SelectValue placeholder="-- Chọn RhD xác nhận --" /></SelectTrigger>
                <SelectContent>
                  {RHD_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 4: CÁC BUTTON KẾT LUẬN CUỐI CÙNG */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          size="lg"
          variant="destructive"
          className="font-semibold"
          disabled={loading || selectedBagIds.length === 0}
          onClick={() => handleSaveResult("Không đạt")}
        >
          <XCircle className="mr-2 h-5 w-5" />
          KẾT LUẬN KHÔNG ĐẠT ({selectedBagIds.length})
        </Button>

        <Button
          type="button"
          size="lg"
          className="bg-emerald-600 hover:bg-emerald-700 font-semibold"
          disabled={loading || selectedBagIds.length === 0}
          onClick={() => handleSaveResult("Đạt")}
        >
          <CheckCircle2 className="mr-2 h-5 w-5" />
          KẾT LUẬN ĐẠT ({selectedBagIds.length})
        </Button>
      </div>
    </div>
  );
}