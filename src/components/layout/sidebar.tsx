"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";
import { AppLogo } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
        <Link href="/settings">
          <Button variant={pathname === "/settings" ? "secondary" : "ghost"} className="w-full justify-start gap-3">
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </Button>
        </Link>
      </div>
    </>
  );

  return (
     <aside className="hidden md:flex md:flex-col md:w-64 border-r bg-card">
        {navContent}
      </aside>
  );
}
