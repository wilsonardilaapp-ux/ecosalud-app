
'use client';

import { useMemo, useEffect, useState } from 'react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore'; // Import onSnapshot
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Loader2, Frown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LandingPageData, NavigationSection, ContentSection, TestimonialSection, FormField, LandingHeaderConfigData, GlobalConfig } from '@/models/landing-page';
import { CSSProperties } from 'react';
import { PublicContactForm } from '@/components/landing-page/public-contact-form';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay";

const PreviewBanner = ({ headerConfig }: { headerConfig: LandingHeaderConfigData }) => {
    if (!headerConfig.banner || !headerConfig.banner.mediaUrl) {
        return null;
    }

    return (
        <div className="relative aspect-[16/5] w-full">
            {headerConfig.banner.mediaType === 'image' ? (
                <Image src={headerConfig.banner.mediaUrl} alt="Banner" fill className="object-cover" />
            ) : (
                <video src={headerConfig.banner.mediaUrl} autoPlay loop muted controls={false} className="w-full h-full object-cover" />
            )}
        </div>
    );
};

const PreviewCarousel = ({ headerConfig }: { headerConfig: LandingHeaderConfigData }) => {
    if (!headerConfig.carouselItems || !headerConfig.carouselItems.some(item => item.mediaUrl)) {
        return null;
    }

    return (
        <Carousel
            className="w-full"
            opts={{ loop: true }}
            plugins={[
                Autoplay({
                    delay: 5000,
                    stopOnInteraction: true,
                }),
            ]}
        >
            <CarouselContent>
                {headerConfig.carouselItems.map(item => item.mediaUrl && (
                    <CarouselItem key={item.id}>
                        <div className="relative aspect-[16/5] w-full">
                            {item.mediaType === 'image' ? (
                                <Image src={item.mediaUrl} alt={item.slogan || 'Carousel image'} fill className="object-cover" />
                            ) : (
                                <video src={item.mediaUrl} autoPlay loop muted controls={false} className="w-full h-full object-cover" />
                            )}
                            {item.slogan && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <p className="text-white text-2xl md:text-4xl font-bold text-center drop-shadow-md p-4">{item.slogan}</p>
                                </div>
                            )}
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/50 hover:bg-white text-foreground" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/50 hover:bg-white text-foreground" />
        </Carousel>
    );
};


const PreviewNavigation = ({ navConfig }: { navConfig: NavigationSection }) => {
  if (!navConfig.enabled) {
    return null;
  }

  const navStyle: CSSProperties = {
    backgroundColor: navConfig.backgroundColor,
    color: navConfig.textColor,
    boxShadow: navConfig.useShadow ? '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' : 'none',
  };

  const linkStyle: CSSProperties = {
    fontSize: `${navConfig.fontSize}px`,
    color: navConfig.textColor
  };
  
  const hoverStyle = `
    .nav-link:hover {
      color: ${navConfig.hoverColor} !important;
    }
  `;

  return (
    <>
    <style>{hoverStyle}</style>
    <header style={navStyle} className="p-4 sticky top-0 z-50">
      <div className={cn("container mx-auto flex items-center", {
        "justify-between": navConfig.logoAlignment === 'left',
        "justify-center": navConfig.logoAlignment === 'center',
        "flex-row-reverse": navConfig.logoAlignment === 'right',
      })}>
        <div className="flex-shrink-0">
          {navConfig.logoUrl ? (
            <Image src={navConfig.logoUrl} alt={navConfig.logoAlt} width={navConfig.logoWidth} height={navConfig.logoWidth / 3} style={{height: 'auto'}} />
          ) : (
            <span className="text-xl font-bold">{navConfig.businessName}</span>
          )}
        </div>
        <nav className="hidden md:flex items-center" style={{ gap: `${navConfig.spacing * 4}px`}}>
          {navConfig.links.filter(link => link.enabled).map((link) => (
            <a key={link.id} href={link.url} target={link.openInNewTab ? '_blank' : '_self'} rel={link.openInNewTab ? 'noopener noreferrer' : ''} style={linkStyle} className="nav-link transition-colors">
              {link.text}
            </a>
          ))}
        </nav>
      </div>
    </header>
    </>
  );
};

const PreviewContentSection = ({ section }: { section: ContentSection }) => {
  const sectionStyle: CSSProperties = {
    backgroundColor: section.backgroundColor,
    color: section.textColor,
  };
  
  return (
    <section style={sectionStyle} className="py-16 px-4">
      <div className="container mx-auto text-center">
        <h2 className="text-4xl font-bold" style={{ color: section.textColor }}>{section.title}</h2>
        <p className="text-xl mt-4 mb-8" style={{ color: section.textColor }}>{section.subtitle}</p>
        <div
            className="max-w-none mx-auto"
            style={{ color: section.textColor }}
            dangerouslySetInnerHTML={{ __html: section.content }}
        />
        
        {section.subsections && section.subsections.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 text-left">
            {section.subsections.map(sub => (
              <Card key={sub.id} className="bg-card/80 backdrop-blur-sm overflow-hidden border-none shadow-lg">
                <div className="relative aspect-video w-full">
                  {sub.imageUrl && (
                    sub.mediaType === 'image' ? (
                      <Image src={sub.imageUrl} alt={sub.title} fill className="object-cover" />
                    ) : (
                      <video src={sub.imageUrl} autoPlay loop muted controls className="w-full h-full object-cover" />
                    )
                  )}
                </div>
                <CardHeader>
                  <CardTitle style={{ color: section.textColor }}>{sub.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="text-base"
                    style={{ color: section.textColor, opacity: 0.9 }}
                    dangerouslySetInnerHTML={{ __html: sub.description }}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const PreviewTestimonials = ({ testimonials }: { testimonials: TestimonialSection[] }) => {
    if (testimonials.length === 0) {
        return null;
    }
    
    return (
        <section className="bg-muted py-16 px-4">
            <div className="container mx-auto">
                <h2 className="text-4xl font-bold text-center mb-12">Lo que dicen nuestros clientes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map(testimonial => (
                        <Card key={testimonial.id} className="bg-background flex flex-col shadow-lg">
                            <CardContent className="p-8 flex-grow">
                                 <div className="flex items-center mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={cn("h-6 w-6", i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300")} />
                                    ))}
                                </div>
                                <div 
                                    className="text-muted-foreground prose max-w-none"
                                    dangerouslySetInnerHTML={{ __html: testimonial.text }}
                                />
                            </CardContent>
                             <div className="bg-muted/50 p-6 mt-auto">
                                <div className="flex items-center">
                                    <Avatar className="h-14 w-14 mr-4 border-2 border-primary">
                                        <AvatarImage src={testimonial.avatarUrl} alt={testimonial.authorName} />
                                        <AvatarFallback>{testimonial.authorName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold text-foreground">{testimonial.authorName}</p>
                                        <p className="text-sm text-muted-foreground">{testimonial.authorRole}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

const LandingPageContent = ({ businessId }: { businessId: string }) => {
    const firestore = useFirestore();
    const [pageData, setPageData] = useState<LandingPageData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!firestore || !businessId) return;

        const landingPageDocRef = doc(firestore, 'businesses', businessId, 'landingPages', 'main');
        
        const unsubscribe = onSnapshot(landingPageDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setPageData(docSnap.data() as LandingPageData);
                setError(null);
            } else {
                setError("No se encontró la configuración de la página de inicio para este negocio.");
            }
            setIsLoading(false);
        }, (err) => {
            console.error("Error fetching landing page data:", err);
            setError("Error al cargar los datos de la página.");
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [firestore, businessId]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-center px-4">
                <Frown className="h-16 w-16 text-destructive mb-4" />
                <h1 className="text-2xl font-bold text-destructive">Error al Cargar</h1>
                <p className="text-muted-foreground mt-2">{error}</p>
            </div>
        );
    }

    if (!pageData) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-center px-4">
                <Frown className="h-16 w-16 text-muted-foreground mb-4" />
                <h1 className="text-2xl font-bold">Página en Construcción</h1>
                <p className="text-muted-foreground mt-2 max-w-md">El propietario de este sitio aún está configurando su página de inicio. ¡Vuelve pronto!</p>
            </div>
        );
    }

    const { hero, navigation, sections, testimonials, form, header } = pageData;

    const heroStyle: CSSProperties = {
        backgroundColor: hero.backgroundColor,
        color: hero.textColor,
    };
    
    const buttonStyle: CSSProperties = {
        backgroundColor: hero.buttonColor,
        color: hero.backgroundColor,
    };

    return (
        <div className="bg-background">
            <main>
                <PreviewNavigation navConfig={navigation} />
                
                <PreviewBanner headerConfig={header} />
                <PreviewCarousel headerConfig={header} />

                <div style={heroStyle} className="relative">
                    {hero.imageUrl && (
                        <div className="absolute inset-0 z-0">
                            <Image
                                src={hero.imageUrl}
                                alt={hero.title}
                                fill
                                className="object-cover"
                                priority
                            />
                            <div className="absolute inset-0 bg-black/30"></div>
                        </div>
                    )}
                    <div className="relative z-10 container mx-auto text-center py-20 px-4">
                        <h1 className="text-5xl font-bold" style={{ color: hero.textColor }}>{hero.title}</h1>
                        <p className="text-xl mt-4 max-w-3xl mx-auto" style={{ color: hero.textColor }}>{hero.subtitle}</p>
                        
                        <div 
                            className="mt-6 max-w-none"
                            style={{color: hero.textColor}}
                            dangerouslySetInnerHTML={{ __html: hero.additionalContent }}
                        />

                        {hero.ctaButtonText && hero.ctaButtonUrl && (
                            <Button asChild size="lg" className="mt-8" style={buttonStyle}>
                                <a href={hero.ctaButtonUrl}>{hero.ctaButtonText}</a>
                            </Button>
                        )}
                    </div>
                </div>

                {sections.map(section => (
                    <PreviewContentSection key={section.id} section={section} />
                ))}

                <PreviewTestimonials testimonials={testimonials} />
                
                {form.fields.length > 0 && <PublicContactForm formConfig={form} businessId={businessId} />}
            </main>

            <footer className="w-full border-t bg-muted">
                <div className="container flex items-center justify-center h-16 px-4 md:px-6">
                    <p className="text-sm text-muted-foreground">
                    © {new Date().getFullYear()} {navigation.businessName}. Todos los derechos reservados.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default function PublicLandingPage() {
    const firestore = useFirestore();
    const configDocRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'globalConfig', 'system');
    }, [firestore]);

    const { data: config, isLoading: isConfigLoading } = useDoc<GlobalConfig>(configDocRef);
    
    if (isConfigLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Cargando configuración...</p>
            </div>
        );
    }
    
    if (!config?.mainBusinessId) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-center px-4">
                <Frown className="h-16 w-16 text-muted-foreground mb-4" />
                <h1 className="text-2xl font-bold">Página en Configuración</h1>
                <p className="text-muted-foreground mt-2 max-w-md">
                    Esta página de inicio aún no ha sido configurada. El administrador debe asignar un "ID de Negocio Principal" en el panel de configuración del superadministrador.
                </p>
            </div>
        );
    }
    
    return <LandingPageContent businessId={config.mainBusinessId} />;
}

    
