import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Home, MessageCircleQuestion} from "lucide-react"
import MidiSelect from "./ui/iosettings"
   
  // Menu items.
    const items = [
        {
        title: "Home",
        url: "/",
        icon: Home,
        },
        {
        title: "About",
        url: "/about",
        icon: MessageCircleQuestion,
        }
    ]
    
    export function AppSidebar() {
        return (
        <Sidebar collapsible="icon">
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        <div className="gap-4">
                            <img src={"../../public/logo.png"} alt="WaveForm Logo" width={200} height={200} className="p-10 mt-4"></img>
                        </div>
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="mt-10">
                            {items.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild>
                                <a href={item.url}>
                                    <item.icon />
                                    <span>{item.title}</span>
                                </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
        )
    }