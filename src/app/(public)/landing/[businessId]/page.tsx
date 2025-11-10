
'use client';

import { useMemo } from 'react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Loader2, Frown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LandingPageData, NavigationSection, ContentSection, TestimonialSection, FormField } from '@/models/landing-page';
import { CSSProperties } from 'react';
import { useParams } from 'next/navigation';

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
          {navConfig.links.map((link) => (
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
            className="prose lg:prose-lg max-w-none mx-auto prose-p:text-[var(--prose-color)] prose-strong:text-[var(--prose-color)]"
            style={{ '--prose-color': section.textColor } as React.CSSProperties}
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
                      <video src={sub.imageUrl} autoPlay loop muted className="w-full h-full object-cover" />
                    )
                  )}
                </div>
                <CardHeader>
                  <CardTitle style={{ color: section.textColor }}>{sub.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base" style={{ color: section.textColor, opacity: 0.9 }}>{sub.description}</p>
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
                                        <Star
                                        key={i}
                                        className={cn(
                                            "h-6 w-6",
                                            i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                        )}
                                        />
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

const PreviewForm = ({ fields }: { fields: FormField[] }) => {
  return (
    <section className="py-16 px-4 bg-background">
      <div className="container mx-auto max-w-2xl">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Formulario de Contacto</CardTitle>
            <CardDescription>Ponte en contacto con nosotros.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {fields.map(field => {
              if (field.type === 'textarea') {
                return (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={`preview-${field.id}`}>{field.label}{field.required && ' *'}</Label>
                    <Textarea id={`preview-${field.id}`} placeholder={field.placeholder} required={field.required} className="text-base py-3 px-4" />
                  </div>
                );
              }
              return (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={`preview-${field.id}`}>{field.label}{field.required && ' *'}</Label>
                  <Input id={`preview-${field.id}`} type={field.type} placeholder={field.placeholder} required={field.required} className="text-base py-3 px-4 h-12" />
                </div>
              );
            })}
            <Button className="w-full h-12 text-lg">Enviar Mensaje</Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};


export default function PublicLandingPage() {
  const params = useParams();
  const businessId = params.businessId as string;
  const firestore = useFirestore();

  const landingPageDocRef = useMemoFirebase(() => {
    if (!firestore || !businessId) return null;
    return doc(firestore, 'businesses', businessId, 'landingPages', 'main');
  }, [firestore, businessId]);

  const { data, isLoading, error } = useDoc<LandingPageData>(landingPageDocRef);

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
            <h1 className="text-2xl font-bold text-destructive">Error de Permisos</h1>
            <p className="text-muted-foreground mt-2">
            No se pudo cargar la página. Es posible que el propietario no haya configurado esta página o que haya un problema con los permisos.
            </p>
        </div>
    );
  }

  if (!data) {
     return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-center px-4">
            <Frown className="h-16 w-16 text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold">Página no Encontrada</h1>
            <p className="text-muted-foreground mt-2">
            La página que estás buscando no existe o aún no ha sido publicada.
            </p>
        </div>
    );
  }

  const { hero, navigation, sections, testimonials, form } = data;

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
                  className="mt-6 prose prose-invert max-w-none"
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
        
        <PreviewForm fields={form.fields} />
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
}
