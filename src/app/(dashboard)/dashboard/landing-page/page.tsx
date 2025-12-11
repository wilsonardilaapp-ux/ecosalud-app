
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Save } from 'lucide-react';
import type { LandingPageData } from '@/models/landing-page';
import EditorLandingForm from '@/components/landing-page/editor-landing-form';
import EditorLandingPreview from '@/components/landing-page/editor-landing-preview';
import { v4 as uuidv4 } from 'uuid';
import { useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

// Initial state for a new landing page
const initialLandingPageData: LandingPageData = {
  hero: {
    title: 'Innovación que impulsa tu negocio al futuro',
    subtitle: 'Transformamos tecnología en crecimiento real',
    additionalContent: '<p>En <strong>PS-USER</strong>, combinamos innovación, estrategia y tecnología para impulsar la transformación digital de tu negocio. Desarrollamos soluciones inteligentes en software, automatización, inteligencia artificial y presencia digital que optimizan tus procesos y potencian tus resultados. Nuestro equipo experto te acompaña en cada paso, desde la planificación hasta la implementación, garantizando eficiencia, seguridad y crecimiento sostenible. Conviértete en una empresa más ágil, competitiva y conectada con el futuro. <strong>PS-USER</strong>, tu aliado tecnológico para alcanzar el éxito en la era digital.</p>',
    imageUrl: 'https://picsum.photos/seed/vintagecar/1200/800',
    ctaButtonText: 'Contáctanos',
    ctaButtonUrl: '#contact',
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
    buttonColor: '#4CAF50',
  },
  navigation: {
    enabled: true,
    logoUrl: '',
    businessName: 'Vidaplena',
    logoAlt: 'Logo de Vidaplena',
    logoWidth: 120,
    logoAlignment: 'left',
    links: [
      { id: uuidv4(), text: 'Inicio', url: '#', openInNewTab: false, enabled: true },
      { id: uuidv4(), text: 'Servicios', url: '#', openInNewTab: false, enabled: true },
      { id: uuidv4(), text: 'Contacto', url: '#', openInNewTab: false, enabled: true },
      { id: uuidv4(), text: 'Catálogo', url: '#', openInNewTab: false, enabled: true },
      { id: uuidv4(), text: 'Blog', url: '#', openInNewTab: false, enabled: true },
    ],
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
    hoverColor: '#4CAF50',
    fontSize: 16,
    spacing: 4,
    useShadow: true,
  },
  sections: [],
  testimonials: [],
  seo: {
    title: 'Vidaplena | Soluciones Innovadoras',
    description: 'Ofrecemos soluciones innovadoras para impulsar tu negocio al siguiente nivel.',
    keywords: ['innovación', 'tecnología', 'negocio'],
  },
  form: {
    fields: [
        { id: uuidv4(), label: 'Nombre Completo', type: 'text', placeholder: 'ej. Juan Pérez', required: true },
        { id: uuidv4(), label: 'Correo Electrónico', type: 'email', placeholder: 'ej. juan.perez@correo.com', required: true },
        { id: uuidv4(), label: 'WhatsApp', type: 'tel', placeholder: 'ej. 3001234567', required: false },
        { id: uuidv4(), label: 'Mensaje', type: 'textarea', placeholder: 'Escribe tu consulta aquí...', required: true },
    ],
    destinationEmail: '',
  },
  header: {
    banner: {
      mediaUrl: null,
      mediaType: null,
    },
    businessInfo: {
      name: 'Vidaplena',
      address: 'Calle Falsa 123',
      phone: '+57 300 123 4567',
      email: 'info@tunegocio.com',
    },
    socialLinks: {
      tiktok: '',
      instagram: '',
      facebook: '',
      whatsapp: '',
      twitter: '',
      youtube: '',
    },
    carouselItems: [
      { id: uuidv4(), mediaUrl: null, mediaType: null, slogan: '' },
      { id: uuidv4(), mediaUrl: null, mediaType: null, slogan: '' },
      { id: uuidv4(), mediaUrl: null, mediaType: null, slogan: '' },
    ],
  }
};

export default function LandingPageBuilder() {
  const [landingPageData, setLandingPageData] = useState<LandingPageData>(initialLandingPageData);
  const [isSaving, setIsSaving] = useState(false);
  
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const landingPageDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    // We use a single document 'main' for the landing page configuration
    return doc(firestore, 'businesses', user.uid, 'landingPages', 'main');
  }, [firestore, user]);

  const { data: savedData, isLoading } = useDoc<LandingPageData>(landingPageDocRef);

  useEffect(() => {
    if (savedData) {
      // Create a mutable copy of the saved data
      const dataCopy = JSON.parse(JSON.stringify(savedData));

      // --- Temporary Migration to fix old names ---
      if (dataCopy.navigation.businessName === 'Mi Negocio') {
        dataCopy.navigation.businessName = 'Vidaplena';
      }
      if (dataCopy.header.businessInfo.name === 'Mi Negocio') {
        dataCopy.header.businessInfo.name = 'Vidaplena';
      }
      // --- End Migration ---


      // Ensure the form and fields exist
      if (!dataCopy.form) {
        dataCopy.form = { fields: [], destinationEmail: '' };
      }
      if (!dataCopy.form.fields) {
        dataCopy.form.fields = [];
      }

      // Check if the WhatsApp field already exists by its label
      const whatsAppFieldExists = dataCopy.form.fields.some(
        (field: { label: string; }) => field.label.toLowerCase() === 'whatsapp'
      );

      // If it doesn't exist, add it
      if (!whatsAppFieldExists) {
        const whatsAppFieldIndex = dataCopy.form.fields.findIndex(
            (field: { type: string; }) => field.type === 'textarea'
        );
        const newField = { 
            id: uuidv4(), 
            label: 'WhatsApp', 
            type: 'tel', 
            placeholder: 'ej. 3001234567', 
            required: false 
        };

        if (whatsAppFieldIndex !== -1) {
            // Insert before the message field
            dataCopy.form.fields.splice(whatsAppFieldIndex, 0, newField);
        } else {
            // Or add at the end if message field is not found
            dataCopy.form.fields.push(newField);
        }
      }

      setLandingPageData(dataCopy);
    }
  }, [savedData]);

  const handleSave = () => {
    if (!landingPageDocRef) return;
    setIsSaving(true);
    
    // Using the non-blocking update function
    setDocumentNonBlocking(landingPageDocRef, landingPageData, { merge: true });

    // Simulate network latency for user feedback, but the write is already queued
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Configuración Guardada",
        description: "Tu landing page ha sido actualizada.",
      });
    }, 1000);
  };
  
  if (isLoading) {
    return <div>Cargando configuración de la landing page...</div>
  }

  return (
    <div className="flex flex-col gap-6">
        <Card>
            <CardHeader className="flex flex-row justify-between items-center">
                <div>
                    <CardTitle>Constructor de Landing Page</CardTitle>
                    <CardDescription>Personaliza y previsualiza la página de tu negocio en tiempo real.</CardDescription>
                </div>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white-900 mr-2" />
                    ) : (
                        <Save className="mr-2 h-4 w-4" />
                    )}
                    Guardar Toda la Configuración
                </Button>
            </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <EditorLandingForm data={landingPageData} setData={setLandingPageData} />
            </div>
            <div className="lg:col-span-1">
                 <EditorLandingPreview data={landingPageData} />
            </div>
        </div>
    </div>
  );
}
