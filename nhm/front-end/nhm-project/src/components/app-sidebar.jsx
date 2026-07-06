import * as React from "react"

import { SearchForm } from "@/components/search-form"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarFooter,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GalleryVerticalEndIcon, PlusIcon, MinusIcon, LogOut, KeyRound, ChevronUp } from "lucide-react";
import { Link,useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

// This is sample data.
export const data = {
  navMain: [
    {
      title: "Tổng quan",
      url: "/tong-quan",
      items: [
        { title: "Dashboard", url: "/tong-quan/dashboard"},
      ]
    },
    {
      title: "Người hiến máu",
      url: "/nguoi-hien-mau",
      items: [
        { title: "Nhập thông tin người hiến", url: "/nguoi-hien-mau/nhap-thong-tin" },
        { title: "Tìm thông tin người hiến", url: "/nguoi-hien-mau/tim-thong-tin" },
        { title: "Thống kê người hiến", url: "/nguoi-hien-mau/thong-ke" },
      ],
    },
    {
      title: "Quản lý kho thô",
      url: "/quan-ly-kho-tho",
      items: [
        { title: "Nhập trực tiếp", url: "/quan-ly-kho-tho/nhap-truoc-tiep" },
        { title: "Chiết tách", url: "/quan-ly-kho-tho/chiet-tach" },
        { title: "Sàng lọc", url: "/quan-ly-kho-tho/sang-loc" },
        { title: "Hủy phế thải", url: "/quan-ly-kho-tho/huy-phe-thai" },
        { title: "Thống kê", url: "/quan-ly-kho-tho/thong-ke" },
        { title: "Tra cứu túi máu", url: "/quan-ly-kho-tho/tra-cuu" },
      ],
    },
    {
      title: "Quản lý kho sạch",
      url: "/quan-ly-kho-sach",
      items: [
        { title: "Nhập trực tiếp", url: "/quan-ly-kho-sach/nhap-truoc-tiep" },
        { title: "Nhập túi máu sạch", url: "/quan-ly-kho-sach/nhap-tui-mau-sach" },
        { title: "Chiết tách", url: "/quan-ly-kho-sach/chiet-tach" },
        { title: "Ghép túi máu/Cập nhật loại CP", url: "/quan-ly-kho-sach/ghep-tui-mau" },
        { title: "Hủy máu", url: "/quan-ly-kho-sach/huy-mau" },
        { title: "Thống kê", url: "/quan-ly-kho-sach/thong-ke" },
        { title: "Kiểm kê kho", url: "/quan-ly-kho-sach/kiem-ke" },
        { title: "Tìm túi máu", url: "/quan-ly-kho-sach/tim-tui-mau" },
        { title: "Cấp phát", url: "/quan-ly-kho-sach/cap-phat" },
      ],
    },
    {
      title: "Quản lý bệnh nhân",
      url: "/quan-ly-benh-nhan",
      items: [
        { title: "Nhập thông tin bệnh nhân", url: "/quan-ly-benh-nhan/nhap-thong-tin" },
        { title: "Xét nghiệm cấp phát", url: "/quan-ly-benh-nhan/xet-nghiem" },
        { title: "Thống kê", url: "/quan-ly-benh-nhan/thong-ke" },
        { title: "Tìm thông tin bệnh nhân", url: "/quan-ly-benh-nhan/tim-thong-tin" },
      ],
    },
    {
      title: "Cấu hình",
      url: "/cau-hinh",
      items: [
        { title: "Bổ sung tài khoản", url: "/cau-hinh/bo-sung-tai-khoan" },
        { title: "Cấu hình CPM", url: "/cau-hinh/cau-hinh-cpm" },
      ],
    },
  ],
};

export function AppSidebar({
  ...props
}) {
  const location = useLocation();
  const { user, signOut } = useAuthStore();

  const handleSignOut = async (e) => {
    e.preventDefault();
    if (window.confirm("Bạn có muốn đăng xuất không?")) {
      try {
        await signOut();
      } catch (error) {
        console.error(error);
      }
      
    }
  };
  return (
    <Sidebar {...props}>
      <SidebarHeader>
      <div className="flex flex-col gap-0.5 leading-none">
        <span className="font-medium">BloodBank App</span>
        <span className="">v1.0.0</span>
      </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {data.navMain.map((item, index) => {
              // Tự động mở danh mục cha nếu có phần tử con đang được active
              const hasActiveChild = item.items?.some(sub => location.pathname === sub.url);  
              return (
                <Collapsible 
                  key={item.title} 
                  defaultOpen={hasActiveChild} 
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton>
                        {item.title}
                        <PlusIcon className="ml-auto group-data-[state=open]/collapsible:hidden" />
                        <MinusIcon className="ml-auto group-data-[state=closed]/collapsible:hidden" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    
                    {item.items?.length ? (
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              
                              <SidebarMenuSubButton 
                                asChild 
                                className={`w-full justify-start ${
                                  location.pathname === subItem.url
                                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold text-purple-800"
                                  : "text-muted-foreground"
                                }`}
                              >
                                {/* Dùng Link của react-router-dom */}
                                <Link to={subItem.url}>{subItem.title}</Link>
                                
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    ) : null}
                  </SidebarMenuItem>
                </Collapsible>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-slate-200/60 p-2">
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
              size="lg"
              className="w-full justify-between hover:bg-slate-100/80 data-[state=open]:bg-slate-100 transition-colors">
                <div className="flex item-center gap-2.5 text-left">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-sm font-bold text-white uppercase">
                    {user?.name ? user.name.charAt(0) : "U" }
                  </div>
                  <div className="grid flex-1 text-sm leading-right">
                    <span className="truncate font-semibold text-slate-700">
                      {user?.name || "Tài khoản"}
                    </span>
                  </div>
                </div>
                <ChevronUp className="ml-auto h-4 w-4 text-slate-400 transition-transform group-data-[state=open]:rotate-180" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="end"
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl p-1 shadow-md border border-slate-200 bg-white"
            >
              <DropdownMenuItem asChild className="focus:bg-slate-50 rounded-lg cursor-pointer">
                  <Link to="/tai-khoan/doi-mat-khau" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600">
                    <KeyRound className="h-4 w-4 text-slate-400" />
                    <span>Đổi mật khẩu</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-slate-100" />
              <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="focus:bg-red-50 text-red-600 focus:text-red-600 rounded-lg cursor-pointer"
                >
                  <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium w-full">
                    <LogOut className="h-4 w-4" />
                    <span>Đăng xuất</span>
                  </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
