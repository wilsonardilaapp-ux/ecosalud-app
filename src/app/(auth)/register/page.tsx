
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
import { useAuth, useUser, useFirestore, setDocumentNonBlocking } from "@/firebase";
import { useEffect } from "react";
import { signInAnonymously } from "firebase/auth";
import { doc } from 'firebase/firestore';
import type { Business } from '@/models/business';
import type { User as AppUser } from "@/models/user";

const registerSchema = z.object({
  name: z.string().min(1, { message: "Por favor, introduce tu nombre." }),
  email: z.string().email({ message: "Por favor, introduce un correo electrónico válido." }),
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
    },
  });

  useEffect(() => {
    // If the user is already logged in (even anonymously) and has an email,
    // they have likely completed registration. Redirect them.
    if (!isUserLoading && user && user.email) { 
        router.push("/dashboard");
    }
  }, [user, isUserLoading, router]);

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    if (!auth || !firestore) return;
    
    try {
        // Step 1: Ensure user is signed in anonymously.
        // If already signed in, it uses the existing session.
        const userCredential = await signInAnonymously(auth);
        const newUser = userCredential.user;

        // Step 2: Save user and business data to Firestore using the anonymous UID.
        // The user's identity is now tied to the Firestore documents.
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
        // This is a non-blocking call, error handling is done globally.
        setDocumentNonBlocking(userDocRef, userData);
        
        const businessDocRef = doc(firestore, 'businesses', newUser.uid);
        const businessData: Business = {
            id: newUser.uid,
            name: `${values.name}'s Business`,
            logoURL: 'https://seeklogo.com/images/E/eco-friendly-logo-7087A22106-seeklogo.com.png',
            description: 'Bienvenido a mi negocio en EcoSalud.',
        };
        setDocumentNonBlocking(businessDocRef, businessData);
        
        toast({
          title: "Cuenta Creada",
          description: "Tus datos han sido guardados con éxito. Redirigiendo...",
        });
        
        // The user is already in an anonymous session, so we just need to navigate.
        router.push("/dashboard");

    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error al Registrarse",
            description: error.message || "No se pudo completar el registro. Inténtalo de nuevo.",
        });
    }
  }

  if (isUserLoading) {
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
        <CardTitle className="text-2xl font-headline">Registrar tus Datos</CardTitle>
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
                  <FormLabel>Email de Contacto</FormLabel>
                  <FormControl>
                    <Input placeholder="nombre@ejemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Guardando..." : "Guardar y Acceder"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
