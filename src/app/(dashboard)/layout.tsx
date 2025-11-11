
"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
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
import { ClientNav } from "@/components/layout/client-nav";
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";
import type { Business } from "@/models/business";
import { uploadMedia } from "@/ai/flows/upload-media-flow";
import { useToast } from "@/hooks/use-toast";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const firestore = useFirestore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const businessDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'businesses', user.uid);
  }, [firestore, user]);

  const { data: business, isLoading: isBusinessLoading } = useDoc<Business>(businessDocRef);

  useEffect(() => {
    if (isUserLoading) {
      return; 
    }
    if (!user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !businessDocRef) return;
      
      toast({ title: "Subiendo imagen...", description: "Por favor, espera un momento." });

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
          const mediaDataUri = reader.result as string;
          try {
              const result = await uploadMedia({ mediaDataUri });
              setDocumentNonBlocking(businessDocRef, { logoURL: result.secure_url }, { merge: true });
              toast({ title: "¡Avatar actualizado!", description: "Tu nuevo logo se ha guardado." });
          } catch (error: any) {
              toast({ variant: 'destructive', title: "Error al subir", description: error.message });
          }
      };
  };

  if (isUserLoading || !user || isBusinessLoading) {
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
      <Sidebar>
        <SidebarHeader>
          <Link href="/dashboard" className="flex items-center gap-2">
            <Logo className="w-8 h-8 text-primary" />
            <span className="text-lg font-semibold font-headline">EcoSalud</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <ClientNav />
        </SidebarContent>
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="justify-start w-full p-2 h-auto">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    {business?.logoURL && <AvatarImage src={business.logoURL} alt={user.displayName ?? ""} />}
                    <AvatarFallback>{business?.name?.[0].toUpperCase() ?? user.email?.[0].toUpperCase() ?? 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-sm font-medium">{business?.name ?? user.displayName ?? user.email}</p>
                    <p className="text-xs text-muted-foreground">Cliente</p>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mb-2" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{business?.name ?? user.displayName ?? user.email}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleAvatarClick}>
                Cambiar avatar
              </DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/">Página de inicio</Link></DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>Cerrar sesión</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-40 flex items-center h-16 px-4 bg-background/80 backdrop-blur-sm border-b md:px-6">
          <div className="md:hidden">
            <SidebarTrigger />
          </div>
          <div className="ml-auto">
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
