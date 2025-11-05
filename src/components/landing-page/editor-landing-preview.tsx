
'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { LandingPageData, NavLink, NavigationSection, ContentSection, TestimonialSection } from '@/models/landing-page';
import { cn } from '@/lib/utils';
import { CSSProperties } from 'react';
import { Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface EditorLandingPreviewProps {
  data: LandingPageData;
}

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
    <section style={sectionStyle} className="py-12 px-4">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold" style={{ color: section.textColor }}>{section.title}</h2>
        <p className="text-lg mt-2 mb-6" style={{ color: section.textColor }}>{section.subtitle}</p>
        <div
            className="prose prose-sm max-w-none mx-auto prose-p:text-[var(--prose-color)] prose-strong:text-[var(--prose-color)]"
            style={{ '--prose-color': section.textColor } as React.CSSProperties}
            dangerouslySetInnerHTML={{ __html: section.content }}
        />
        {/* Placeholder for subsections */}
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


export default function EditorLandingPreview({ data }: EditorLandingPreviewProps) {
  const { hero, navigation, sections, testimonials } = data;

  const heroStyle: CSSProperties = {
    backgroundColor: hero.backgroundColor,
    color: hero.textColor,
  };

  const buttonStyle: CSSProperties = {
    backgroundColor: hero.buttonColor,
    color: hero.backgroundColor, // A simple contrast logic
  };

  return (
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
                <div className="bg-white">
                  <PreviewNavigation navConfig={navigation} />

                  <div style={heroStyle}>
                    <div className="text-center py-10 px-4">
                        <h1 className="text-3xl font-bold" style={{ color: hero.textColor }}>{hero.title}</h1>
                        <p className="text-md mt-2" style={{ color: hero.textColor }}>{hero.subtitle}</p>
                        
                        <div 
                            className="mt-4 text-sm prose prose-sm max-w-none prose-p:text-[var(--prose-color)] prose-strong:text-[var(--prose-color)]"
                            style={{ '--prose-color': hero.textColor } as React.CSSProperties}
                            dangerouslySetInnerHTML={{ __html: hero.additionalContent }}
                        />

                        {hero.imageUrl && (
                            <div className="mt-6 relative aspect-video w-full max-w-lg mx-auto rounded-md overflow-hidden">
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

                </div>
            </div>
        </CardContent>
    </Card>
  );
}
