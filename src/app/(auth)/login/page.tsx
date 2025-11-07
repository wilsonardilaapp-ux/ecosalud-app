
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useUser } from "@/firebase";
import { signInAnonymously } from "firebase/auth";
import { useEffect, useState } from "react";
import Link from "next/link";

const SUPER_ADMIN_EMAIL = "allseosoporte@gmail.com";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!isUserLoading && user) {
      setIsRedirecting(true);
      // Allow redirection to happen based on user role
      if (user.email === SUPER_ADMIN_EMAIL) {
        router.push("/superadmin");
      } else {
        // For any other user (including anonymous), go to dashboard
        router.push("/dashboard");
      }
    }
  }, [user, isUserLoading, router]);

  const handleAnonymousLogin = async () => {
    if (!auth) return;
    try {
        await signInAnonymously(auth);
        // The useEffect will handle redirection once the user state changes.
        toast({
            title: "Accediendo...",
            description: "Serás redirigido a tu panel.",
        });
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error de Autenticación",
            description: "No se pudo iniciar sesión anónimamente. Por favor, intenta de nuevo.",
        });
    }
  }

  if (isUserLoading || isRedirecting) {
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="text-center">
            <p>Cargando y verificando sesión...</p>
            </div>
        </div>
    );
  }
  
  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-headline">Acceder o Registrarse</CardTitle>
        <CardDescription>
          Crea una nueva sesión o continúa con la existente.
        </CardDescription>
      </CardHeader>
      <CardContent>
          <p className="text-sm text-center text-muted-foreground">
              Al hacer clic en "Acceder", se creará una sesión segura para que puedas gestionar tu negocio. Si ya tienes una, continuarás donde lo dejaste.
          </p>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button
          className="w-full"
          onClick={handleAnonymousLogin}
        >
          Acceder a mi Panel
        </Button>
         <div className="text-sm text-muted-foreground">
            O bien, puedes{" "}
            <Link
            href="/register"
            className="underline text-primary hover:text-primary/80"
            >
            registrar tus datos
            </Link>
            .
        </div>
      </CardFooter>
    </Card>
  );
}
