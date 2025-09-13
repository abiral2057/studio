"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  Menu,
} from "lucide-react";
import { AppLogo } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  const navContent = (
    <>
      <div className="px-4 py-6">
        <Link href="/" className="flex items-center gap-2">
          <AppLogo className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold tracking-tight">KhaataBook</span>
        </Link>
      </div>
      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className="w-full justify-start gap-3"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 mt-auto">
        <Button variant="ghost" className="w-full justify-start gap-3">
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <div className="md:hidden p-4 flex items-center">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 flex flex-col w-72">
            {navContent}
          </SheetContent>
        </Sheet>
        <Link href="/" className="flex items-center gap-2 ml-4">
          <AppLogo className="w-7 h-7 text-primary" />
          <span className="text-lg font-bold tracking-tight">KhaataBook</span>
        </Link>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 border-r bg-card">
        {navContent}
      </aside>
    </>
  );
}
