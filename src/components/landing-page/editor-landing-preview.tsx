'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { LandingPageData, NavigationSection, ContentSection, TestimonialSection, FormField, LandingHeaderConfigData } from '@/models/landing-page';
import { cn } from '@/lib/utils';
import { CSSProperties } from 'react';
import { Star, Copy, ExternalLink } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay";


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
                                    <p className="text-white text-2xl font-bold text-center drop-shadow-md p-4">{item.slogan}</p>
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
  
  // Create a dynamic style for the hover effect
  const hoverStyle = `
    .nav-link:hover {
      color: ${navConfig.hoverColor} !important;
    }
  `;

  return (
    <>
    <style>{hoverStyle}</style>
    <header style={navStyle} className="p-4">
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
    <section style={sectionStyle} className="py-12 px-4">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold" style={{ color: section.textColor }}>{section.title}</h2>
        <p className="text-lg mt-2 mb-6" style={{ color: section.textColor }}>{section.subtitle}</p>
        <div
            className="max-w-none mx-auto"
            style={{ color: section.textColor }}
            dangerouslySetInnerHTML={{ __html: section.content }}
        />
        
        {section.subsections && section.subsections.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 text-left">
            {section.subsections.map(sub => (
              <Card key={sub.id} className="bg-card/80 backdrop-blur-sm overflow-hidden">
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
                  <div
                    className="text-sm"
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
        <section className="bg-slate-50 py-12 px-4">
            <div className="container mx-auto">
                <h2 className="text-3xl font-bold text-center mb-8">Lo que dicen nuestros clientes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map(testimonial => (
                        <Card key={testimonial.id} className="bg-white flex flex-col">
                            <CardContent className="p-6 flex-grow">
                                 <div className="flex items-center mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                        key={i}
                                        className={cn(
                                            "h-5 w-5",
                                            i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                        )}
                                        />
                                    ))}
                                </div>
                                <div 
                                    className="text-gray-600 prose prose-sm max-w-none mb-4"
                                    dangerouslySetInnerHTML={{ __html: testimonial.text }}
                                />
                            </CardContent>
                             <div className="bg-slate-50 p-6 mt-auto">
                                <div className="flex items-center">
                                    <Avatar className="h-12 w-12 mr-4">
                                        <AvatarImage src={testimonial.avatarUrl} alt={testimonial.authorName} />
                                        <AvatarFallback>{testimonial.authorName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold text-gray-900">{testimonial.authorName}</p>
                                        <p className="text-sm text-gray-500">{testimonial.authorRole}</p>
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
    <section className="py-12 px-4 bg-gray-100">
      <div className="container mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Formulario de Contacto</CardTitle>
            <CardDescription>Ponte en contacto con nosotros.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map(field => {
              if (field.type === 'textarea') {
                return (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={`preview-${field.id}`}>{field.label}{field.required && ' *'}</Label>
                    <Textarea id={`preview-${field.id}`} placeholder={field.placeholder} required={field.required} disabled />
                  </div>
                );
              }
              return (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={`preview-${field.id}`}>{field.label}{field.required && ' *'}</Label>
                  <Input id={`preview-${field.id}`} type={field.type} placeholder={field.placeholder} required={field.required} disabled />
                </div>
              );
            })}
            <Button disabled className="w-full">Enviar Mensaje</Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

const PreviewBanner = ({ headerConfig }: { headerConfig: LandingHeaderConfigData }) => {
    if (!headerConfig.banner || !headerConfig.banner.mediaUrl) {
        return null;
    }

    return (
        <div className="relative aspect-[16/7] w-full">
            {headerConfig.banner.mediaType === 'image' ? (
                <Image src={headerConfig.banner.mediaUrl} alt="Banner" fill className="object-cover" />
            ) : (
                <video src={headerConfig.banner.mediaUrl} autoPlay loop muted controls={false} className="w-full h-full object-cover" />
            )}
        </div>
    );
};


export default function EditorLandingPreview({ data }: EditorLandingPreviewProps) {
  const { hero, navigation, sections, testimonials, form, header } = data;
  const { user } = useUser();
  const { toast } = useToast();

  const heroStyle: CSSProperties = {
    backgroundColor: hero.backgroundColor,
    color: hero.textColor,
  };

  const buttonStyle: CSSProperties = {
    backgroundColor: hero.buttonColor,
    color: hero.backgroundColor, // A simple contrast logic
  };
  
  const publicUrl = user ? `${window.location.origin}/landing/${user.uid}` : '';

  const copyToClipboard = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    toast({
        title: "Enlace copiado",
        description: "El enlace público de tu landing page ha sido copiado al portapapeles.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
            <CardTitle>Acciones de la Landing Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Enlace Público</CardTitle>
                    <CardDescription className="text-xs">Comparte este enlace para mostrar tu landing page.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2">
                        <Input value={publicUrl} readOnly />
                        <Button variant="outline" size="icon" onClick={copyToClipboard} disabled={!publicUrl}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button asChild variant="secondary" className="w-full mt-2" disabled={!publicUrl}>
                       <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                           <ExternalLink className="mr-2 h-4 w-4" />
                           Vista Previa Pública
                       </a>
                    </Button>
                </CardContent>
            </Card>
        </CardContent>
      </Card>
      <Card className="sticky top-6">
          <CardHeader>
              <CardTitle>Vista Previa en Tiempo Real</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="border rounded-lg overflow-hidden w-full bg-slate-50">
                  {/* Mock Browser Header */}
                  <div className="h-8 bg-gray-200 flex items-center px-2 gap-1">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>

                  {/* Live Preview Content */}
                  <div className="bg-white max-h-[80vh] overflow-y-auto">
                    <PreviewNavigation navConfig={navigation} />
                    
                    <PreviewBanner headerConfig={header} />
                    <PreviewCarousel headerConfig={header} />

                    <div style={heroStyle}>
                      <div className="text-center py-10 px-4">
                          <h1 className="text-3xl font-bold" style={{ color: hero.textColor }}>{hero.title}</h1>
                          <p className="text-md mt-2" style={{ color: hero.textColor }}>{hero.subtitle}</p>
                          
                          <div 
                              className="mt-4 text-sm max-w-none"
                              style={{ color: hero.textColor }}
                              dangerouslySetInnerHTML={{ __html: hero.additionalContent }}
                          />

                          {hero.imageUrl && (
                              <div className="relative aspect-video w-full max-w-lg mx-auto rounded-md overflow-hidden">
                                  <Image
                                      src={hero.imageUrl}
                                      alt={hero.title}
                                      fill
                                      className="object-cover"
                                  />
                              </div>
                          )}
                          
                          {hero.ctaButtonText && hero.ctaButtonUrl && (
                              <Button asChild className="mt-6" style={buttonStyle}>
                                  <a href={hero.ctaButtonUrl}>{hero.ctaButtonText}</a>
                              </Button>
                          )}
                      </div>
                    </div>

                    {/* Render Content Sections */}
                    {sections.map(section => (
                      <PreviewContentSection key={section.id} section={section} />
                    ))}

                    {/* Render Testimonials */}
                    <PreviewTestimonials testimonials={testimonials} />
                    
                    {/* Render Form Preview */}
                    <PreviewForm fields={form.fields} />

                  </div>
              </div>
          </CardContent>
      </Card>
    </div>
  );
}
