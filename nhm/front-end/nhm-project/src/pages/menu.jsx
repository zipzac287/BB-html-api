import React,{ useEffect } from 'react'
import { AppSidebar, data } from '@/components/app-sidebar'
import { SearchForm } from '@/components/search-form'
import { SidebarInset, SidebarProvider,SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/stores/useAuthStore';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const Menu = () => {
  const { user, loading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const getBreadcrumbInfo = (currentUrl) => {
    if (!data || !data.navMain) {
      return { parentTitle: "BloodBank", parentUrl: "/", childTitle: "Dữ liệu chưa tải" };
    }

    // Vòng lặp tìm kiếm
    for (const parent of data.navMain) {
      const activeChild = parent.items?.find((child) => child.url === currentUrl);
      if (activeChild) {
        return { 
          parentTitle: parent.title, 
          parentUrl: parent.items[0].url, // Nhấn vào chữ cha sẽ dẫn về trang con đầu tiên
          childTitle: activeChild.title 
        };
      }
    }
    // Trả về mặc định nếu ở trang chủ hoặc trang không cấu hình trong sidebar
    return { parentTitle: "BloodBank", parentUrl: "/", childTitle: "Tổng quan" };
  };

  // Trích xuất thông tin tiêu đề và link
  const { parentTitle, parentUrl, childTitle } = getBreadcrumbInfo(location.pathname);

  return (

<div className="min-h-screen w-full relative">
  {/* Radial Gradient Background from Top */}
  <div
    className="absolute inset-0 z-0"
    style={{
      background: "radial-gradient(125% 125% at 50% 10%, #fff 40%, #475569 100%)",
    }}
  />

    <SidebarProvider>
    <AppSidebar/>
    <SidebarInset className="bg-transparent">
      <header className="flex h-16 shrink-0 items-center gap-2 px-4 relative z-10">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink asChild>
                <Link to={parentUrl}>{parentTitle}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{childTitle}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 !rounded-none !md:rounded-none">
          <Outlet />
        </div>
    </SidebarInset>

    </SidebarProvider>
</div>
  )
}

export default Menu