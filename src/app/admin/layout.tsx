import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import type React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="sm:grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <AdminSidebar />

        <div className="flex flex-col">
          <AdminHeader />
          <main className="w-full p-2 md:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
