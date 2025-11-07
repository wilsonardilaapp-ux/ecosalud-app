
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
import { v4 as uuidv4 } from 'uuid';
import { useDoc, useFirestore, useUser, useMemoFirebase, setDocumentNonBlocking, addDocumentNonBlocking, deleteDocumentNonBlocking, useCollection } from '@/firebase';
import { doc, getDoc, setDoc, collection, addDoc, deleteDoc } from 'firebase/firestore';


const sampleProducts: Product[] = [
    {
        id: '1',
        businessId: '123',
        name: 'Producto de Bienestar Natural',
        description: '<p>Este es un producto increíble que mejora tu salud de manera natural y efectiva.</p>',
        price: 25.99,
        stock: 50,
        category: 'Salud y Bienestar',
        images: ['https://picsum.photos/seed/product1/600/400'],
        rating: 4.5,
        ratingCount: 120,
    },
    {
        id: '2',
        businessId: '123',
        name: 'Suplemento Energético Orgánico',
        description: '<p>Aumenta tu energía durante todo el día con nuestros ingredientes orgánicos certificados.</p>',
        price: 39.99,
        stock: 30,
        category: 'Suplementos',
        images: ['https://picsum.photos/seed/product2/600/400'],
        rating: 4.8,
        ratingCount: 95,
    },
];

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
    const [headerConfig, setHeaderConfig] = useState<LandingHeaderConfigData>(initialHeaderConfig);

    const { user } = useUser();
    const firestore = useFirestore();

    const productsCollectionRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return collection(firestore, 'products');
    }, [firestore, user]);

    const { data: products, isLoading: isProductsLoading } = useCollection<Product>(productsCollectionRef);

    const headerConfigDocRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, `businesses/${user.uid}/landingConfig/header`);
    }, [firestore, user]);
    
    const { data: loadedHeaderConfig, isLoading: isConfigLoading } = useDoc<LandingHeaderConfigData>(headerConfigDocRef);

    useEffect(() => {
        if (loadedHeaderConfig) {
            setHeaderConfig(loadedHeaderConfig);
        }
    }, [loadedHeaderConfig]);

    useEffect(() => {
        const initializeConfig = async () => {
            if (headerConfigDocRef) {
                const docSnap = await getDoc(headerConfigDocRef);
                if (!docSnap.exists()) {
                    await setDoc(headerConfigDocRef, initialHeaderConfig);
                }
            }
        };

        initializeConfig();
    }, [headerConfigDocRef]);

    const handleSaveProduct = async (productData: Product) => {
        if (!productsCollectionRef || !user) return;
        
        const dataToSave = { ...productData, businessId: user.uid };

        if (editingProduct && editingProduct.id) {
            const productDocRef = doc(firestore, 'products', editingProduct.id);
            setDocumentNonBlocking(productDocRef, dataToSave, { merge: true });
        } else {
            addDocumentNonBlocking(productsCollectionRef, dataToSave);
        }
        setIsFormOpen(false);
        setEditingProduct(null);
    };
    
    const handleSaveHeader = (config: LandingHeaderConfigData) => {
        if (headerConfigDocRef) {
            setDocumentNonBlocking(headerConfigDocRef, config, { merge: true });
        }
        setHeaderConfig(config);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    const handleDelete = (productId: string) => {
        if (!user || !firestore) return;
        if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            const productDocRef = doc(firestore, 'products', productId);
            deleteDocumentNonBlocking(productDocRef);
        }
    };
    
    const openNewProductForm = () => {
        setEditingProduct(null);
        setIsFormOpen(true);
    }
    
    if (isConfigLoading || isProductsLoading) {
        return <div>Cargando configuración del catálogo...</div>
    }

    return (
        <div className="flex flex-col gap-6">
            <CatalogHeaderForm data={headerConfig} setData={handleSaveHeader} />
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
