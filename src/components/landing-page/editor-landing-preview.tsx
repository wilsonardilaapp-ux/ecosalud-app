
'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { LandingPageData, NavLink, NavigationSection } from '@/models/landing-page';
import { cn } from '@/lib/utils';
import { CSSProperties } from 'react';

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


export default function EditorLandingPreview({ data }: EditorLandingPreviewProps) {
  const { hero, navigation } = data;

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
                </div>
            </div>
        </CardContent>
    </Card>
  );
}
