"use client";

import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white">
        <SessionProvider>
          <SidebarProvider>
            <AppSidebar />
            <main className="p-4">
              <SidebarTrigger />
              {children}
            </main>
          </SidebarProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
