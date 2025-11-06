
'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { LandingHeaderConfigData, CarouselItem } from '@/models/landing-page';
import { Loader2, UploadCloud, RotateCcw, Save, Trash2, Pencil } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

interface CatalogHeaderFormProps {
  data: LandingHeaderConfigData;
  setData: (data: LandingHeaderConfigData) => void;
}

const SocialIcon = ({ network }: { network: string }) => {
    // A real implementation would have better icons
    const initials = network.charAt(0).toUpperCase();
    return <div className="h-6 w-6 flex items-center justify-center bg-gray-200 rounded-full text-xs">{initials}</div>
}

export default function CatalogHeaderForm({ data, setData }: CatalogHeaderFormProps) {
  const { toast } = useToast();
  const [initialData] = useState<LandingHeaderConfigData>(JSON.parse(JSON.stringify(data)));
  
  const handleInputChange = (section: keyof LandingHeaderConfigData, field: string, value: any) => {
    setData({
      ...data,
      [section]: {
        ...(data[section] as object),
        [field]: value
      }
    });
  };

  const handleCarouselItemChange = (id: string, field: keyof CarouselItem, value: any) => {
    const updatedItems = data.carouselItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    handleInputChange('carouselItems', '', updatedItems);
  };
  
  const handleReset = () => {
    setData(initialData);
    toast({ title: "Cambios Descartados", description: "La configuración ha sido restablecida." });
  };
  
    const handleSave = () => {
        toast({ title: "Guardando Cambios...", description: "Tu configuración está siendo guardada." });
        console.log("Saving data...", data);
        // Here you would typically save the data to a backend like Firestore
    };
  
  const MediaUploader = ({
    mediaUrl,
    mediaType,
    onUpload,
    onRemove,
    aspectRatio = 'aspect-[3/1]',
    uploadTrigger
  }: {
    mediaUrl: string | null;
    mediaType: 'image' | 'video' | null;
    onUpload: (file: File) => void;
    onRemove: () => void;
    aspectRatio?: string;
    uploadTrigger: React.ReactNode;
  }) => {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      onUpload(file);
      setIsUploading(false);
      toast({ title: "Archivo subido", description: "El medio ha sido cargado exitosamente." });
    };

    return (
      <div className="space-y-2">
        <div className={`relative w-full border-2 border-dashed rounded-lg flex items-center justify-center text-center p-4 group ${aspectRatio}`}>
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Subiendo...</p>
            </div>
          ) : mediaUrl ? (
            <>
              {mediaType === 'image' && <Image src={mediaUrl} alt="Banner" layout="fill" className="object-cover rounded-md" />}
              {mediaType === 'video' && <video src={mediaUrl} controls className="w-full h-full rounded-md" />}
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()}><Pencil className="h-4 w-4" /></Button>
                <Button variant="destructive" size="icon" onClick={onRemove}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </>
          ) : (
            <div className="cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <UploadCloud className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="mt-2 font-semibold">Haz clic para subir una imagen o video</p>
            </div>
          )}
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" />
        {mediaUrl ? null : uploadTrigger}
      </div>
    );
  };
  
  const handleBannerUpload = (file: File) => {
    const mediaType = file.type.startsWith('image') ? 'image' : 'video';
    const mediaUrl = URL.createObjectURL(file); // Placeholder URL
    setData({ ...data, banner: { mediaUrl, mediaType } });
  };
  
  const handleCarouselUpload = (id: string, file: File) => {
    const mediaType = file.type.startsWith('image') ? 'image' : 'video';
    const mediaUrl = URL.createObjectURL(file);
    const updatedItems = data.carouselItems.map(item => item.id === id ? {...item, mediaUrl, mediaType} : item);
    setData({ ...data, carouselItems: updatedItems });
  };
  
  const removeCarouselItemMedia = (id: string) => {
     const updatedItems = data.carouselItems.map(item => item.id === id ? {...item, mediaUrl: null, mediaType: null} : item);
     setData({ ...data, carouselItems: updatedItems });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>Configurar Encabezado del Catálogo</CardTitle>
                <CardDescription>Personaliza la cabecera que se mostrará en tu catálogo público.</CardDescription>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={handleReset}><RotateCcw className="mr-2 h-4 w-4"/> Restablecer</Button>
                <Button onClick={handleSave}><Save className="mr-2 h-4 w-4"/> Guardar Cambios</Button>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        
        {/* Banner Section */}
        <div className="space-y-4">
            <Label className="text-lg font-semibold">Banner del Catálogo</Label>
            <MediaUploader
                mediaUrl={data.banner.mediaUrl}
                mediaType={data.banner.mediaType}
                onUpload={handleBannerUpload}
                onRemove={() => setData({ ...data, banner: { mediaUrl: null, mediaType: null } })}
                uploadTrigger={<></>}
            />
        </div>

        {/* Carousel Section */}
        <div className="space-y-4">
            <Label className="text-lg font-semibold">Imágenes del Carrusel</Label>
            <p className="text-sm text-muted-foreground">Sube aquí las imágenes que se mostrarán en el carrusel de tu catálogo (máximo 3).</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.carouselItems.map((item, index) => (
                    <Card key={item.id}>
                        <CardHeader>
                            <CardTitle className="text-base">Elemento {index + 1}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <MediaUploader
                                mediaUrl={item.mediaUrl}
                                mediaType={item.mediaType}
                                onUpload={(file) => handleCarouselUpload(item.id, file)}
                                onRemove={() => removeCarouselItemMedia(item.id)}
                                aspectRatio="aspect-video"
                                uploadTrigger={<Button variant="outline" size="sm" className="w-full mt-2">Subir</Button>}
                            />
                            <div>
                                <Label htmlFor={`slogan-${item.id}`}>Texto sobreimpreso</Label>
                                <Input id={`slogan-${item.id}`} value={item.slogan} onChange={e => handleCarouselItemChange(item.id, 'slogan', e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
