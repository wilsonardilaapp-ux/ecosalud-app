
"use client";

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RichTextEditor from '@/components/editor/RichTextEditor';
import type { Product } from '@/models/product';
import { UploadCloud, X, Plus, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { uploadMedia } from '@/ai/flows/upload-media-flow';
import { useToast } from '@/hooks/use-toast';

const productSchema = z.object({
    name: z.string().min(3, "El nombre es requerido."),
    price: z.preprocess(
        (val) => parseFloat(String(val)),
        z.number().min(0, "El precio debe ser positivo.")
    ),
    stock: z.preprocess(
        (val) => parseInt(String(val), 10),
        z.number().int().min(0, "El stock debe ser un número entero positivo.")
    ),
    category: z.string().min(1, "La categoría es requerida."),
    description: z.string().min(10, "La descripción es muy corta."),
});

interface ProductFormProps {
    product: Product | null;
    onSave: (data: Omit<Product, 'id' | 'businessId'>) => void;
    onCancel: () => void;
}

export default function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
    const { register, handleSubmit, control, reset, formState: { errors } } = useForm<z.infer<typeof productSchema>>({
        resolver: zodResolver(productSchema),
    });

    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState<number | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (product) {
            reset({
                name: product.name,
                price: product.price,
                stock: product.stock,
                category: product.category,
                description: product.description,
            });
            setImageUrls(product.images || []);
        } else {
            reset({
                name: '',
                price: 0,
                stock: 0,
                category: '',
                description: '',
            });
            setImageUrls([]);
        }
    }, [product, reset]);
    
    const onSubmit = (data: z.infer<typeof productSchema>) => {
        const productData: Omit<Product, 'id' | 'businessId'> = {
            ...data,
            images: imageUrls,
            rating: product?.rating || 0,
            ratingCount: product?.ratingCount || 0,
        };
        onSave(productData);
    };

    const handleImageUpload = async (file: File, index: number) => {
        setIsUploading(index);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            const mediaDataUri = reader.result as string;
            try {
                const result = await uploadMedia({ mediaDataUri });
                const newImageUrls = [...imageUrls];
                newImageUrls[index] = result.secure_url;
                setImageUrls(newImageUrls);
                toast({ title: "Imagen subida", description: "La imagen ha sido cargada a Cloudinary." });
            } catch (error: any) {
                toast({ variant: 'destructive', title: "Error al subir", description: error.message });
            } finally {
                setIsUploading(null);
            }
        };
    };
    
    const removeImage = (index: number) => {
        const newImageUrls = [...imageUrls];
        newImageUrls.splice(index, 1);
        setImageUrls(newImageUrls);
    };
    
    const addImageSlot = () => {
        if (imageUrls.length < 5) {
            setImageUrls([...imageUrls, '']); // Add a placeholder
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-1 max-h-[80vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Columna Izquierda: Imágenes */}
                <div className="space-y-4">
                    <Label>Imágenes del Producto (Principal primero, hasta 5)</Label>
                    <div className="grid grid-cols-3 gap-2">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="relative aspect-square w-full">
                                {isUploading === index ? (
                                    <div className="flex items-center justify-center w-full h-full border-2 border-dashed rounded-md bg-muted">
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                    </div>
                                ) : imageUrls[index] ? (
                                    <div className="group relative w-full h-full">
                                        <Image src={imageUrls[index]} alt={`Producto ${index + 1}`} layout="fill" className="rounded-md object-cover" />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-0.5 right-0.5 h-5 w-5 opacity-0 group-hover:opacity-100"
                                            onClick={() => removeImage(index)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ) : (
                                    <label className="flex items-center justify-center w-full h-full border-2 border-dashed rounded-md cursor-pointer hover:bg-muted">
                                        <UploadCloud className="h-6 w-6 text-muted-foreground" />
                                        <Input 
                                            type="file" 
                                            className="hidden" 
                                            onChange={(e) => e.target.files && handleImageUpload(e.target.files[0], index)} 
                                            accept="image/*" 
                                        />
                                    </label>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Columna Derecha: Categoría y Descripción */}
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="category">Categoría</Label>
                        <Input id="category" {...register("category")} placeholder="Ej: Bebidas Calientes" />
                        {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
                    </div>
                    <div>
                        <Label>Descripción (Contenido Adicional)</Label>
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <RichTextEditor value={field.value} onChange={field.onChange} />
                            )}
                        />
                        {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
                    </div>
                </div>
            </div>

            {/* Fila Inferior: Nombre, Precio, Stock */}
            <div className="space-y-4">
                 <div>
                    <Label htmlFor="name">Nombre del Producto</Label>
                    <Input id="name" {...register("name")} placeholder="Ej: Café Orgánico de Altura" />
                    {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="price">Precio</Label>
                        <Input id="price" type="number" step="0.01" {...register("price")} />
                        {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="stock">Stock</Label>
                        <Input id="stock" type="number" {...register("stock")} />
                        {errors.stock && <p className="text-sm text-destructive">{errors.stock.message}</p>}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                <Button type="submit">Guardar Producto</Button>
            </div>
        </form>
    );
}
