import React,{ useEffect } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SearchForm } from '@/components/search-form'
import { SidebarInset, SidebarProvider,SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/stores/useAuthStore';
import { useNavigate } from 'react-router-dom';
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

  useEffect(() => {
    // Nếu không có user trong Zustand (nghĩa là chưa đăng nhập hoặc F5 mất RAM)
    if (!user && !loading) {
      console.log("Bị đá về login vì user là:", user, "và loading là:", loading);
      navigate('/login'); 
    }
  }, [user,loading, navigate]);

  // Trong lúc chờ chuyển hướng, không vẽ giao diện ra để tránh bị lộ thông tin (nhấp nháy)
  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Đang xác thực quyền truy cập...</p>
      </div>
    );
  }
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
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 relative z-10">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Build Your Application</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Data Fetching</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
        </div>
    </SidebarInset>

    </SidebarProvider>
</div>
  )
}

export default Menu