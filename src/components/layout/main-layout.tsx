"use client";

import { usePathname } from "next/navigation";
import { BottomNavbar } from "./bottom-navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuth } from "@/hooks/use-auth";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  // This check can be useful to avoid flashing layout on redirect
  if (!isAuthenticated && typeof window !== 'undefined') {
    return null; // Or a loading spinner
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col pb-16 md:pb-0">
        {children}
      </main>
      <BottomNavbar />
    </div>
  );
}
