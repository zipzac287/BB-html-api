import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTuiMauStore } from "@/stores/useTuiMauStore";
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Loader2, Scissors } from "lucide-react";

const splitFormSchema = z.object({
  com_type: z.string().optional(),
  thetich: z.number().optional(),
  ngayhien: z.string().optional(),
  hsd: z.string().optional(),
  ngayChietTach: z.string().min(1, "Vui lòng chọn ngày chiết tách"),
  selectedParentId: z.string({
  required_error: "Vui lòng chọn 1 túi máu cha từ bảng",
  }).min(1, "Vui lòng chọn 1 túi máu cha từ bảng")
});

const COMPONENT_OPTIONS = {
  "Khối hồng cầu": "R",
  "Huyết tương tươi đông lạnh": "FP",
  "Khối tiểu cầu": "P",
  "Tủa lạnh": "CRO",
};
const loaithetich = [
  25,
  50,
  150,
  200,
  250,
  350,
  450,
  500
];
const COMPONENT_PREFIX = {
  "Khối hồng cầu": "KHC",
  "Huyết tương tươi đông lạnh": "HTTDL",
  "Khối tiểu cầu": "TCPOOL",
  "Tủa lạnh": "TL"
};

export default function ChietTachTuiMau() {
  const { tuiMauList, loading, fetchTuiMau, splitTM } = useTuiMauStore();

  // State bộ lọc tìm kiếm túi cha
  const [filter, setFilter] = useState({
    matm: "",
    blood_type: "",
    rhd: "",
    ngayhien: "",
  });

  // React Hook Form kết hợp với Zod Validator
  const form = useForm({
    resolver: zodResolver(splitFormSchema),
    defaultValues: {
      selectedParentId: "",
      childRows: [
        { com_type: "", thetich: undefined, ngayhien: "", hsd: "", ngaychiettach: "" },
        { com_type: "", thetich: undefined, ngayhien: "", hsd: "", ngaychiettach: "" },
        { com_type: "", thetich: undefined, ngayhien: "", hsd: "", ngaychiettach: "" },
        { com_type: "", thetich: undefined, ngayhien: "", hsd: "", ngaychiettach: "" },
      ],
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "childRows",
  });

  const selectedParentId = form.watch("selectedParentId");

  // Tìm kiếm túi máu cha
  const handleSearch = () => {
    fetchTuiMau({
      matm: filter.matm,
      blood_type: filter.blood_type,
      rhd: filter.rhd,
      ngayhien: filter.ngayhien,
      tinhtrang: "Nhập kho thô",
    });
  };
  const tinhhsd = (com_type,ngayhien) => {
    const date = new Date(ngayhien);
    if (isNaN(date.getTime())) return "";
    const selfday = {
      "Khối hồng cầu": 42,
      "Huyết tương tươi đông lạnh": 720,
      "Khối tiểu cầu":5,
      "Tủa lạnh": 365,
    };
    const ngaythem = selfday[com_type] || 0;
    date.setDate(date.getDate() + ngaythem);
    return date.toISOString().split("T")[0];
  }
  const handleSelectParent = (bag) => {
    const isCurrent = selectedParentId === bag._id;
    const newId = isCurrent ? "" : bag._id;
    form.setValue("selectedParentId", newId, { shouldValidate: true });

    // Tự động gán Ngày hiến của túi cha vào 4 dòng con
    const ngayhienFormatted = bag.ngayhien ? bag.ngayhien.split("T")[0] : "";
    const currentRows = form.getValues("childRows");
    const updatedRows = currentRows.map((row) => ({
      ...row,
      ngayhien: isCurrent ? "" : ngayhienFormatted,
    }));
    form.setValue("childRows", updatedRows);
  };

  // Submit Form Chiết Tách
  const onSubmit = async (data) => {
    const selectedParent = tuiMauList.find((b) => b._id === data.selectedParentId);
    const child = form.getValues("childRows");
    // Filter chỉ lấy các dòng con có nhập thông tin hợp lệ
    const validTuicon = (child)
      .filter((row) => 
        row.com_type && 
        row.com_type.trim() !== "" && 
        row.thetich !== undefined && 
        row.thetich !== null && 
        !isNaN(Number(row.thetich)) &&
        Number(row.thetich) > 0 &&
        row.hsd && 
        row.hsd.trim() !== ""
      )
      .map((row, index) => {
        const prefix = COMPONENT_OPTIONS[row.com_type];
        const mautuicon = `${prefix}${selectedParent?.matm}`;
        return {
        matm: mautuicon,
        com_type: COMPONENT_PREFIX[row.com_type],
        thetich: Number(row.thetich),
        hsd: row.hsd,
        location: " ",
        ngaychiettach: form.ngayChietTach,
        };
      });
    console.log(validTuicon);
    const res = await splitTM(selectedParentId, validTuicon);
    if (res?.success) {
      alert("Chiết tách túi máu thành công!");
      form.reset({
        selectedParentId: "",
        childRows: [
          { com_type: "", thetich: undefined, ngayhien: "", hsd: "", ngaychiettach: "" },
          { com_type: "", thetich: undefined, ngayhien: "", hsd: "", ngaychiettach: "" },
          { com_type: "", thetich: undefined, ngayhien: "", hsd: "", ngaychiettach: "" },
          { com_type: "", thetich: undefined, ngayhien: "", hsd: "", ngaychiettach: "" },
        ],
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-6xl">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản Lý Chiết Tách Túi Máu</h1>
          <p className="text-sm text-muted-foreground">
            Tìm kiếm túi máu gốc và tạo các chế phẩm máu con tương ứng.
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* SECTION 1: SEARCH FILTER */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">1. Tìm kiếm thông tin túi máu cha</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Ngày chiết tách</Label>
                <Input
                  type="date"
                  {...form.register("ngayChietTach")}
                />
              </div>

              <div className="space-y-2">
                <Label>Mã túi máu</Label>
                <Input
                  placeholder="Nhập mã túi..."
                  value={filter.matm}
                  onChange={(e) => setFilter({ ...filter, matm: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Nhóm máu (ABO)</Label>
                <Select
                  value={filter.blood_type}
                  onValueChange={(val) => setFilter({ ...filter, blood_type: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="-- Tất cả --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">-- Tất cả --</SelectItem>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="AB">AB</SelectItem>
                    <SelectItem value="O">O</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Yếu tố RhD</Label>
                <Select
                  value={filter.rhd}
                  onValueChange={(val) => setFilter({ ...filter, rhd: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="-- Tất cả --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">-- Tất cả --</SelectItem>
                    <SelectItem value="Rh+">Rh(+)</SelectItem>
                    <SelectItem value="Rh-">Rh(-)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ngày hiến</Label>
                <Input
                  type="date"
                  value={filter.ngayhien}
                  onChange={(e) => setFilter({ ...filter, ngayhien: e.target.value })}
                />
              </div>

              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={handleSearch}
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  Tìm kiếm
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 2: TABLE SEARCH RESULTS */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">2. Danh sách túi máu tìm kiếm</CardTitle>
          </CardHeader>
          <CardContent>
            {form.formState.errors.selectedParentId && (
              <p className="text-sm font-medium text-destructive mb-2">
                {form.formState.errors.selectedParentId.message}
              </p>
            )}
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px] text-center">Chọn</TableHead>
                    <TableHead>Mã túi máu</TableHead>
                    <TableHead>Nhóm máu</TableHead>
                    <TableHead>RhD</TableHead>
                    <TableHead>Thể tích</TableHead>
                    <TableHead>Ngày hiến</TableHead>
                    <TableHead>Tình trạng</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tuiMauList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground h-24">
                        Chưa có dữ liệu. Hãy bấm "Tìm kiếm".
                      </TableCell>
                    </TableRow>
                  ) : (
                    tuiMauList.map((bag) => {
                      const isSelected = selectedParentId === bag._id;
                      return (
                        <TableRow
                          key={bag._id}
                          className={isSelected ? "bg-muted/50 font-medium" : ""}
                        >
                          <TableCell className="text-center">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleSelectParent(bag)}
                            />
                          </TableCell>
                          <TableCell className="font-semibold">{bag.matm}</TableCell>
                          <TableCell>{bag.blood_type}</TableCell>
                          <TableCell>{bag.rhd}</TableCell>
                          <TableCell>{bag.thetich} ml</TableCell>
                          <TableCell>
                            {bag.ngayhien ? bag.ngayhien.split("T")[0] : ""}
                          </TableCell>
                          <TableCell>{bag.tinhtrang}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 3: 4 ROWS CHILD COMPONENTS */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              3. Chọn thành phần chiết tách (Tối đa 4 thành phần)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {form.formState.errors.childRows?.root && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.childRows.root.message}
              </p>
            )}
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px] text-center">STT</TableHead>
                    <TableHead className="w-[260px]">Thành phần chế phẩm</TableHead>
                    <TableHead className="w-[160px]">Thể tích (ml)</TableHead>
                    <TableHead className="w-[180px]">Ngày hiến</TableHead>
                    <TableHead className="w-[180px]">Hạn sử dụng (HSD)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell className="text-center font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <Select
                          value={form.watch(`childRows.${index}.com_type`) || ""}
                          onValueChange={(val) => {
                            form.setValue(`childRows.${index}.com_type`, val, { shouldValidate: true });
                            const ngayhien1 = form.getValues(`childRows.${index}.ngayhien`);
                            if (ngayhien1 && val) {
                              const hsd1 = tinhhsd(val,ngayhien1);
                              form.setValue(`childRows.${index}.hsd`,hsd1,{shouldValidate: true});
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="-- Chọn thành phần --" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(COMPONENT_OPTIONS).map((name) => (
                              <SelectItem key={name} value={name}>
                                {name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={form.watch(`childRows.${index}.thetich`)?.toString() || ""}
                          onValueChange = {(opt) => {
                            const sothetich = Number(opt);
                            form.setValue(`childRows.${index}.thetich`, sothetich,{shouldValidate: true});
                          }}
                        >
                        <SelectTrigger>
                          <SelectValue placeholder="-- Chọn thể tích --"/>
                  
                        </SelectTrigger>
                        <SelectContent>
                          {loaithetich.map((opt) => (
                            <SelectItem key={opt} value={opt.toString()}>
                              {opt} ml
                            </SelectItem>
                          ))}
                        </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          {...form.register(`childRows.${index}.ngayhien`)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          {...form.register(`childRows.${index}.hsd`)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 4: SUBMIT BUTTON */}
        <div className="flex justify-end">
          <Button
            type="submit"
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700 font-semibold"
            disabled={loading || !selectedParentId}
          >
            {loading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Scissors className="mr-2 h-5 w-5" />
            )}
            XÁC NHẬN CHIẾT TÁCH
          </Button>
        </div>
      </form>
    </div>
  );
}