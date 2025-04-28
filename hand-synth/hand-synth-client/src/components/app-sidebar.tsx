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
import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"
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
        url: "/pages/about",
        icon: Inbox,
        },
        {
        title: "Calendar",
        url: "#",
        icon: Calendar,
        },
        {
        title: "Search",
        url: "#",
        icon: Search,
        },
        {
        title: "Settings",
        url: "#",
        icon: Settings,
        },
    ]
    
    export function AppSidebar() {
        return (
        <Sidebar collapsible="icon">
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>WaveForm</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
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