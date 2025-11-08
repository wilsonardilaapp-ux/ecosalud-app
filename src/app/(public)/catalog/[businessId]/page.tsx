
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay";
import { Star, Loader2, PackageSearch } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Product } from '@/models/product';
import type { LandingHeaderConfigData } from '@/models/landing-page';
import { TikTokIcon, WhatsAppIcon, XIcon, FacebookIcon, InstagramIcon } from '@/components/icons';
import { useParams } from 'next/navigation';
import { rateProduct } from '@/ai/flows/rate-product-flow';
import { useToast } from '@/hooks/use-toast';
import { PurchaseModal } from '@/components/catalogo/purchase-modal';
import type { PaymentSettings } from '@/models/payment-settings';


const CatalogHeader = ({ config }: { config: LandingHeaderConfigData | null }) => {
    if (!config) {
        return (
            <div className="h-96 flex items-center justify-center bg-muted">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    const socialIcons: { [key: string]: React.ReactNode } = {
        tiktok: <TikTokIcon className="h-5 w-5" />,
        instagram: <InstagramIcon className="h-5 w-5" />,
        facebook: <FacebookIcon className="h-5 w-5" />,
        whatsapp: <WhatsAppIcon className="h-5 w-5" />,
        twitter: <XIcon className="h-5 w-5" />,
    };

    return (
        <div className="w-full">
            {config.banner.mediaUrl && (
                <div className="relative aspect-[16/7] w-full">
                    {config.banner.mediaType === 'image' ? (
                        <Image src={config.banner.mediaUrl} alt="Banner" fill className="object-cover"/>
                    ) : (
                        <video src={config.banner.mediaUrl} autoPlay loop muted className="w-full h-full object-cover" />
                    )}
                </div>
            )}
            <div className="bg-card shadow-md p-4">
                <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-center md:text-left">
                        <h1 className="text-2xl font-bold font-headline">{config.businessInfo.name}</h1>
                        <p className="text-sm text-muted-foreground">{config.businessInfo.address}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {Object.entries(config.socialLinks).map(([key, value]) => value && (
                            <a key={key} href={value} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                                {socialIcons[key]}
                            </a>
                        ))}
                         <Button asChild size="sm">
                            <a href={`https://wa.me/${config.businessInfo.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                                <WhatsAppIcon className="mr-2 h-4 w-4" /> Contactar
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
            {config.carouselItems && config.carouselItems.some(item => item.mediaUrl) && (
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
                        {config.carouselItems.map(item => item.mediaUrl && (
                            <CarouselItem key={item.id}>
                                <div className="relative aspect-[16/5] w-full">
                                    {item.mediaType === 'image' ? (
                                        <Image src={item.mediaUrl} alt={item.slogan || 'Carousel image'} fill className="object-cover" />
                                    ) : (
                                        <video src={item.mediaUrl} autoPlay loop muted className="w-full h-full object-cover"/>
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
            )}
        </div>
    );
};

const PublicProductCard = ({ product, onOpenModal }: { product: Product, onOpenModal: (product: Product) => void }) => {
    
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(value);
    };

    return (
        <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-lg h-full">
            <CardHeader className="p-0">
                <div className="relative aspect-[4/3] w-full">
                    <Image
                        src={product.images[0] || 'https://picsum.photos/seed/placeholder/600/400'}
                        alt={product.name}
                        fill
                        className="object-cover"
                    />
                </div>
            </CardHeader>
            <CardContent className="p-4 flex-grow">
                <CardTitle className="text-lg font-semibold mb-1 truncate">{product.name}</CardTitle>
                 <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{product.rating.toFixed(1)}</span>
                    <span className="text-xs">({product.ratingCount} valoraciones)</span>
                </div>
                <p className="text-2xl font-bold text-primary">{formatCurrency(product.price)}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button className="w-full" onClick={() => onOpenModal(product)}>
                    Ver Producto
                </Button>
            </CardFooter>
        </Card>
    );
}

const ProductViewModal = ({ product, isOpen, onOpenChange, businessPhone, businessId, paymentSettings }: { product: Product | null, isOpen: boolean, onOpenChange: (open: boolean) => void, businessPhone: string, businessId: string | null, paymentSettings: PaymentSettings | null }) => {
    const [mainImage, setMainImage] = useState(product?.images[0] || '');
    const [isRating, setIsRating] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [isPurchaseModalOpen, setPurchaseModalOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (product) {
            setMainImage(product.images[0] || '');
        }
    }, [product]);

    if (!product) return null;
    
    const hasRated = typeof window !== 'undefined' && localStorage.getItem(`rated_${product?.id}`);

    const handleRating = async (rating: number) => {
        if (!product || !businessId || hasRated) return;

        setIsRating(true);
        setUserRating(rating);

        try {
            const result = await rateProduct({
                businessId: businessId,
                productId: product.id,
                rating: rating,
            });

            if (result.success) {
                localStorage.setItem(`rated_${product.id}`, 'true');
                toast({
                    title: '¡Gracias por tu opinión!',
                    description: 'Tu calificación ha sido registrada.',
                });
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            console.error("Error updating rating:", error);
            toast({
                variant: "destructive",
                title: 'Error al calificar',
                description: error.message || 'No se pudo registrar tu calificación.',
            });
            setUserRating(0); // Reset visual state on failure
        } finally {
            setIsRating(false);
        }
    };
    
    const handleOpenPurchaseModal = () => {
        setPurchaseModalOpen(true);
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl p-0">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Galería de Imágenes (columna izquierda) */}
                         <div className="p-4 md:p-6 flex flex-col-reverse sm:flex-row gap-4">
                            {/* Miniaturas */}
                            <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto pr-2 -mr-2 sm:pr-0 sm:mr-0">
                                {product.images.map((img, index) => (
                                    <button 
                                        key={index} 
                                        onClick={() => setMainImage(img)} 
                                        className={cn(
                                            "relative aspect-square w-16 sm:w-20 shrink-0 rounded-md overflow-hidden ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring transition-all",
                                            mainImage === img ? "ring-2 ring-primary opacity-100" : "opacity-70 hover:opacity-100"
                                        )}
                                    >
                                        <Image src={img} alt={`${product.name} thumbnail ${index + 1}`} fill className="object-cover"/>
                                    </button>
                                ))}
                            </div>
                            {/* Imagen Principal */}
                            <div className="relative aspect-square w-full rounded-lg overflow-hidden flex-1">
                                 <Image src={mainImage} alt={product.name} fill className="object-cover"/>
                            </div>
                        </div>
                        {/* Detalles del Producto (columna derecha) */}
                        <div className="p-6 flex flex-col">
                            <DialogHeader className="mb-4">
                                <Badge className="w-fit mb-2">{product.category}</Badge>
                                <DialogTitle className="text-3xl font-bold">{product.name}</DialogTitle>
                            </DialogHeader>
                            <div className="flex-grow space-y-4">
                                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: product.description }} />
                                <p><span className="font-semibold">Disponibles:</span> {product.stock} unidades</p>
                                <div className="flex flex-col gap-2">
                                    <span className="font-semibold">Califica este producto:</span>
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button key={star} onClick={() => handleRating(star)} disabled={!!hasRated || isRating}>
                                                <Star className={cn("h-6 w-6 transition-colors", star <= (userRating || product.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300 hover:text-yellow-300")} />
                                            </button>
                                        ))}
                                        {isRating && <Loader2 className="h-5 w-5 animate-spin ml-2" />}
                                    </div>
                                    {hasRated && <p className="text-xs text-muted-foreground">Ya has calificado este producto.</p>}
                                </div>
                            </div>
                            <div className="mt-6">
                                <Button size="lg" className="w-full" onClick={handleOpenPurchaseModal}>
                                    <WhatsAppIcon className="mr-2 h-5 w-5" /> Comprar por WhatsApp
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Purchase Modal */}
            {product && (
                 <PurchaseModal
                    isOpen={isPurchaseModalOpen}
                    onOpenChange={setPurchaseModalOpen}
                    product={product}
                    businessPhone={businessPhone}
                    paymentSettings={paymentSettings}
                />
            )}
        </>
    )
}

export default function CatalogPage() {
    const firestore = useFirestore();
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const params = useParams();
    const businessId = params.businessId as string;

    const publicDataRef = useMemoFirebase(() => {
        if (!firestore || !businessId) return null;
        return doc(firestore, `businesses/${businessId}/publicData`, 'catalog');
    }, [firestore, businessId]);

    const paymentSettingsRef = useMemoFirebase(() => {
        if (!firestore || !businessId) return null;
        return doc(firestore, 'paymentSettings', businessId);
    }, [firestore, businessId]);

    const { data: publicData, isLoading: isPublicDataLoading } = useDoc<{ products: Product[], headerConfig: LandingHeaderConfigData }>(publicDataRef);
    const { data: paymentSettings, isLoading: isPaymentSettingsLoading } = useDoc<PaymentSettings>(paymentSettingsRef);

    if (isPublicDataLoading || isPaymentSettingsLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    const products = publicData?.products || [];
    const headerConfig = publicData?.headerConfig || null;
    const isCatalogEmpty = !products || products.length === 0;
    
    const handleOpenModal = (product: Product) => {
        setSelectedProduct(product);
    }
    
    const handleModalChange = (isOpen: boolean) => {
        if (!isOpen) {
            setSelectedProduct(null);
        }
    }
    
    return (
        <div className="bg-muted/40 min-h-screen">
            {headerConfig ? (
                <CatalogHeader config={headerConfig} />
            ) : (
                <div className="bg-card shadow-md p-4 text-center">
                     <h1 className="text-2xl font-bold font-headline">Catálogo de EcoSalud</h1>
                </div>
            )}
            
            <main className="container mx-auto py-8">
                {isCatalogEmpty ? (
                    <Card className="sm:col-span-2 md:col-span-3 lg:col-span-4">
                        <CardContent className="h-[400px] flex flex-col items-center justify-center text-center gap-4">
                            <div className="p-4 bg-secondary rounded-full">
                                <PackageSearch className="h-12 w-12 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold">Este catálogo se está construyendo</h3>
                            <p className="text-muted-foreground max-w-sm">
                                El propietario está trabajando para añadir sus productos. ¡Vuelve pronto!
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products?.map(product => (
                            <PublicProductCard key={product.id} product={product} onOpenModal={handleOpenModal} />
                        ))}
                    </div>
                )}
            </main>
            
             <ProductViewModal 
                product={selectedProduct} 
                isOpen={!!selectedProduct} 
                onOpenChange={handleModalChange} 
                businessPhone={headerConfig?.businessInfo.phone || ''}
                businessId={businessId}
                paymentSettings={paymentSettings ?? null}
            />
            
            <footer className="w-full border-t bg-background mt-12">
              <div className="container flex items-center justify-center h-16 px-4 md:px-6">
                <p className="text-sm text-muted-foreground">
                  © {new Date().getFullYear()} {headerConfig?.businessInfo.name || 'EcoSalud'}. Todos los derechos reservados.
                </p>
              </div>
            </footer>
        </div>
    );
}

