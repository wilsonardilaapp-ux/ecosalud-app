
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider } from '@/firebase';
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { GlobalConfig } from './models/global-config';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

// Initialize Firebase Admin SDK for server-side fetching
function initializeAdminApp(): App | null {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }
  
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        return initializeApp({
          credential: cert(serviceAccount)
        });
    } catch (e) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", e);
        return null;
    }
  }
  
  return null;
}

async function getFaviconUrl(): Promise<string> {
    const defaultFavicon = '/favicon.ico';
    
    // If adminApp could not be initialized (e.g., missing credentials), return default.
    try {
      const adminApp = initializeAdminApp();
      if (!adminApp) {
          console.warn("Firebase Admin SDK not initialized. Using default favicon.");
          return defaultFavicon;
      }
        const db = getFirestore(adminApp);
        const configRef = db.collection('globalConfig').doc('system');
        const configSnap = await configRef.get();
        
        if (configSnap.exists()) {
            const config = configSnap.data() as GlobalConfig;
            return config.faviconUrl || defaultFavicon;
        }
    } catch (error) {
        console.error("Error fetching favicon URL from Firestore:", error);
    }

    return defaultFavicon;
}


export const metadata: Metadata = {
  title: 'Vidaplena Platform',
  description: 'Plataforma para la gestión de productos de salud y bienestar.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  let faviconUrl = '/favicon.ico';
  try {
    faviconUrl = await getFaviconUrl();
  } catch (error) {
    console.warn('Could not fetch favicon, falling back to default. Error:', error);
  }

  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href={faviconUrl} sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
              <Toaster />
            </div>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
