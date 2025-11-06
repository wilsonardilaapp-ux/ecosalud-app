'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { FacebookIcon, InstagramIcon, MessageCircle, TwitterIcon, YoutubeIcon } from '@/components/icons';

const TikTokIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-tiktok" viewBox="0 0 16 16">
        <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3V0Z"/>
    </svg>
);

const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-whatsapp" viewBox="0 0 16 16">
        <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.068-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
    </svg>
);


const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.6.75Zm-1.8 13.5H13.1L4.35 2.061H2.167z"/>
    </svg>
);


export default function ShareCatalog() {
  const { user } = useUser();
  const { toast } = useToast();

  const getCatalogUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/catalog/${user?.uid}`;
    }
    return '';
  };
  
  const catalogUrl = getCatalogUrl();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(catalogUrl).then(() => {
      toast({
        title: 'Enlace Copiado',
        description: 'El enlace a tu catálogo ha sido copiado al portapapeles.',
      });
    }, (err) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo copiar el enlace.',
      });
    });
  };

  const socialShares = [
    { name: 'TikTok', icon: <TikTokIcon />, className: 'bg-black text-white hover:bg-gray-800', url: `https://www.tiktok.com/` },
    { name: 'Instagram', icon: <InstagramIcon />, className: 'bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white', url: `https://www.instagram.com/` },
    { name: 'Facebook', icon: <FacebookIcon />, className: 'bg-blue-600 text-white hover:bg-blue-700', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(catalogUrl)}` },
    { name: 'WhatsApp', icon: <WhatsAppIcon />, className: 'bg-green-500 text-white hover:bg-green-600', url: `https://api.whatsapp.com/send?text=${encodeURIComponent(`¡Mira mi catálogo de productos! ${catalogUrl}`)}` },
    { name: 'X', icon: <XIcon />, className: 'bg-black text-white hover:bg-gray-800', url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(catalogUrl)}&text=${encodeURIComponent('¡Mira mi catálogo de productos!')}` },
  ];

  if (!user) {
    return null; // Don't render if user is not available
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparte tu Catálogo</CardTitle>
        <CardDescription>
          Promociona tus productos en redes sociales para aumentar las ventas.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={copyToClipboard}>
          <Copy className="mr-2 h-4 w-4" />
          Copiar Enlace
        </Button>
        {socialShares.map(social => (
          <Button
            key={social.name}
            className={social.className}
            asChild
          >
            <a href={social.url} target="_blank" rel="noopener noreferrer">
              {social.icon}
              <span className="ml-2">{social.name}</span>
            </a>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
