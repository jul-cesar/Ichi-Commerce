import AdminSidebar from "@/components/admin/AdminSidebar";
import type React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
      <AdminSidebar />
      <div className="flex flex-col">
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
