
'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { LandingPageData } from '@/models/landing-page';

interface EditorLandingPreviewProps {
  data: LandingPageData;
}

export default function EditorLandingPreview({ data }: EditorLandingPreviewProps) {
  const { hero } = data;

  return (
    <Card className="sticky top-6">
        <CardHeader>
            <CardTitle>Vista Previa en Tiempo Real</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="border rounded-lg overflow-hidden w-full bg-white">
                {/* Mock Browser Header */}
                <div className="h-8 bg-gray-200 flex items-center px-2 gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>

                {/* Live Preview Content */}
                <div className="p-4" style={{ backgroundColor: hero.backgroundColor, color: hero.textColor }}>
                    <div className="text-center py-10">
                        <h1 className="text-3xl font-bold">{hero.title}</h1>
                        <p className="text-md mt-2">{hero.subtitle}</p>
                        
                        <div 
                            className="mt-4 text-sm prose prose-sm max-w-none" 
                            dangerouslySetInnerHTML={{ __html: hero.additionalContent }}
                        />

                        {hero.imageUrl && (
                            <div className="mt-6 relative aspect-video w-full max-w-lg mx-auto rounded-md overflow-hidden">
                                <Image
                                    src={hero.imageUrl}
                                    alt={hero.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}
                        
                        {hero.ctaButtonText && hero.ctaButtonUrl && (
                            <Button asChild className="mt-6" style={{ backgroundColor: hero.buttonColor }}>
                                <a href={hero.ctaButtonUrl}>{hero.ctaButtonText}</a>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
  );
}
