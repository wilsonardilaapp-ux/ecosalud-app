
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { LandingPageData, GlobalConfig, NavigationSection } from '@/models/landing-page';
import { Logo } from '@/components/icons';
import { CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Button } from '../ui/button';
import { Menu, PanelLeft } from 'lucide-react';

const PreviewNavigation = ({ navConfig }: { navConfig: NavigationSection }) => {
  const [isOpen, setIsOpen] = useState(false);

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
    color: navConfig.textColor,
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
        <div className={cn('container mx-auto flex items-center justify-between')}>
          <div className="flex-shrink-0">
            {navConfig.logoUrl ? (
              <Image src={navConfig.logoUrl} alt={navConfig.logoAlt} width={navConfig.logoWidth} height={navConfig.logoWidth / 3} style={{ height: 'auto' }} />
            ) : (
              <Link href="/" className="flex items-center gap-2">
                <Logo className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold font-headline">{navConfig.businessName}</span>
              </Link>
            )}
          </div>
          <nav className="hidden md:flex items-center" style={{ gap: `${navConfig.spacing * 4}px`}}>
            {navConfig.links.filter(link => link.enabled).map((link) => (
              <a key={link.id} href={link.url} target={link.openInNewTab ? '_blank' : '_self'} rel={link.openInNewTab ? 'noopener noreferrer' : ''} style={linkStyle} className="nav-link transition-colors">
                {link.text}
              </a>
            ))}
          </nav>
           <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" style={{color: navConfig.textColor}}/>
                        <span className="sr-only">Abrir menú</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-3/4 p-4" style={{backgroundColor: navConfig.backgroundColor}}>
                    <nav className="flex flex-col gap-4 mt-8">
                         {navConfig.links.filter(link => link.enabled).map((link) => (
                          <a key={link.id} href={link.url} target={link.openInNewTab ? '_blank' : '_self'} rel={link.openInNewTab ? 'noopener noreferrer' : ''} style={linkStyle} className="nav-link text-lg font-medium" onClick={() => setIsOpen(false)}>
                            {link.text}
                          </a>
                        ))}
                    </nav>
                </SheetContent>
            </Sheet>
           </div>
        </div>
      </header>
    </>
  );
};


const FallbackHeader = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navLinks = [
        { text: "Inicio", url: "/" },
        { text: "Catálogo", url: "/catalog" },
        { text: "Inicio de Sesión", url: "/login" },
    ];

    return(
        <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
            <Link href="/" className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold font-headline text-foreground">
                Vidaplena
            </span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
                 {navLinks.map((link) => (
                    <Link key={link.text} href={link.url} className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                        {link.text}
                    </Link>
                ))}
            </nav>
            <div className="md:hidden">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="h-6 w-6"/>
                            <span className="sr-only">Abrir menú</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-3/4 p-4">
                        <nav className="flex flex-col gap-4 mt-8">
                            {navLinks.map((link) => (
                                <Link key={link.text} href={link.url} className="text-lg font-medium hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                                    {link.text}
                                </Link>
                            ))}
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
        </header>
    );
};

export default function Header() {
  const firestore = useFirestore();
  const [businessId, setBusinessId] = useState<string | null>(null);

  const configDocRef = useMemoFirebase(() => {
    return firestore ? doc(firestore, 'globalConfig', 'system') : null;
  }, [firestore]);

  const { data: config } = useDoc<GlobalConfig>(configDocRef);

  useEffect(() => {
    if (config?.mainBusinessId) {
      setBusinessId(config.mainBusinessId);
    }
  }, [config]);

  const landingPageDocRef = useMemoFirebase(() => {
    return firestore && businessId ? doc(firestore, 'businesses', businessId, 'landingPages', 'main') : null;
  }, [firestore, businessId]);

  const { data: pageData, isLoading } = useDoc<LandingPageData>(landingPageDocRef);

  if (isLoading && !pageData) {
      return <FallbackHeader />;
  }

  if (pageData?.navigation) {
    return <PreviewNavigation navConfig={pageData.navigation} />;
  }

  return <FallbackHeader />;
}
