import React from "react";
import { Users, Droplets, Activity, ClipboardList } from "lucide-react";

export default function Dashboard() {
  // Giả lập dữ liệu thời gian thực từ Database/API trong ngày hôm nay
  const stats = {
    nguoiHienTrongNgay: 45,
    benhNhanYeuCau: 18,
    tongCpmCapPhat: 32,
    // Chi tiết số liệu các Chế phẩm máu (CPM)
    cpmDetails: [
      { key: "HC", name: "Hồng cầu (HC)", duTru: 20, daCap: 15, color: "bg-red-500" },
      { key: "HT", name: "Huyết tương (HT)", duTru: 15, daCap: 10, color: "bg-amber-500" },
      { key: "TL", name: "Tiểu cầu (TL)", duTru: 8, daCap: 5, color: "bg-emerald-500" },
      { key: "TC", name: "Tủa lạnh (TC)", duTru: 5, daCap: 2, color: "bg-blue-500" },
    ]
  };

  return (
    <div className="w-full space-y-6">
      {/* KHỐI 1: CÁC TIÊU CHÍ ĐO LƯỜNG NHANH (KPI CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card: Người hiến máu */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Người hiến trong ngày</p>
            <p className="text-3xl font-bold text-slate-800">{stats.nguoiHienTrongNgay} <span className="text-sm font-medium text-slate-400">lượt</span></p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg text-red-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card: Bệnh nhân yêu cầu */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bệnh nhân yêu cầu máu</p>
            <p className="text-3xl font-bold text-slate-800">{stats.benhNhanYeuCau} <span className="text-sm font-medium text-slate-400">ca</span></p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Card: Tổng số CPM đã cấp */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng chế phẩm đã cấp</p>
            <p className="text-3xl font-bold text-slate-800">{stats.tongCpmCapPhat} <span className="text-sm font-medium text-slate-400">đơn vị</span></p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <Droplets className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* KHỐI 2: CHI TIẾT DỰ TRÙ VÀ CẤP PHÁT CÁC CHẾ PHẨM MÁU (CPM) */}
      <div className="bg-white/80 backdrop-blur-md rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-red-600" />
          <div>
            <h3 className="font-bold text-slate-800 text-base">Giám Sát Chế Phẩm Máu Trong Ngày</h3>
            <p className="text-xs text-slate-500">Bảng chi tiết thống kê số lượng dự trù lâm sàng và thực tế đã cấp phát.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100">
                <th className="p-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Loại Chế Phẩm Máu</th>
                <th className="p-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-center">Số Lượng Dự Trù</th>
                <th className="p-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-center">Số Lượng Đã Cấp</th>
                <th className="p-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Tỷ Lệ Đáp Ứng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {stats.cpmDetails.map((cpm) => {
                // Tính toán tỷ lệ đáp ứng máu lâm sàng (%)
                const percentage = Math.min(Math.round((cpm.daCap / cpm.duTru) * 100), 100);
                
                return (
                  <tr key={cpm.key} className="hover:bg-slate-50/40 transition-colors">
                    {/* Tên chế phẩm kèm dot màu nhận diện */}
                    <td className="p-4 font-semibold text-slate-700 flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${cpm.color}`} />
                      {cpm.name}
                    </td>
                    {/* Số lượng dự trù */}
                    <td className="p-4 text-center font-medium text-slate-600">
                      {cpm.duTru} <span className="text-xs text-slate-400 font-normal">túi</span>
                    </td>
                    {/* Số lượng đã cấp */}
                    <td className="p-4 text-center font-bold text-slate-800">
                      {cpm.daCap} <span className="text-xs text-slate-400 font-normal">túi</span>
                    </td>
                    {/* Thanh tiến độ trực quan */}
                    <td className="p-4 w-1/4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-medium">{percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-full ${cpm.color} transition-all duration-500`} 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Component phân cách nhỏ gọn thay thế cho thẻ hr
function Separator({ className }) {
  return <div className={`h-[1px] w-full ${className}`} />;
}