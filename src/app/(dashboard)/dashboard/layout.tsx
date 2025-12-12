"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
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
import { Logo } from "@/components/icons";
import { ClientNav } from "@/components/layout/client-nav";
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";
import type { Business } from "@/models/business";
import { uploadMedia } from "@/ai/flows/upload-media-flow";
import { useToast } from "@/hooks/use-toast";

const MAX_FILE_SIZE_MB = 1;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

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
    if (!isUserLoading && !user) {
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

      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({
            variant: 'destructive',
            title: "Archivo muy pesado",
            description: `El archivo es muy pesado. Máximo ${MAX_FILE_SIZE_MB}MB.`,
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Clear the input
        }
        return;
      }
      
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
    <div className="flex min-h-screen w-full bg-muted/40">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-background md:flex sticky top-0 h-screen overflow-y-auto z-30">
        <div className="flex h-16 shrink-0 items-center border-b px-6 bg-background">
            <Link href="/dashboard" className="flex items-center gap-2">
                <Logo className="w-8 h-8 text-primary" />
                <span className="text-lg font-semibold font-headline">Vidaplena</span>
            </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <ClientNav />
        </div>
        <div className="mt-auto p-4 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="justify-start w-full p-2 h-auto">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    {business?.logoURL && <AvatarImage src={business.logoURL} alt={business.name} />}
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
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-background/80 px-6 backdrop-blur-sm">
            {/* Mobile nav trigger could go here */}
             <div className="md:hidden">
                {/* Placeholder for mobile nav trigger */}
             </div>
            <div className="flex-1"></div>
            <div>
                {/* Potentially other header actions */}
            </div>
        </header>
        <main className="flex-1 w-full p-6 md:p-8">
          <div className="mx-auto w-full max-w-7xl space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
