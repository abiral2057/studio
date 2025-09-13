import { BottomNavbar } from "./bottom-navbar";
import { Sidebar } from "@/components/layout/sidebar";

export function MainLayout({ children }: { children: React.ReactNode }) {
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
