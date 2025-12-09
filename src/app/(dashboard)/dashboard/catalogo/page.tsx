
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PlusCircle, ShoppingBag, Edit, Trash2, Printer, FileDown, Info } from 'lucide-react';
import type { Product } from '@/models/product';
import ProductForm from '@/components/catalogo/product-form';
import ProductCard from '@/components/catalogo/product-card';
import ShareCatalog from '@/components/catalogo/share-catalog';
import CatalogQRGenerator from '@/components/catalogo/catalog-qr-generator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import CatalogHeaderForm from '@/components/catalogo/catalog-header-form';
import type { LandingHeaderConfigData } from '@/models/landing-page';
import type { SystemService } from '@/models/system-service';
import { v4 as uuidv4 } from 'uuid';
import { useDoc, useFirestore, useUser, useMemoFirebase, setDocumentNonBlocking, deleteDocumentNonBlocking, useCollection } from '@/firebase';
import { doc, collection, writeBatch, query } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const initialHeaderConfig: LandingHeaderConfigData = {
    banner: {
      mediaUrl: null,
      mediaType: null,
    },
    businessInfo: {
      name: 'Mi Negocio',
      address: 'Dirección de ejemplo',
      phone: '3001234567',
      email: 'info@tunegocio.com',
    },
    socialLinks: {
      tiktok: '',
      instagram: '',
      facebook: '',
      whatsapp: '',
      twitter: '',
      youtube: '',
    },
    carouselItems: [
      { id: uuidv4(), mediaUrl: null, mediaType: null, slogan: '' },
      { id: uuidv4(), mediaUrl: null, mediaType: null, slogan: '' },
      { id: uuidv4(), mediaUrl: null, mediaType: null, slogan: '' },
    ],
};

export default function CatalogoPage() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<string | null>(null);
    const { toast } = useToast();
    
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const updatePublicCatalog = async (updatedProducts: Product[], updatedConfig: LandingHeaderConfigData) => {
        if (!firestore || !user) return;
        const publicCatalogRef = doc(firestore, 'businesses', user.uid, 'publicData', 'catalog');
        setDocumentNonBlocking(publicCatalogRef, { products: updatedProducts, headerConfig: updatedConfig }, { merge: true });
    };

    const productsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return collection(firestore, 'businesses', user.uid, 'products');
    }, [firestore, user]);

    const headerConfigDocRef = useMemoFirebase(() => {
        if (!firestore || !user) return null; 
        return doc(firestore, 'businesses', user.uid, 'landingConfig', 'header');
    }, [firestore, user]);
    
    const servicesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'systemServices');
    }, [firestore]);

    const { data: products, isLoading: isProductsLoading } = useCollection<Product>(productsQuery);
    const { data: headerConfig, isLoading: isConfigLoading } = useDoc<LandingHeaderConfigData>(headerConfigDocRef);
    const { data: services, isLoading: isServicesLoading } = useCollection<SystemService>(servicesQuery);

    const productLimitService = useMemo(() => {
        return services?.find(s => s.name === "Limite de Productos");
    }, [services]);

    const { canCreateProduct, tooltipMessage } = useMemo(() => {
        if (!productLimitService || productLimitService.status !== 'active') {
            return { canCreateProduct: false, tooltipMessage: "La creación de productos está desactivada por el administrador." };
        }
        const currentCount = products?.length ?? 0;
        const limit = productLimitService.limit;
        if (currentCount >= limit) {
            return { canCreateProduct: false, tooltipMessage: `Has alcanzado el límite de ${limit} productos.` };
        }
        return { canCreateProduct: true, tooltipMessage: '' };
    }, [productLimitService, products]);

    useEffect(() => {
        if (products && headerConfig && user) {
            updatePublicCatalog(products, headerConfig);
        }
    }, [products, headerConfig, user]);


    const handleSaveProduct = async (productData: Omit<Product, 'id' | 'businessId'>) => {
        if (!firestore || !user) return;
        
        const dataToSave = { ...productData, businessId: user.uid };
        const batch = writeBatch(firestore);

        if (editingProduct && editingProduct.id) {
            const productDocRef = doc(firestore, 'businesses', user.uid, 'products', editingProduct.id);
            batch.set(productDocRef, dataToSave, { merge: true });
        } else {
            const newProductRef = doc(collection(firestore, 'businesses', user.uid, 'products'));
            batch.set(newProductRef, dataToSave);
        }

        batch.commit();

        setIsFormOpen(false);
        setEditingProduct(null);
    };
    
    const handleSaveHeader = (config: LandingHeaderConfigData) => {
        if (headerConfigDocRef) {
            setDocumentNonBlocking(headerConfigDocRef, config, { merge: true });
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    const openDeleteDialog = (productId: string) => {
        setProductToDelete(productId);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!firestore || !user || !productToDelete) return;
        
        const productDocRef = doc(firestore, 'businesses', user.uid, 'products', productToDelete);
        deleteDocumentNonBlocking(productDocRef);
        
        toast({
            title: "Producto Eliminado",
            description: "El producto ha sido eliminado de tu catálogo.",
        });

        setProductToDelete(null);
        setIsDeleteDialogOpen(false);
    };
    
    const openNewProductForm = () => {
        setEditingProduct(null);
        setIsFormOpen(true);
    }

    const handleOpenActionWindow = (action: 'print' | 'download') => {
        if (!user) return;
        const url = `/catalog/${user.uid}?${action}=true`;
        window.open(url, '_blank');
    };
    
    if (isUserLoading || isConfigLoading || isProductsLoading || isServicesLoading) {
        return <div>Cargando tu catálogo...</div>
    }

    return (
        <div className="flex flex-col gap-6">
            <CatalogHeaderForm data={headerConfig ?? initialHeaderConfig} setData={handleSaveHeader} />
            
            <CatalogQRGenerator />
            
            {productLimitService && productLimitService.status === 'active' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Límite de Productos</CardTitle>
                        <CardDescription>Uso de tu plan de productos actual.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <Progress value={((products?.length ?? 0) / productLimitService.limit) * 100} className="flex-1" />
                            <span className="font-bold text-lg">{products?.length ?? 0} / {productLimitService.limit}</span>
                        </div>
                         <p className="text-sm text-muted-foreground mt-2">
                           Has utilizado {products?.length ?? 0} de los {productLimitService.limit} productos disponibles en tu plan.
                        </p>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                    <div>
                        <CardTitle>Tus Productos</CardTitle>
                        <CardDescription>
                            Añade, edita y gestiona los productos de tu negocio.
                        </CardDescription>
                    </div>
                     <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => handleOpenActionWindow('print')}>
                            <Printer className="mr-2 h-4 w-4" />
                            Imprimir
                        </Button>
                        <Button variant="outline" onClick={() => handleOpenActionWindow('download')}>
                            <FileDown className="mr-2 h-4 w-4" />
                            Descargar PDF
                        </Button>
                        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div tabIndex={0}> 
                                            <DialogTrigger asChild>
                                                <Button onClick={openNewProductForm} disabled={!canCreateProduct}>
                                                    <PlusCircle className="mr-2 h-4 w-4" />
                                                    Añadir Producto
                                                </Button>
                                            </DialogTrigger>
                                        </div>
                                    </TooltipTrigger>
                                    {!canCreateProduct && (
                                        <TooltipContent>
                                            <p>{tooltipMessage}</p>
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </TooltipProvider>

                            <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                    <DialogTitle>{editingProduct ? 'Editar Producto' : 'Añadir Nuevo Producto'}</DialogTitle>
                                    <DialogDescription>
                                        Completa los detalles de tu producto. La información se mostrará públicamente.
                                    </DialogDescription>
                                </DialogHeader>
                                <ProductForm 
                                    product={editingProduct} 
                                    onSave={handleSaveProduct} 
                                    onCancel={() => setIsFormOpen(false)}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products && products.length > 0 ? (
                    products.map(product => (
                        <ProductCard key={product.id} product={product}>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="w-full" onClick={() => handleEdit(product)}>
                                    <Edit className="mr-2 h-4 w-4" /> Editar
                                </Button>
                                <Button variant="destructive" size="sm" className="w-full" onClick={() => openDeleteDialog(product.id)}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                </Button>
                            </div>
                        </ProductCard>
                    ))
                ) : (
                    <Card className="sm:col-span-2 md:col-span-3 lg:col-span-4">
                        <CardContent className="h-[400px] flex flex-col items-center justify-center text-center gap-4">
                            <div className="p-4 bg-secondary rounded-full">
                                <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold">Tu catálogo está vacío</h3>
                            <p className="text-muted-foreground max-w-sm">
                                Haz clic en "Añadir Producto" para empezar a vender.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
            
            <ShareCatalog />

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro de que quieres eliminar este producto?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. El producto será eliminado permanentemente de tu catálogo.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setProductToDelete(null)}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                        Eliminar
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

    
    

    
