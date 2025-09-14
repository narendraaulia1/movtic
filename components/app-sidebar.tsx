import { Clock, Home, Clapperboard, Ticket, Receipt, Users, LogOut } from "lucide-react"
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
import LogoutButton from "@/components/LogoutButton"

const items = [
  { title: "Beranda", url: "/dashboard", icon: Home },
  { title: "Daftar Film", url: "/dashboard/movies", icon: Clapperboard },
  { title: "Jadwal", url: "/dashboard/showtimes", icon: Clock },
  { title: "Tiket", url: "/dashboard/tickets", icon: Ticket },
  { title: "Transaksi", url: "/dashboard/transactions", icon: Receipt },
  { title: "Pengguna", url: "/dashboard/users", icon: Users },
]

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* Group Menu Utama */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-grey-400">Menu</SidebarGroupLabel>
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

              {/* Tambahkan Logout di paling bawah */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <LogoutButton />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
