'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { GlobalConfig } from '@/models/global-config';

export default function WelcomePage() {
  const router = useRouter();
  const firestore = useFirestore();

  const configDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'globalConfig', 'system');
  }, [firestore]);

  const { data: config, isLoading } = useDoc<GlobalConfig>(configDocRef);

  useEffect(() => {
    // Solo intentar la redirección si la carga ha finalizado y tenemos un ID de negocio.
    if (!isLoading && config?.mainBusinessId) {
      router.replace(`/landing/${config.mainBusinessId}`);
    }
  }, [config, isLoading]);

  // Si la carga aún está en progreso, muestra el spinner.
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando la página principal del negocio...</p>
        </div>
      </div>
    );
  }

  // Si la carga ha finalizado, pero no hay config o mainBusinessId, muestra un mensaje de error.
  // Esto rompe el bucle de carga.
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h1 className="text-xl font-bold">Sitio en Configuración</h1>
        <p className="text-muted-foreground max-w-sm">
          La página principal aún no ha sido configurada por el administrador. Por favor, vuelve a intentarlo más tarde.
        </p>
      </div>
    </div>
  );
}
