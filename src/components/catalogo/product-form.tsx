"use client";

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import RichTextEditor from '@/components/editor/RichTextEditor';
import type { Product } from '@/models/product';
import { UploadCloud, X } from 'lucide-react';
import Image from 'next/image';

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
    onSave: (data: Product) => void;
    onCancel: () => void;
}

export default function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
    const { register, handleSubmit, control, reset, formState: { errors } } = useForm<z.infer<typeof productSchema>>({
        resolver: zodResolver(productSchema),
    });

    const [images, setImages] = useState<string[]>([]);

    useEffect(() => {
        if (product) {
            reset({
                name: product.name,
                price: product.price,
                stock: product.stock,
                category: product.category,
                description: product.description,
            });
            setImages(product.images);
        } else {
            reset({
                name: '',
                price: 0,
                stock: 0,
                category: '',
                description: '',
            });
            setImages([]);
        }
    }, [product, reset]);
    
    const onSubmit = (data: z.infer<typeof productSchema>) => {
        const productData: Product = {
            id: product?.id || '',
            businessId: product?.businessId || '',
            ...data,
            images,
            rating: product?.rating || 0,
            ratingCount: product?.ratingCount || 0,
        };
        onSave(productData);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setImages([...images, reader.result as string]);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1 max-h-[70vh] overflow-y-auto">
            {/* Columna Izquierda */}
            <div className="space-y-4">
                <div>
                    <Label htmlFor="name">Nombre del Producto</Label>
                    <Input id="name" {...register("name")} />
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
                 <div>
                    <Label htmlFor="category">Categoría</Label>
                    <Input id="category" {...register("category")} />
                    {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
                </div>
                 <div>
                    <Label>Descripción</Label>
                    <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                            <RichTextEditor value={field.value} onChange={field.onChange} />
                        )}
                    />
                     {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                </div>
            </div>

            {/* Columna Derecha */}
            <div className="space-y-4">
                <Label>Imágenes del Producto</Label>
                <div className="grid grid-cols-2 gap-4">
                    {images.map((image, index) => (
                        <div key={index} className="relative group">
                            <Image src={image} alt={`producto ${index + 1}`} width={200} height={150} className="rounded-md object-cover w-full aspect-[4/3]" />
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                                onClick={() => removeImage(index)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                     <label className="flex flex-col items-center justify-center w-full aspect-[4/3] border-2 border-dashed rounded-md cursor-pointer hover:bg-muted">
                        <UploadCloud className="h-8 w-8 text-muted-foreground" />
                        <span className="mt-2 text-sm text-muted-foreground">Añadir imagen</span>
                        <Input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                    </label>
                </div>
            </div>

            {/* Footer */}
            <div className="md:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                <Button type="submit">Guardar Producto</Button>
            </div>
        </form>
    );
}
