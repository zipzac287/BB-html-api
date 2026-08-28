import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { 
  Search, 
  RotateCcw, 
  FileSpreadsheet, 
  Droplet, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Filter 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select,SelectContent,SelectItem,SelectValue,SelectTrigger } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { useDonorSesStore } from "@/stores/useDonorSesStore";
import { useDonorStore } from "@/stores/useDonorStore";
import { getbyId } from "@/services/useDonorSesService";

export default function ThongKeLanHien() {
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  const { formData: sessionData ,getSession } = useDonorSesStore();

  const form = useForm({
      defaultValues: {
        donor_id: "",
        ngayhientu: "",
        ngayhienden: "" ,
        thetichhien: "",
        trihoan: "",
        ngaytrihoan: "",
        mstui: "",
        loaicp: "",
        abo: "",
        rhd: "",
      },
    });
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const data = await getSession({});
        setSession(data || []);
        setSelectedRows([]);
      } catch (err) {
        console.error("Lỗi tải danh sách lượt hiến:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleResetFilter = () => {
    form.reset({
        donor_id: "",
        ngayhientu: "",
        ngayhienden: "" ,
        thetichhien: "",
        trihoan: "all",
        ngaytrihoan: "",
        mstui: "",
        loaicp: "",
        abo: "",
        rhd: "",
    });
    setSelectedRows([]);
  };

  const onSubmitFilter = async (filterData) => {
    setLoading(true);
    console.log(filterData);
    try {
      const result = await getSession(filterData);
      setSession(result || []);
      setSelectedRows([]);
    } catch (error) {
      console.error("Lỗi tra cứu:", error);
      toast.error("Không thể tải danh sách lượt hiến máu");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (session && session.length > 0 && selectedRows.length === session.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(session.map((row) => row.dsession_id));
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const totalSessions = session?.length || 0;

    return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Thống Kê Lượt Hiến Máu</h1>
          <p className="text-sm text-slate-500">
            Tra cứu, lọc và xuất dữ liệu danh sách các lượt hiến máu
          </p>
        </div>
        <Button variant="outline" className="flex items-center gap-2 border-slate-300">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          Xuất Excel
        </Button>
      </div>

      {/* Bộ Lọc Tìm Kiếm */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            Bộ Lọc Tra Cứu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmitFilter)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Mã Túi Máu */}
              <div className="space-y-1.5">
                <Label htmlFor="mstui" className="text-xs font-medium">Mã Túi Máu</Label>
                <Input
                  id="mstui"
                  placeholder="Nhập mã túi máu..."
                  {...form.register("mstui")}
                  className="bg-white"
                />
              </div>

              {/* Mã Người Hiến / CCCD */}
              <div className="space-y-1.5">
                <Label htmlFor="donor_id" className="text-xs font-medium">Mã Người Hiến / CCCD</Label>
                <Input
                  id="donor_id"
                  placeholder="Nhập Mã / CCCD người hiến..."
                  {...form.register("donor_id")}
                  className="bg-white"
                />
              </div>

              {/* Nhóm Máu ABO */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Nhóm Máu ABO</Label>
                <Controller
                  control={form.control}
                  name="abo"
                  render={({ field }) => (
                    <Select 
                      value={field.value || "all"} 
                      onValueChange={(val) => field.onChange(val === "all" ? "" : val)}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Chọn nhóm máu" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả nhóm máu</SelectItem>
                        <SelectItem value="A">Nhóm A</SelectItem>
                        <SelectItem value="B">Nhóm B</SelectItem>
                        <SelectItem value="O">Nhóm O</SelectItem>
                        <SelectItem value="AB">Nhóm AB</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Nhóm Máu RhD */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Yếu Tố RhD</Label>
                <Controller
                  control={form.control}
                  name="rhd"
                  render={({ field }) => (
                    <Select 
                      value={field.value || "all"} 
                      onValueChange={(val) => field.onChange(val === "all" ? "" : val)}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Chọn RhD" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả RhD</SelectItem>
                        <SelectItem value="+">Rh(+)</SelectItem>
                        <SelectItem value="-">Rh(-)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Ngày Hiến Từ... */}
              <div className="space-y-1.5">
                <Label htmlFor="fromDate" className="text-xs font-medium">Ngày Hiến Từ</Label>
                <Input
                  id="fromDate"
                  type="date"
                  {...form.register("fromDate")}
                  className="bg-white"
                />
              </div>

              {/* Ngày Hiến Đến... */}
              <div className="space-y-1.5">
                <Label htmlFor="toDate" className="text-xs font-medium">Ngày Hiến Đến</Label>
                <Input
                  id="toDate"
                  type="date"
                  {...form.register("toDate")}
                  className="bg-white"
                />
              </div>

              {/* Trạng Thái Trì Hoãn */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Trạng Thái Hiến</Label>
                <Controller
                  control={form.control}
                  name="trihoan"
                  render={({ field }) => (
                    <Select 
                      value={field.value || "all"} 
                      onValueChange={(val) => field.onChange(val === "all" ? "" : val)}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value="false">Hiến thành công</SelectItem>
                        <SelectItem value="true">Trì hoãn hiến</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Nút Thao Tác (Button Group) */}
              <div className="flex items-end gap-2 lg:col-span-1">
                <Button type="submit" disabled={loading} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                  <Search className="w-4 h-4 mr-2" />
                  {loading ? "Đang lọc..." : "Tra Cứu"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleResetFilter}
                  title="Đặt lại bộ lọc"
                  className="px-3 border-slate-300"
                >
                  <RotateCcw className="w-4 h-4 text-slate-600" />
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Bảng Dữ Liệu Shadcn UI Table */}
      <Card className="bg-white border-slate-200 overflow-hidden">
        <CardHeader className="pb-3 border-b bg-slate-50/50 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Kết Quả Tra Cứu ({session?.length})
          </CardTitle>
          {selectedRows.length > 0 && (
            <span className="text-xs font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
              Đã chọn {selectedRows.length} dòng
            </span>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-100/70 hover:bg-slate-100/70">
                  <TableHead className="w-10 text-center">
                    <Checkbox 
                      checked={session.length > 0 && selectedRows.length === session.length}
                      onCheckedChange={handleSelectAll}
                      aria-label="Chọn tất cả"
                    />
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 w-12 text-center">STT</TableHead>
                  <TableHead className="font-semibold text-slate-700">Mã Túi Máu</TableHead>
                  <TableHead className="font-semibold text-slate-700">Mã / Tên Người Hiến</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center">Nhóm Máu</TableHead>
                  <TableHead className="font-semibold text-slate-700">Ngày Hiến</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">Thể Tích</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center">Loại CP</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center">Trạng Thái</TableHead>
                  <TableHead className="font-semibold text-slate-700">Ghi Chú / Lý Do</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
  {!session || session.length === 0 ? (
    <TableRow>
      <TableCell colSpan={10} className="text-center py-8 text-slate-500">
        Không tìm thấy lượt hiến máu nào phù hợp với bộ lọc.
      </TableCell>
    </TableRow>
  ) : (
    session.map((row, index) => {
      const isSelected = selectedRows.includes(row.dsession_id);
      return (
        <TableRow 
          key={row.dsession_id}
          className={`cursor-pointer transition-colors ${
            isSelected ? "bg-red-50/70 hover:bg-red-50" : "hover:bg-slate-50/40"
          }`}
          onClick={() => handleSelectRow(row.dsession_id)}
        >
          {/* Checkbox chọn dòng */}
          <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
            <Checkbox 
              checked={isSelected}
              onCheckedChange={() => handleSelectRow(row.dsession_id)}
              aria-label={`Chọn lượt hiến ${row.mstui || index + 1}`}
            />
          </TableCell>

          {/* STT */}
          <TableCell className="font-medium text-center text-slate-500 w-12">
            {index + 1}
          </TableCell>

          {/* Mã túi */}
          <TableCell className="font-semibold text-red-600">
            {row.mstui || "—"}
          </TableCell>

          {/* Người hiến */}
          <TableCell>
            <div className="font-medium text-slate-900">
              {typeof row.donor_id === "object"
                ? row.donor_id?.donor_name || row.donor_name
                : row.donor_name || "N/A"}
            </div>
          </TableCell>

          {/* Nhóm máu */}
          <TableCell className="text-center">
            <Badge variant="outline" className="font-bold border-red-200 bg-red-50 text-red-700">
              {typeof row.donor_id === "object"
                ? `${row.donor_id?.donor_abo || ""} ${row.donor_id?.donor_rhd || ""}`
                : `${row.nhom_mau_abo || ""} ${row.rhd || ""}`}
            </Badge>
          </TableCell>

          {/* Ngày hiến */}
          <TableCell>
            {row.ngayhien ? new Date(row.ngayhien).toLocaleDateString("vi-VN") : "—"}
          </TableCell>

          {/* Thể tích */}
          <TableCell className="text-right font-medium">
            {row.thetichhien ? `${row.thetichhien} ml` : "0 ml"}
          </TableCell>

          {/* Loại chế phẩm */}
          <TableCell className="text-center">
            <Badge variant="secondary" className="bg-slate-100 text-slate-800 border-slate-200">
              {row.loaicp || "MTP"}
            </Badge>
          </TableCell>

          {/* Trạng thái Trì hoãn */}
          <TableCell className="text-center">
            {row.trihoan ? (
              <Badge variant="destructive" className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-300">
                Trì hoãn
              </Badge>
            ) : (
              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-300">
                Thành công
              </Badge>
            )}
          </TableCell>

          {/* Lý do trì hoãn */}
          <TableCell className="text-xs text-slate-500 max-w-[200px] truncate">
            {row.trihoan ? row.lidotrihoan || "Không ghi rõ" : "—"}
          </TableCell>
        </TableRow>
      );
    })
  )}
</TableBody>

<TableFooter className="bg-slate-50/80">
  <TableRow>
    <TableCell colSpan={10} className="p-3">
      <div className="flex items-center justify-between text-xs text-slate-600">
        <div className="font-medium flex items-center gap-2">
          <span>Đã chọn:</span>
          <span className="font-bold text-red-600 text-sm">{selectedRows.length}</span>
          <span>/</span>
          <span className="font-bold text-slate-900 text-sm">{totalSessions}</span>
          <span>lượt hiến</span>
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
    </div>
  );
}
