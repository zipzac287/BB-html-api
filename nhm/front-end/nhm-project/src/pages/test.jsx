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
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GalleryVerticalEndIcon, PlusIcon, MinusIcon, LogOut, KeyRound, ChevronUp, ChevronRight, Folder, ChevronLeft } from "lucide-react";
import { Link,useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

export function Sidebar1({
    ...props
}) {
    const { open,isMobile } = useSidebar();
    return (
<Sidebar variant="sidebar" collapsible="icon" {...props}>
    <SidebarHeader>
        {open ? (
        <div className="flex flex-col gap-0.5">
            <span className="font-medium">Header Sidebar</span>
            <span>testing</span>
        </div>
    ): (
        <div className="flex h-8 w-8 items-center justify-center rounded-md font-bold mx-auto">
            O
        </div>
    )}
    </SidebarHeader>
    <SidebarContent>
        <Collapsible className="group/collapsible">
        <SidebarGroup>
            <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex w-full justify-between">
                <span className="text-sm font-medium">group1</span>
                <PlusIcon className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-45" />
                </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton>
                        <a href="#">
                            <span>Tạo mới</span>
                        </a>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
            </CollapsibleContent>
        </SidebarGroup>
        </Collapsible>

        <Collapsible className="group/collapsible">
        <SidebarGroup>
            <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="justify-between">
                <span>Group2</span>
                <ChevronLeft className="transition-transform group-data-[state=open]/collapsible:scale-50" />
                </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
            <SidebarMenu className="gap-2">
                <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                        <Link to="/signout">
                        <LogOut className="h-4 w-4"/>
                        Đăng xuất
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                
            </SidebarMenu>
            </CollapsibleContent>
        </SidebarGroup>
        </Collapsible>
    </SidebarContent>
</Sidebar>
    );
}

const Test = () => {
    const { user, loading }= useAuthStore();

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
<Sidebar1 />
<SidebarInset className="bg-transparent">
    <header className = "flex h-10 items-center px-6">
        <SidebarTrigger />
    <span className="ml-2 font-semibold">Tựa đề </span>
    </header>
    <main className = "flex-1 p-4">
        Nội dung chính
    </main>
</SidebarInset>
</SidebarProvider>

</div>
  )
};

export default Test;