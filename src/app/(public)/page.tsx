
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// Hardcoded business ID for the single business this application serves.
// This should be the UID of the primary "cliente_admin" user.
const MAIN_BUSINESS_ID = "b400vToRINgGGziJeHR3dQYFojw2"; 

export default function WelcomePage() {
  const router = useRouter();

  useEffect(() => {
    // Immediately redirect to the public landing page for the main business.
    router.replace(`/landing/${MAIN_BUSINESS_ID}`);
  }, [router]);

  // Display a loading state while the redirection occurs.
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Cargando la página principal del negocio...</p>
      </div>
    </div>
  );
}
