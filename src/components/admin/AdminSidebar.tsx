"use client";

import { Box, Coins, Dices, Home, Package } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const sidebarItems = [
  {
    title: "Productos",
    href: "/admin/productos",
    icon: Package,
  },
  {
    title: "Atributos",
    href: "/admin/atributos",
    icon: Dices,
  },
  {
    title: "Categorías",
    href: "/admin/categorias",
    icon: Box,
  },
  {
    title: "Ordenes",
    href: "/admin/ordenes",
    icon: Coins,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex h-14 items-center px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Home className="h-5 w-5" />
            <span>CH GROUP Admin</span>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {sidebarItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                className={cn(
                  pathname === item.href
                    ? "bg-muted font-medium"
                    : "font-normal"
                )}
              >
                <Link href={item.href}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
