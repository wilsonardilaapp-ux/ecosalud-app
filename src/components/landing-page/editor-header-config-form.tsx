
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
import { uploadMedia } from '@/ai/flows/upload-media-flow';
import { cn } from '@/lib/utils';
import { TikTokIcon, WhatsAppIcon, XIcon, FacebookIcon, InstagramIcon } from '@/components/icons';

interface EditorHeaderConfigFormProps {
  data: LandingHeaderConfigData;
  setData: (data: LandingHeaderConfigData) => void;
}

const MediaUploader = ({
  mediaUrl,
  mediaType,
  onUpload,
  onRemove,
  aspectRatio = 'aspect-[3/1]',
  dimensions,
  description,
}: {
  mediaUrl: string | null;
  mediaType: 'image' | 'video' | null;
  onUpload: (url: string, type: 'image' | 'video') => void;
  onRemove: () => void;
  aspectRatio?: string;
  dimensions?: string;
  description?: string;
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const mediaDataUri = reader.result as string;
      try {
        const result = await uploadMedia({ mediaDataUri });
        onUpload(result.secure_url, file.type.startsWith('image') ? 'image' : 'video');
        toast({ title: "Archivo subido", description: "El medio ha sido cargado a Cloudinary." });
      } catch (error: any) {
        toast({ variant: 'destructive', title: "Error al subir", description: error.message });
      } finally {
        setIsUploading(false);
      }
    };
    reader.onerror = () => {
      toast({ variant: 'destructive', title: "Error", description: "No se pudo leer el archivo." });
      setIsUploading(false);
    };
  };

  return (
    <div className="space-y-2">
      <div className={cn("relative w-full border-2 border-dashed rounded-lg flex items-center justify-center text-center p-4 group", aspectRatio)}>
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
            <p className="mt-2 font-semibold text-sm">Haz clic para subir un archivo</p>
            {dimensions && <p className="text-xs text-muted-foreground mt-1">{dimensions}</p>}
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
        )}
      </div>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" />
    </div>
  );
};

export default function EditorHeaderConfigForm({ data, setData }: EditorHeaderConfigFormProps) {
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

  const handleCarouselItemChange = (id: string, field: keyof Omit<CarouselItem, 'id'>, value: any) => {
    const updatedItems = data.carouselItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setData({ ...data, carouselItems: updatedItems });
  };
  
  const handleReset = () => {
    setData(initialData);
    toast({ title: "Cambios Descartados", description: "La configuración ha sido restablecida." });
  };
  
  const handleBannerUpload = (mediaUrl: string, mediaType: 'image' | 'video') => {
    setData({ ...data, banner: { mediaUrl, mediaType } });
  };
  
  const handleCarouselUpload = (id: string, mediaUrl: string, mediaType: 'image' | 'video') => {
    const updatedItems = data.carouselItems.map(item => item.id === id ? {...item, mediaUrl, mediaType} : item);
    setData({ ...data, carouselItems: updatedItems });
  };
  
  const removeCarouselItemMedia = (id: string) => {
     const updatedItems = data.carouselItems.map(item => item.id === id ? {...item, mediaUrl: null, mediaType: null} : item);
     setData({ ...data, carouselItems: updatedItems });
  };

  const socialIcons: { [key: string]: React.ReactNode } = {
    tiktok: <TikTokIcon className="h-5 w-5"/>,
    instagram: <InstagramIcon className="h-5 w-5"/>,
    facebook: <FacebookIcon className="h-5 w-5"/>,
    whatsapp: <WhatsAppIcon className="h-5 w-5"/>,
    twitter: <XIcon className="h-5 w-5"/>,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>Configurar Encabezado de la Landing Page</CardTitle>
                <CardDescription>Personaliza la cabecera que se mostrará en tu página principal pública.</CardDescription>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={handleReset}><RotateCcw className="mr-2 h-4 w-4"/> Restablecer</Button>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        
        {/* Banner Section */}
        <div className="space-y-4">
            <Label className="text-lg font-semibold">Banner Principal de la Landing Page</Label>
            <MediaUploader
                mediaUrl={data.banner.mediaUrl}
                mediaType={data.banner.mediaType}
                onUpload={handleBannerUpload}
                onRemove={() => setData({ ...data, banner: { mediaUrl: null, mediaType: null } })}
                aspectRatio="aspect-[16/7]"
                dimensions="1920 x 720 px"
                description="Imagen o video panorámico"
            />
        </div>

        {/* Business Info Section */}
        <div className="space-y-4">
            <Label className="text-lg font-semibold">Información del Negocio</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="business-name">Nombre del Negocio</Label>
                    <Input id="business-name" value={data.businessInfo.name} onChange={e => handleInputChange('businessInfo', 'name', e.target.value)} />
                </div>
                 <div>
                    <Label htmlFor="business-phone">Teléfono / WhatsApp</Label>
                    <Input id="business-phone" value={data.businessInfo.phone} onChange={e => handleInputChange('businessInfo', 'phone', e.target.value)} />
                </div>
                <div>
                    <Label htmlFor="business-address">Dirección</Label>
                    <Input id="business-address" value={data.businessInfo.address} onChange={e => handleInputChange('businessInfo', 'address', e.target.value)} />
                </div>
                 <div>
                    <Label htmlFor="business-email">Correo Electrónico (opcional)</Label>
                    <Input id="business-email" type="email" value={data.businessInfo.email} onChange={e => handleInputChange('businessInfo', 'email', e.target.value)} />
                </div>
            </div>
        </div>

        {/* Social Media Section */}
        <div className="space-y-4">
            <Label className="text-lg font-semibold">Redes Sociales</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(data.socialLinks).map(key => (
                    <div key={key} className="flex items-center gap-2">
                        <div className="p-2 bg-muted rounded-md text-muted-foreground">
                            {socialIcons[key as keyof typeof socialIcons]}
                        </div>
                        <Input 
                            placeholder={`URL de ${key}`} 
                            value={(data.socialLinks as any)[key]}
                            onChange={e => handleInputChange('socialLinks', key, e.target.value)}
                        />
                    </div>
                ))}
            </div>
        </div>

        {/* Carousel Section */}
        <div className="space-y-4">
            <Label className="text-lg font-semibold">Carrusel Promocional</Label>
            <p className="text-sm text-muted-foreground">Sube aquí las imágenes o videos que se mostrarán en el carrusel principal de tu landing page (máximo 3).</p>
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
                                onUpload={(mediaUrl, mediaType) => handleCarouselUpload(item.id, mediaUrl, mediaType)}
                                onRemove={() => removeCarouselItemMedia(item.id)}
                                aspectRatio="aspect-video"
                                dimensions="1920 x 1080 px"
                                description="Formato 16:9"
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
