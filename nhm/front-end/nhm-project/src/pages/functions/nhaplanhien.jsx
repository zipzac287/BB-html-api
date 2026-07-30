import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, Plus, Save, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { z } from "zod";

// Nhập các UI Component từ Shadcn
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function nhaplanhien() {
  const [searchId, setSearchId] = useState("");
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const donorSessionSchema = z.object({
  dsession_id: z.string().min(1, "Vui lòng nhập mã đợt hiến"),
  donor_id: z.string().min(1, "Vui lòng chọn hoặc nhập mã người hiến"),
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
});

  // Cấu hình Form với React Hook Form + Zod
  const form = useForm({
    resolver: zodResolver(donorSessionSchema),
    defaultValues: {
      dsession_id: "",
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
    },
  });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = form;
  const isTriHoan = watch("trihoan");

  // Mock API Fetching / Đọc dữ liệu (Thay thế bằng hàm call API thực tế của bạn)
  const fetchSessions = async (donorIdQuery = "") => {
    setLoading(true);
    try {
      // Ví dụ gọi API: const res = await api.get(`/donor-sessions${donorIdQuery ? `?donor_id=${donorIdQuery}` : ''}`);
      // Dữ liệu mẫu minh họa:
      const mockData = [
        {
          _id: "60d5ecb8b3f1a213488f8b01",
          dsession_id: "DS001",
          donor_id: { _id: "D101", ho_ten: "Nguyễn Văn A", cccd: "0123456789" },
          ngayhien: "2026-03-15",
          thetichhien: 350,
          ha_tthu: 120,
          ha_ttruong: 80,
          nhiptim: 72,
          cannang: 65,
          hb: 135,
          hbtest: "Đạt",
          trihoan: false,
        },
        {
          _id: "60d5ecb8b3f1a213488f8b02",
          dsession_id: "DS002",
          donor_id: { _id: "D101", ho_ten: "Nguyễn Văn A", cccd: "0123456789" },
          ngayhien: "2025-11-10",
          thetichhien: 250,
          ha_tthu: 110,
          ha_ttruong: 70,
          nhiptim: 80,
          cannang: 64,
          hb: 125,
          hbtest: "Đạt",
          trihoan: true,
          ngaytrihoan: "2025-11-10",
          lidotrihoan: "Huyết áp thấp",
        },
      ];
      setSessions(mockData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Xử lý Tra cứu nhanh theo ID
  const handleSearch = () => {
    if (searchId.trim()) {
      fetchSessions(searchId);
    } else {
      fetchSessions();
    }
  };

  // Chọn dòng trong Table -> Đổ dữ liệu lên Form để Edit
  const handleSelectSession = (session) => {
    setSelectedId(session.dsession_id);
    
    // Fill dữ liệu từ row chọn vào form
    reset({
      dsession_id: session.dsession_id,
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
    });
  };

  // Nút tạo mới - Reset Form
  const handleAddNew = () => {
    setSelectedId(null);
    reset({
      dsession_id: `DS${Date.now().toString().slice(-4)}`,
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
    });
  };

  // Submit Form (Thêm mới hoặc Cập nhật)
  const onSubmit = async (data) => {
    if (selectedId) {
      // Gọi API PUT /api/donor-sessions/:id
      console.log("Cập nhật lượt hiến:", selectedId, data);
      alert("Đã cập nhật đợt hiến thành công!");
    } else {
      // Gọi API POST /api/donor-sessions
      console.log("Tạo mới lượt hiến:", data);
      alert("Đã thêm mới đợt hiến thành công!");
    }
    fetchSessions();
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
                  placeholder="Nhập mã Đợt hiến (dsession_id) hoặc Mã người hiến (donor_id)..."
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

            <Button onClick={handleAddNew} variant="outline" className="w-full sm:w-auto border-red-200 text-red-600 hover:bg-red-50">
              <Plus className="mr-2 h-4 w-4" /> Tạo đợt hiến mới
            </Button>
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
            {selectedId && (
              <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50">
                Đang sửa
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Mã đợt hiến */}
              <div>
                <Label htmlFor="dsession_id">Mã đợt hiến (dsession_id) *</Label>
                <Input id="dsession_id" {...register("dsession_id")} disabled={!!selectedId} className="bg-white mt-1" />
                {errors.dsession_id && <p className="text-xs text-red-500 mt-1">{errors.dsession_id.message}</p>}
              </div>

              {/* ID Người hiến */}
              <div>
                <Label htmlFor="donor_id">Mã Người Hiến (donor_id) *</Label>
                <Input id="donor_id" {...register("donor_id")} className="bg-white mt-1" placeholder="ObjectId hoặc ID người hiến" />
                {errors.donor_id && <p className="text-xs text-red-500 mt-1">{errors.donor_id.message}</p>}
              </div>

              {/* Ngày hiến */}
              <div>
                <Label htmlFor="ngayhien">Ngày hiến *</Label>
                <Input id="ngayhien" type="date" {...register("ngayhien")} className="bg-white mt-1" />
                {errors.ngayhien && <p className="text-xs text-red-500 mt-1">{errors.ngayhien.message}</p>}
              </div>

              {/* Thể tích hiến */}
              <div>
                <Label htmlFor="thetichhien">Thể tích hiến (ml) *</Label>
                <Input id="thetichhien" type="number" {...register("thetichhien")} className="bg-white mt-1" />
                {errors.thetichhien && <p className="text-xs text-red-500 mt-1">{errors.thetichhien.message}</p>}
              </div>
            </div>

            {/* Khám Lâm Sàng & Sinh Hiệu */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
              <h4 className="text-sm font-semibold text-slate-700">Chỉ số khám lâm sàng & Xét nghiệm nhanh</h4>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <div>
                  <Label className="text-xs">HA Tâm thu (mmHg)</Label>
                  <Input type="number" {...register("ha_tthu")} className="bg-white mt-1 h-9" />
                </div>
                <div>
                  <Label className="text-xs">HA Tâm trương (mmHg)</Label>
                  <Input type="number" {...register("ha_ttruong")} className="bg-white mt-1 h-9" />
                </div>
                <div>
                  <Label className="text-xs">Nhịp tim (lần/phút)</Label>
                  <Input type="number" {...register("nhiptim")} className="bg-white mt-1 h-9" />
                </div>
                <div>
                  <Label className="text-xs">Cân nặng (kg)</Label>
                  <Input type="number" {...register("cannang")} className="bg-white mt-1 h-9" />
                </div>
                <div>
                  <Label className="text-xs">Huyết sắc tố (Hb g/L)</Label>
                  <Input type="number" {...register("hb")} className="bg-white mt-1 h-9" />
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

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={handleAddNew}>
                Hủy / Làm mới
              </Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">
                <Save className="mr-2 h-4 w-4" /> {selectedId ? "Cập nhật lượt hiến" : "Lưu đợt hiến mới"}
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
                  <TableHead className="w-[100px]">Mã lượt hiến</TableHead>
                  <TableHead>Người hiến máu</TableHead>
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
                  sessions.map((item) => {
                    const isSelected = selectedId === item.dsession_id;
                    const donorName = typeof item.donor_id === "object" ? item.donor_id?.ho_ten : item.donor_id;

                    return (
                      <TableRow
                        key={item._id || item.dsession_id}
                        onClick={() => handleSelectSession(item)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? "bg-red-50/80 hover:bg-red-50" : "hover:bg-slate-50"
                        }`}
                      >
                        <TableCell className="font-medium text-red-600">{item.dsession_id}</TableCell>
                        <TableCell>
                          <div className="font-medium">{donorName || "Chưa xác định"}</div>
                          {item.donor_id?.cccd && (
                            <div className="text-xs text-slate-400">CCCD: {item.donor_id.cccd}</div>
                          )}
                        </TableCell>
                        <TableCell>{new Date(item.ngayhien).toLocaleDateString("vi-VN")}</TableCell>
                        <TableCell className="font-semibold">{item.thetichhien} ml</TableCell>
                        <TableCell>{item.ha_tthu && item.ha_ttruong ? `${item.ha_tthu}/${item.ha_ttruong}` : "-"}</TableCell>
                        <TableCell>{item.hb ? `${item.hb} g/L` : "-"}</TableCell>
                        <TableCell>
                          {item.trihoan ? (
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
        </CardContent>
      </Card>
    </div>
  );
}