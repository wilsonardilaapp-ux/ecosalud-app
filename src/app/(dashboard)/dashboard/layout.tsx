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
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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
            fileInputRef.current.value = ""; 
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
      <div className="flex h-screen w-full items-center justify-center">
        <div className="m-auto text-center">
          <p>Cargando y verificando acceso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex bg-gray-50">
      {/* --- BARRA LATERAL (Escritorio) --- */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-56 flex-col border-r bg-white md:flex">
        
        <div className="flex h-14 shrink-0 items-center border-b px-4">
            <Link href="/dashboard" className="flex items-center gap-3 font-bold text-primary hover:opacity-80 transition-opacity">
                <Logo className="w-7 h-7" />
                <span className="text-base font-semibold font-headline tracking-tight text-gray-900">Vidaplena</span>
            </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          <ClientNav />
        </nav>
        
        <div className="mt-auto p-3 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="justify-start w-full p-2 h-auto hover:bg-gray-100">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 border border-gray-200">
                    {business?.logoURL && <AvatarImage src={business.logoURL} alt={business.name} />}
                    <AvatarFallback className="bg-primary/10 text-primary">{business?.name?.[0].toUpperCase() ?? user.email?.[0].toUpperCase() ?? 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="text-left overflow-hidden">
                    <p className="text-sm font-medium truncate text-gray-900">{business?.name ?? user.displayName ?? user.email}</p>
                    <p className="text-xs text-muted-foreground">Cliente</p>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 mb-2" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none truncate">{business?.name ?? user.displayName ?? user.email}</p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleAvatarClick} className="cursor-pointer">
                Cambiar avatar
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer"><Link href="/">Página de inicio</Link></DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">Cerrar sesión</DropdownMenuItem>
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

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="flex flex-1 flex-col md:ml-56 transition-all duration-300">
        
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-white px-4 shadow-sm lg:px-6">
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                    <div className="flex h-14 shrink-0 items-center border-b px-4">
                        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-primary">
                            <Logo className="w-7 h-7" />
                            <span className="text-lg font-semibold font-headline">Vidaplena</span>
                        </Link>
                    </div>
                    <div className="flex-1 overflow-y-auto py-4">
                        <ClientNav />
                    </div>
                </SheetContent>
              </Sheet>
            </div>
          
          <div className="flex flex-1 items-center justify-end gap-4">
          </div>
        </header>

        {/* --- ÁREA DE PÁGINAS --- */}
        <main className="flex-1 bg-gray-50/50">
          <div className="mx-auto w-full max-w-7xl px-4 md:px-6 pt-6 pb-8 space-y-6"> 
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}
