'use client';

import React, { useMemo, useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import type { GlobalConfig } from '@/models/global-config';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

// Componente para manejar la actualización del Favicon en tiempo real
const FaviconUpdater = () => {
  const { firestore } = initializeFirebase();

  useEffect(() => {
    if (!firestore) return;

    const configDocRef = doc(firestore, 'globalConfig', 'system');
    
    const unsubscribe = onSnapshot(configDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const config = snapshot.data() as GlobalConfig;
        const newFaviconUrl = config.faviconUrl;
        
        if (newFaviconUrl) {
          // Eliminar todos los links de favicon existentes
          const existingLinks = document.querySelectorAll("link[rel*='icon']");
          existingLinks.forEach(link => link.remove());
          
          // Crear nuevo link con cache-busting
          const link = document.createElement('link');
          link.rel = 'icon';
          link.type = 'image/x-icon';
          // Añadir timestamp para forzar actualización
          link.href = `${newFaviconUrl}?t=${Date.now()}`;
          
          document.getElementsByTagName('head')[0].appendChild(link);
        }
      }
    }, (error) => {
      console.error("Error listening to favicon changes:", error);
    });

    return () => unsubscribe();
  }, [firestore]);

  return null;
};


export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    // Initialize Firebase on the client side, once per component mount.
    return initializeFirebase();
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      <FaviconUpdater />
      {children}
    </FirebaseProvider>
  );
}
