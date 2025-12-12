
"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useUser, useFirestore, setDocumentNonBlocking, initiateEmailSignUp } from "@/firebase";
import { useEffect } from "react";
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { Business } from '@/models/business';
import type { User as AppUser } from "@/models/user";
import Link from "next/link";
import type { GlobalConfig } from "@/models/global-config";

const registerSchema = z.object({
  name: z.string().min(1, { message: "Por favor, introduce tu nombre." }),
  email: z.string().email({ message: "Por favor, introduce un correo electrónico válido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
});

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!isUserLoading && user) { 
      router.push("/dashboard");
    }
  }, [user, isUserLoading, router]);

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    if (!auth || !firestore) return;
    
    try {
      const userCredential = await initiateEmailSignUp(auth, values.email, values.password);
      const newUser = userCredential.user;

      // 1. Create user document
      const userDocRef = doc(firestore, 'users', newUser.uid);
      const userData: AppUser = {
        id: newUser.uid,
        name: values.name,
        email: values.email,
        role: 'cliente_admin',
        status: 'active',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      await setDoc(userDocRef, userData);
      
      // 2. Create business document
      const businessDocRef = doc(firestore, 'businesses', newUser.uid);
      const businessData: Business = {
        id: newUser.uid,
        name: 'Vidaplena',
        logoURL: 'https://seeklogo.com/images/E/eco-friendly-logo-7087A22106-seeklogo.com.png',
        description: 'Bienvenido a mi negocio en Vidaplena.',
      };
      await setDoc(businessDocRef, businessData);
      
      // 3. Set this new business as the main landing page IF no other is set
      const configDocRef = doc(firestore, 'globalConfig', 'system');
      const configSnap = await getDoc(configDocRef);
      
      if (!configSnap.exists() || !configSnap.data()?.mainBusinessId) {
        // Only set it if it doesn't exist or is empty
         await setDoc(configDocRef, { mainBusinessId: newUser.uid }, { merge: true });
      }
      
      toast({
        title: "Cuenta Creada con Éxito",
        description: "Serás redirigido a tu panel de control.",
      });
      
      // The useEffect will handle redirection.
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al Registrarse",
        description: error.message || "No se pudo completar el registro. Inténtalo de nuevo.",
      });
    }
  }

  if (isUserLoading || user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-headline">Crear una Cuenta</CardTitle>
        <CardDescription>
          Ingresa tus datos para crear el perfil de tu negocio.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Tu Nombre Completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input placeholder="nombre@ejemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Mínimo 6 caracteres" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Creando cuenta..." : "Crear Cuenta"}
            </Button>
             <div className="text-sm text-muted-foreground">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" className="underline text-primary hover:text-primary/80">
                Inicia sesión aquí
              </Link>
              .
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
