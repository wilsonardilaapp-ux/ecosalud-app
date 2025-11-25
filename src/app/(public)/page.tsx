
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
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
    // Si la configuración ya cargó y tenemos un ID de negocio principal, redirigimos.
    if (!isLoading && config?.mainBusinessId) {
      router.replace(`/landing/${config.mainBusinessId}`);
    }
    // Si no hay ID de negocio configurado, el usuario se quedará en esta página de carga.
    // Podríamos añadir un mensaje de "Sitio en configuración" aquí.
  }, [router, config, isLoading]);

  // Muestra un estado de carga mientras se obtiene la configuración.
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Cargando la página principal del negocio...</p>
      </div>
    </div>
  );
}
