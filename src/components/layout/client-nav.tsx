"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  ShoppingCart,
  MessageSquare,
  CreditCard,
  ShoppingBag,
} from "lucide-react";

import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/landing-page", icon: FileText, label: "Landing Page" },
  { href: "/dashboard/catalogo", icon: ShoppingCart, label: "Catálogo" },
  { href: "/dashboard/mensajes", icon: MessageSquare, label: "Mensajes" },
  { href: "/dashboard/pedidos", icon: ShoppingBag, label: "Pedidos" },
  { href: "/dashboard/pagos", icon: CreditCard, label: "Pagos" },
];

export function ClientNav() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar(); 

  const handleLinkClick = () => {
    if (setOpenMobile) setOpenMobile(false);
  };

  return (
    <SidebarMenu className="px-2">
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname.startsWith(item.href) && (item.href !== "/dashboard" || pathname === "/dashboard")}
            tooltip={item.label}
            onClick={handleLinkClick}
            className="h-10 w-full justify-start pl-3 mb-1"
          >
            <Link href={item.href} className="flex items-center gap-3">
              <item.icon className="h-4 w-4" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
