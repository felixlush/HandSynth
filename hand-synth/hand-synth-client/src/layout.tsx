import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Outlet } from "react-router-dom";

export default function Layout() {
    return (
        <SidebarProvider>
        <div className="flex h-screen overflow-scroll gap-4">
            <AppSidebar />
            <main className="flex-1 overflow-y-auto p-6">
                <div className="mx-auto w-full max-w-4xl">
                    <Outlet />
                </div>
            </main>
        </div>
        </SidebarProvider>
    );
}