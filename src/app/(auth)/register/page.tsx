
"use client";

import Link from "next/link";
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
import { createUserWithEmailAndPassword, signInAnonymously, linkWithCredential, EmailAuthProvider } from "firebase/auth";
import { doc } from 'firebase/firestore';
import type { Business } from '@/models/business';
import type { User as AppUser } from "@/models/user";

const registerSchema = z.object({
  name: z.string().min(1, { message: "Por favor, introduce tu nombre." }),
  email: z.string().email({ message: "Por favor, introduce un correo electrónico válido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
  confirmPassword: z.string().min(6, { message: "La confirmación de contraseña debe tener al menos 6 caracteres." })
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
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
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!isUserLoading && user && user.email) { // Check if user has an email
        router.push("/dashboard");
    }
  }, [user, isUserLoading, router]);

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    if (!auth || !firestore) return;
    
    try {
        // Step 1: Sign in anonymously to get a temporary user
        const anonymousUserCredential = await signInAnonymously(auth);
        const tempUser = anonymousUserCredential.user;

        // Step 2: Create an email/password credential
        const credential = EmailAuthProvider.credential(values.email, values.password);

        // Step 3: Link the new credential to the anonymous account
        const userCredential = await linkWithCredential(tempUser, credential);
        const newUser = userCredential.user;

        // The setDocumentNonBlocking function now handles its own permission errors
        // by emitting a contextual error. We no longer need a try/catch block around these.

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
          description: "Tu cuenta ha sido creada con éxito. Redirigiendo...",
        });
        
        // The user is optimistically navigated, auth state change will finalize the session.
        router.push("/dashboard");

    } catch (error: any) {
        // This catch block now primarily handles AUTHENTICATION errors.
        // Firestore permission errors are handled by the global error listener.
        let errorMessage = "Ha ocurrido un error inesperado.";
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'Este correo electrónico ya está en uso por otra cuenta.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'El formato del correo electrónico no es válido.';
                break;
            case 'auth/operation-not-allowed':
                errorMessage = 'El inicio de sesión por contraseña no está habilitado.';
                break;
            case 'auth/weak-password':
                errorMessage = 'La contraseña es demasiado débil.';
                break;
            case 'auth/credential-already-in-use':
                errorMessage = 'Este correo ya está vinculado a otra cuenta.';
                break;
            default:
                errorMessage = error.message || errorMessage;
                break;
        }
        toast({
            variant: "destructive",
            title: "Error al registrarse",
            description: errorMessage,
        });
    }
  }

  if (isUserLoading || (user && user.email)) {
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
          Ingresa tus datos para registrarte en la plataforma.
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
                  <FormLabel>Email</FormLabel>
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
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
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
              <Link
                href="/login"
                className="underline text-primary hover:text-primary/80"
              >
                Inicia Sesión
              </Link>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
