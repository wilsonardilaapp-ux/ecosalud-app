
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { LandingPageData } from "@/models/landing-page";
import { Badge } from "../ui/badge";
import { useState } from "react";
import RichTextEditor from "../editor/RichTextEditor";

interface EditorLandingFormProps {
  data: LandingPageData;
  setData: (data: LandingPageData) => void;
}

export default function EditorLandingForm({ data, setData }: EditorLandingFormProps) {
    const [newKeyword, setNewKeyword] = useState('');

    const handleInputChange = (tab: keyof LandingPageData, field: string, value: any) => {
        setData({
            ...data,
            [tab]: {
                ...(data[tab] as object),
                [field]: value
            }
        });
    };
    
    const addKeyword = () => {
        if (newKeyword && !data.seo.keywords.includes(newKeyword)) {
          handleInputChange('seo', 'keywords', [...data.seo.keywords, newKeyword]);
          setNewKeyword('');
        }
    };
    
    const removeKeyword = (keywordToRemove: string) => {
        handleInputChange('seo', 'keywords', data.seo.keywords.filter(keyword => keyword !== keywordToRemove));
    };


  return (
    <Card>
        <CardHeader>
            <CardTitle>Panel de Edición</CardTitle>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="hero">
                <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 mb-4">
                    <TabsTrigger value="hero">Principal</TabsTrigger>
                    <TabsTrigger value="navigation">Navegación</TabsTrigger>
                    <TabsTrigger value="sections">Secciones</TabsTrigger>
                    <TabsTrigger value="testimonials">Testimonios</TabsTrigger>
                    <TabsTrigger value="seo">SEO</TabsTrigger>
                    <TabsTrigger value="form">Formulario</TabsTrigger>
                </TabsList>
                
                {/* HERO TAB */}
                <TabsContent value="hero">
                    <div className="space-y-4">
                        <CardTitle className="text-lg">Configuración del Hero</CardTitle>
                        <div>
                            <Label htmlFor="hero-title">Título Principal</Label>
                            <Input id="hero-title" value={data.hero.title} onChange={(e) => handleInputChange('hero', 'title', e.target.value)} />
                        </div>
                         <div>
                            <Label htmlFor="hero-subtitle">Subtítulo</Label>
                            <Input id="hero-subtitle" value={data.hero.subtitle} onChange={(e) => handleInputChange('hero', 'subtitle', e.target.value)} />
                        </div>
                        <div>
                            <Label>Contenido Adicional</Label>
                            <RichTextEditor
                                value={data.hero.additionalContent}
                                onChange={(content) => handleInputChange('hero', 'additionalContent', content)}
                                placeholder="Escribe aquí..."
                            />
                        </div>
                        <div>
                            <Label htmlFor="hero-image">URL de Imagen del Hero</Label>
                            <Input id="hero-image" value={data.hero.imageUrl} onChange={(e) => handleInputChange('hero', 'imageUrl', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="hero-cta-text">Texto del Botón CTA</Label>
                                <Input id="hero-cta-text" value={data.hero.ctaButtonText} onChange={(e) => handleInputChange('hero', 'ctaButtonText', e.target.value)} />
                            </div>
                            <div>
                                <Label htmlFor="hero-cta-url">URL del Botón CTA</Label>
                                <Input id="hero-cta-url" value={data.hero.ctaButtonUrl} onChange={(e) => handleInputChange('hero', 'ctaButtonUrl', e.target.value)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="hero-bg-color">Color de Fondo</Label>
                                <Input id="hero-bg-color" type="color" value={data.hero.backgroundColor} onChange={(e) => handleInputChange('hero', 'backgroundColor', e.target.value)} className="p-1"/>
                            </div>
                            <div>
                                <Label htmlFor="hero-text-color">Color de Texto</Label>
                                <Input id="hero-text-color" type="color" value={data.hero.textColor} onChange={(e) => handleInputChange('hero', 'textColor', e.target.value)} className="p-1"/>
                            </div>
                            <div>
                                <Label htmlFor="hero-btn-color">Color del Botón</Label>
                                <Input id="hero-btn-color" type="color" value={data.hero.buttonColor} onChange={(e) => handleInputChange('hero', 'buttonColor', e.target.value)} className="p-1"/>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* SEO TAB */}
                <TabsContent value="seo">
                    <div className="space-y-4">
                        <CardTitle className="text-lg">Configuración SEO</CardTitle>
                        <div>
                            <Label htmlFor="seo-title">Título SEO</Label>
                            <Input id="seo-title" value={data.seo.title} onChange={(e) => handleInputChange('seo', 'title', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="seo-description">Descripción SEO</Label>
                             <Input id="seo-description" value={data.seo.description} onChange={(e) => handleInputChange('seo', 'description', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="seo-keywords">Palabras Clave</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="seo-keywords"
                                    value={newKeyword}
                                    onChange={(e) => setNewKeyword(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
                                />
                                <Button onClick={addKeyword}>Añadir</Button>
                            </div>
                             <div className="flex flex-wrap gap-2 mt-2">
                                {data.seo.keywords.map(keyword => (
                                <Badge key={keyword} variant="secondary" className="flex items-center gap-1">
                                    {keyword}
                                    <button onClick={() => removeKeyword(keyword)} className="rounded-full hover:bg-muted-foreground/20 p-0.5">
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </TabsContent>
                
                {/* OTHER TABS - PLACEHOLDER */}
                <TabsContent value="navigation">
                    <div className="flex flex-col items-center justify-center text-center p-10 h-64 border rounded-md">
                        <p className="text-muted-foreground">Opciones de navegación en desarrollo.</p>
                    </div>
                </TabsContent>
                <TabsContent value="sections">
                     <div className="flex flex-col items-center justify-center text-center p-10 h-64 border rounded-md">
                        <p className="text-muted-foreground">Gestor de secciones en desarrollo.</p>
                    </div>
                </TabsContent>
                <TabsContent value="testimonials">
                     <div className="flex flex-col items-center justify-center text-center p-10 h-64 border rounded-md">
                        <p className="text-muted-foreground">Gestor de testimonios en desarrollo.</p>
                    </div>
                </TabsContent>
                <TabsContent value="form">
                    <div className="flex flex-col items-center justify-center text-center p-10 h-64 border rounded-md">
                        <p className="text-muted-foreground">Opciones del formulario de reseñas en desarrollo.</p>
                    </div>
                </TabsContent>
            </Tabs>
        </CardContent>
    </Card>
  );
}
