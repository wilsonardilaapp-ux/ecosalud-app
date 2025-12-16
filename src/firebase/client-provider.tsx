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
          let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.getElementsByTagName('head')[0].appendChild(link);
          }
          if (link.href !== newFaviconUrl) {
            link.href = newFaviconUrl;
          }
        }
      }
    }, (error) => {
        console.error("Error listening to favicon changes:", error);
    });

    return () => unsubscribe();
  }, [firestore]);

  return null; // Este componente no renderiza nada
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
