
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
        <div className={cn('container mx-auto flex items-center', {
          'justify-between': navConfig.logoAlignment === 'left',
          'justify-center': navConfig.logoAlignment === 'center',
          'flex-row-reverse': navConfig.logoAlignment === 'right',
        })}>
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
          <nav className="hidden md:flex items-center" style={{ gap: `${navConfig.spacing * 4}px` }}>
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


const FallbackHeader = () => (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold font-headline text-foreground">
            Vidaplena
          </span>
        </Link>
      </div>
    </header>
);

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

    