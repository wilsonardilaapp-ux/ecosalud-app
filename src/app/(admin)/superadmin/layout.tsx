"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/icons";
import { SuperAdminNav } from "@/components/layout/super-admin-nav";
import { useAuth, useUser } from "@/firebase";

const SUPER_ADMIN_EMAIL = "allseosoporte@gmail.com";

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isUserLoading) {
      return; // Espera a que termine de cargar el usuario
    }
    if (!user) {
      router.push("/login"); // Si no hay usuario, redirige a login
    } else if (user.email !== SUPER_ADMIN_EMAIL) {
      router.push("/"); // Si el usuario no es super admin, redirige a la página principal
    }
  }, [user, isUserLoading, router]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  // Muestra un estado de carga mientras se verifica el usuario
  if (isUserLoading || !user || user.email !== SUPER_ADMIN_EMAIL) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p>Cargando y verificando acceso...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeader>
          <Link href="/superadmin" className="flex items-center gap-2">
            <Logo className="w-8 h-8 text-primary" />
            <span className="text-lg font-semibold font-headline">Vidaplena</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SuperAdminNav />
        </SidebarContent>
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="justify-start w-full p-2 h-auto">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL ?? "https://picsum.photos/seed/admin/100/100"} alt="Super Admin" />
                    <AvatarFallback>{user.email?.[0].toUpperCase() ?? 'SA'}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-sm font-medium">{user.displayName ?? "Super Admin"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mb-2" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.displayName ?? "Super Admin"}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link href="/">Página principal</Link></DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>Cerrar sesión</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-40 flex items-center h-16 px-4 bg-background/80 backdrop-blur-sm border-b md:px-6">
          <div className="md:hidden">
            <SidebarTrigger />
          </div>
          <div className="ml-auto">
            {/* Header content for admin panel can go here */}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
