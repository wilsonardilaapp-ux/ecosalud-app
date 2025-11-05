
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Save } from 'lucide-react';
import type { LandingPageData } from '@/models/landing-page';
import EditorLandingForm from '@/components/landing-page/editor-landing-form';
import EditorLandingPreview from '@/components/landing-page/editor-landing-preview';
import { v4 as uuidv4 } from 'uuid';

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
    businessName: 'Mi Negocio',
    logoAlt: 'Logo de Mi Negocio',
    logoWidth: 120,
    logoAlignment: 'left',
    links: [
      { id: uuidv4(), text: 'Inicio', url: '#', openInNewTab: false },
      { id: uuidv4(), text: 'Servicios', url: '#', openInNewTab: false },
      { id: uuidv4(), text: 'Contacto', url: '#', openInNewTab: false },
      { id: uuidv4(), text: 'Catálogo', url: '#', openInNewTab: false },
      { id: uuidv4(), text: 'Blog', url: '#', openInNewTab: false },
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
    title: 'Mi Negocio | Soluciones Innovadoras',
    description: 'Ofrecemos soluciones innovadoras para impulsar tu negocio al siguiente nivel.',
    keywords: ['innovación', 'tecnología', 'negocio'],
  },
  form: {
    fields: [
        { id: uuidv4(), label: 'Nombre Completo', type: 'text', placeholder: 'ej. Juan Pérez', required: true },
        { id: uuidv4(), label: 'Correo Electrónico', type: 'email', placeholder: 'ej. juan.perez@correo.com', required: true },
        { id: uuidv4(), label: 'Mensaje', type: 'textarea', placeholder: 'Escribe tu consulta aquí...', required: true },
    ],
    destinationEmail: '',
  },
};


export default function LandingPageBuilder() {
  const [landingPageData, setLandingPageData] = useState<LandingPageData>(initialLandingPageData);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    console.log('Saving data:', landingPageData);
    // Here you would typically save the data to Firestore
    setTimeout(() => {
      setIsSaving(false);
      // You can add a toast notification here for success
    }, 1500);
  };
  
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
