"use client";

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import type { Product } from '@/models/product';

interface ProductCardProps {
    product: Product;
    children?: React.ReactNode;
}

export default function ProductCard({ product, children }: ProductCardProps) {

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(value);
    };

    return (
        <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
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
            {children && <CardFooter className="p-4 pt-0">{children}</CardFooter>}
        </Card>
    );
}
