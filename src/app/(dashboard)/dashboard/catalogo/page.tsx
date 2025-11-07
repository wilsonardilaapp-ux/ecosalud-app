
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PlusCircle, ShoppingBag, Edit, Trash2 } from 'lucide-react';
import type { Product } from '@/models/product';
import ProductForm from '@/components/catalogo/product-form';
import ProductCard from '@/components/catalogo/product-card';
import ShareCatalog from '@/components/catalogo/share-catalog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import CatalogHeaderForm from '@/components/catalogo/catalog-header-form';
import type { LandingHeaderConfigData } from '@/models/landing-page';
import type { Business } from '@/models/business';
import { v4 as uuidv4 } from 'uuid';
import { useDoc, useFirestore, useUser, useMemoFirebase, setDocumentNonBlocking, addDocumentNonBlocking, deleteDocumentNonBlocking, useCollection } from '@/firebase';
import { doc, collection, query, where, getDoc, setDoc } from 'firebase/firestore';

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
    
    const { user } = useUser();
    const firestore = useFirestore();

    const [businessDocExists, setBusinessDocExists] = useState(false);
    const [checkingBusinessDoc, setCheckingBusinessDoc] = useState(true);

    useEffect(() => {
        const checkBusinessDocument = async () => {
            if (firestore && user) {
                setCheckingBusinessDoc(true);
                const businessRef = doc(firestore, 'businesses', user.uid);
                const businessSnap = await getDoc(businessRef);
                
                if (!businessSnap.exists()) {
                    const businessData: Business = {
                        id: user.uid,
                        name: user.displayName || `${user.email?.split('@')[0]}'s Business` || 'Mi Negocio',
                        logoURL: '',
                        description: 'Bienvenido a mi negocio en EcoSalud.',
                    };
                    await setDoc(businessRef, businessData);
                    setBusinessDocExists(true);
                } else {
                    setBusinessDocExists(true);
                }
                setCheckingBusinessDoc(false);
            } else {
                setCheckingBusinessDoc(false);
            }
        };

        checkBusinessDocument();
    }, [firestore, user]);


    const productsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return collection(firestore, 'businesses', user.uid, 'products');
    }, [firestore, user]);

    const { data: products, isLoading: isProductsLoading } = useCollection<Product>(productsQuery);

    const headerConfigDocRef = useMemoFirebase(() => {
        if (!firestore || !user || !businessDocExists) return null; 
        return doc(firestore, 'businesses', user.uid, 'landingConfig', 'header');
    }, [firestore, user, businessDocExists]);
    
    const { data: headerConfig, isLoading: isConfigLoading } = useDoc<LandingHeaderConfigData>(headerConfigDocRef);

    const handleSaveProduct = async (productData: Product) => {
        if (!firestore || !user) return;
        
        const dataToSave = { ...productData, businessId: user.uid };

        if (editingProduct && editingProduct.id) {
            const productDocRef = doc(firestore, 'businesses', user.uid, 'products', editingProduct.id);
            setDocumentNonBlocking(productDocRef, dataToSave, { merge: true });
        } else {
            const productsCollectionRef = collection(firestore, 'businesses', user.uid, 'products');
            addDocumentNonBlocking(productsCollectionRef, dataToSave);
        }
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

    const handleDelete = (productId: string) => {
        if (!firestore || !user) return;
        if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            const productDocRef = doc(firestore, 'businesses', user.uid, 'products', productId);
            deleteDocumentNonBlocking(productDocRef);
        }
    };
    
    const openNewProductForm = () => {
        setEditingProduct(null);
        setIsFormOpen(true);
    }
    
    if (checkingBusinessDoc || isConfigLoading || isProductsLoading) {
        return <div>Cargando configuración del catálogo...</div>
    }

    return (
        <div className="flex flex-col gap-6">
            <CatalogHeaderForm data={headerConfig ?? initialHeaderConfig} setData={handleSaveHeader} />
            <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                    <div>
                        <CardTitle>Tus Productos</CardTitle>
                        <CardDescription>
                            Añade, edita y gestiona los productos de tu negocio.
                        </CardDescription>
                    </div>
                     <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={openNewProductForm}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Añadir Producto
                            </Button>
                        </DialogTrigger>
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
                                <Button variant="destructive" size="sm" className="w-full" onClick={() => handleDelete(product.id)}>
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
        </div>
    );
}

