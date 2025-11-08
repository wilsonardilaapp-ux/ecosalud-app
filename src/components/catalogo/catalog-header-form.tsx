
'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { LandingHeaderConfigData, CarouselItem } from '@/models/landing-page';
import { Loader2, UploadCloud, RotateCcw, Save, Trash2, Pencil } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { TikTokIcon, WhatsAppIcon, XIcon, FacebookIcon, InstagramIcon } from '@/components/icons';
import { uploadMedia } from '@/ai/flows/upload-media-flow';


interface CatalogHeaderFormProps {
  data: LandingHeaderConfigData;
  setData: (data: LandingHeaderConfigData) => void;
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
  
    const handleSocialLinkChange = (network: keyof LandingHeaderConfigData['socialLinks'], value: string) => {
        const updatedSocialLinks = { ...data.socialLinks, [network]: value };
        setData({ ...data, socialLinks: updatedSocialLinks });
    };

  const handleCarouselItemChange = (id: string, field: keyof CarouselItem, value: any) => {
    const updatedItems = data.carouselItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setData({ ...data, carouselItems: updatedItems });
  };
  
  const handleReset = () => {
    setData(initialData);
    toast({ title: "Cambios Descartados", description: "La configuración ha sido restablecida." });
  };
  
    const handleSave = () => {
        setData(data);
        toast({ title: "Guardando Cambios...", description: "Tu configuración está siendo guardada." });
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
    uploadTrigger?: React.ReactNode;
  }) => {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      await onUpload(file);
      setIsUploading(false);
    };

    return (
      <div className="space-y-2">
        <div className={`relative w-full border-2 border-dashed rounded-lg flex items-center justify-center text-center p-4 group ${aspectRatio}`}>
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Procesando...</p>
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
        {React.isValidElement(uploadTrigger) && React.cloneElement(uploadTrigger as React.ReactElement, { onClick: () => fileInputRef.current?.click() })}
      </div>
    );
  };
  
  const handleFileUpload = async (file: File, callback: (mediaUrl: string, mediaType: 'image' | 'video') => void) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
        const mediaDataUri = reader.result as string;
        try {
            const result = await uploadMedia({ mediaDataUri });
            const mediaType = file.type.startsWith('image') ? 'image' : 'video';
            callback(result.secure_url, mediaType);
            toast({ title: "Archivo subido", description: "El medio ha sido cargado a Cloudinary." });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Error al subir", description: error.message });
        }
    };
  };

  const handleBannerUpload = (file: File) => {
    handleFileUpload(file, (mediaUrl, mediaType) => {
        setData({ ...data, banner: { mediaUrl, mediaType } });
    });
  };
  
  const handleCarouselUpload = (id: string, file: File) => {
    handleFileUpload(file, (mediaUrl, mediaType) => {
        const updatedItems = data.carouselItems.map(item => item.id === id ? {...item, mediaUrl, mediaType} : item);
        setData({ ...data, carouselItems: updatedItems });
    });
  };
  
  const removeCarouselItemMedia = (id: string) => {
     const updatedItems = data.carouselItems.map(item => item.id === id ? {...item, mediaUrl: null, mediaType: null, slogan: ''} : item);
     setData({ ...data, carouselItems: updatedItems });
  };

  const socialIcons: { [key: string]: React.ReactNode } = {
    tiktok: <TikTokIcon />,
    instagram: <InstagramIcon />,
    facebook: <FacebookIcon />,
    whatsapp: <WhatsAppIcon />,
    twitter: <XIcon />,
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
            />
        </div>

        {/* Carousel Section */}
        <div className="space-y-4">
            <Label className="text-lg font-semibold">Imágenes del Carrusel</Label>
            <p className="text-sm text-muted-foreground">Sube aquí las imágenes que se mostrarán en el carrusel de tu catálogo (máximo 3).</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.carouselItems.map((item, index) => {
                    const replaceInputRef = useRef<HTMLInputElement>(null);
                    return (
                        <Card key={item.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="text-base">Elemento {index + 1}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 flex-grow">
                                <MediaUploader
                                    mediaUrl={item.mediaUrl}
                                    mediaType={item.mediaType}
                                    onUpload={(file) => handleCarouselUpload(item.id, file)}
                                    onRemove={() => removeCarouselItemMedia(item.id)}
                                    aspectRatio="aspect-video"
                                    uploadTrigger={<></>}
                                />
                                <div>
                                    <Label htmlFor={`slogan-${item.id}`}>Texto sobreimpreso</Label>
                                    <Input id={`slogan-${item.id}`} value={item.slogan} onChange={e => handleCarouselItemChange(item.id, 'slogan', e.target.value)} />
                                </div>
                            </CardContent>
                            <CardFooter className="flex gap-2">
                                <input
                                    type="file"
                                    ref={replaceInputRef}
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            handleCarouselUpload(item.id, e.target.files[0])
                                        }
                                    }}
                                    className="hidden"
                                    accept="image/*,video/*"
                                />
                                <Button variant="outline" size="sm" className="w-full" onClick={() => replaceInputRef.current?.click()}>
                                    <Pencil className="mr-2 h-4 w-4" /> Reemplazar
                                </Button>
                                <Button variant="destructive" size="sm" className="w-full" onClick={() => removeCarouselItemMedia(item.id)}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                </Button>
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.keys(data.socialLinks).map((key) => (
                    <div key={key} className="flex items-center gap-2">
                        <div className="h-9 w-9 flex items-center justify-center bg-muted rounded-md text-muted-foreground">
                            {socialIcons[key as keyof typeof socialIcons]}
                        </div>
                        <Input 
                            placeholder={`URL de ${key.charAt(0).toUpperCase() + key.slice(1)}`}
                            value={data.socialLinks[key as keyof typeof data.socialLinks]}
                            onChange={(e) => handleSocialLinkChange(key as keyof typeof data.socialLinks, e.target.value)}
                        />
                    </div>
                ))}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
