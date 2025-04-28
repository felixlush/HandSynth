import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"


export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <div className="flex h-screen overflow-scroll">
                <div className="">
                    <AppSidebar />
                </div>
                <main className="flex-1 overflow-auto">
                    <div>
                        {children}
                    </div>
                </main>
            </div>
        </SidebarProvider>
    )
}