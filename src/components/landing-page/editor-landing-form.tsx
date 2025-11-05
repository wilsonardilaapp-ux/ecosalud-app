
'use client';

import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlignCenter, AlignLeft, AlignRight, GripVertical, Trash2, X } from "lucide-react";
import type { LandingPageData, NavLink } from "@/models/landing-page";
import { Badge } from "../ui/badge";
import RichTextEditor from "../editor/RichTextEditor";

interface EditorLandingFormProps {
  data: LandingPageData;
  setData: (data: LandingPageData) => void;
}

export default function EditorLandingForm({ data, setData }: EditorLandingFormProps) {
    const [newKeyword, setNewKeyword] = useState('');

    const handleInputChange = (section: keyof LandingPageData, field: string, value: any) => {
        setData({
            ...data,
            [section]: {
                ...(data[section] as object),
                [field]: value
            }
        });
    };

    const handleNavLinkChange = (id: string, field: keyof NavLink, value: any) => {
        const updatedLinks = data.navigation.links.map(link =>
            link.id === id ? { ...link, [field]: value } : link
        );
        handleInputChange('navigation', 'links', updatedLinks);
    };

    const addNavLink = () => {
        const newLink: NavLink = { id: uuidv4(), text: 'Nuevo Enlace', url: '#', openInNewTab: false };
        handleInputChange('navigation', 'links', [...data.navigation.links, newLink]);
    };

    const removeNavLink = (id: string) => {
        const updatedLinks = data.navigation.links.filter(link => link.id !== id);
        handleInputChange('navigation', 'links', updatedLinks);
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
            <Tabs defaultValue="hero" className="w-full">
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

                {/* NAVIGATION TAB */}
                <TabsContent value="navigation">
                    <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger className="text-lg font-semibold">Barra Superior (Header)</AccordionTrigger>
                            <AccordionContent className="space-y-6 pt-4">
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <Label htmlFor="nav-enabled" className="flex flex-col space-y-1">
                                        <span>Habilitar Barra Superior</span>
                                        <span className="font-normal leading-snug text-muted-foreground">
                                        Controla la visibilidad de toda la barra de navegación.
                                        </span>
                                    </Label>
                                    <Switch
                                        id="nav-enabled"
                                        checked={data.navigation.enabled}
                                        onCheckedChange={(checked) => handleInputChange('navigation', 'enabled', checked)}
                                    />
                                </div>
                                
                                <div className="space-y-4 p-4 border rounded-lg">
                                    <h3 className="font-medium">Sección de Logo</h3>
                                    <div>
                                        <Label htmlFor="nav-logo-url">URL del Logo</Label>
                                        <Input id="nav-logo-url" placeholder="https://ejemplo.com/logo.png" value={data.navigation.logoUrl} onChange={(e) => handleInputChange('navigation', 'logoUrl', e.target.value)} />
                                    </div>
                                    <div>
                                        <Label htmlFor="nav-logo-alt">Texto Alternativo (si no hay logo)</Label>
                                        <Input id="nav-logo-alt" value={data.navigation.logoAlt} onChange={(e) => handleInputChange('navigation', 'logoAlt', e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>Ancho del Logo: {data.navigation.logoWidth}px</Label>
                                        <Slider
                                            value={[data.navigation.logoWidth]}
                                            onValueChange={(value) => handleInputChange('navigation', 'logoWidth', value[0])}
                                            min={20}
                                            max={300}
                                            step={5}
                                        />
                                    </div>
                                    <div>
                                        <Label>Alineación del Logo</Label>
                                        <div className="flex gap-2 mt-2">
                                            <Button variant={data.navigation.logoAlignment === 'left' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleInputChange('navigation', 'logoAlignment', 'left')}><AlignLeft/></Button>
                                            <Button variant={data.navigation.logoAlignment === 'center' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleInputChange('navigation', 'logoAlignment', 'center')}><AlignCenter/></Button>
                                            <Button variant={data.navigation.logoAlignment === 'right' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleInputChange('navigation', 'logoAlignment', 'right')}><AlignRight/></Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 p-4 border rounded-lg">
                                    <h3 className="font-medium">Enlaces de Navegación</h3>
                                    <div className="space-y-3">
                                        {data.navigation.links.map((link) => (
                                            <div key={link.id} className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                                                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                                                <div className="grid grid-cols-2 gap-2 flex-1">
                                                    <Input placeholder="Texto del enlace" value={link.text} onChange={(e) => handleNavLinkChange(link.id, 'text', e.target.value)} />
                                                    <Input placeholder="URL" value={link.url} onChange={(e) => handleNavLinkChange(link.id, 'url', e.target.value)} />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Label htmlFor={`new-tab-${link.id}`} className="text-xs">Nueva Pestaña</Label>
                                                    <Switch id={`new-tab-${link.id}`} checked={link.openInNewTab} onCheckedChange={(checked) => handleNavLinkChange(link.id, 'openInNewTab', checked)} />
                                                </div>
                                                <Button variant="ghost" size="icon" onClick={() => removeNavLink(link.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                            </div>
                                        ))}
                                    </div>
                                    <Button onClick={addNavLink}>Añadir Enlace</Button>
                                </div>

                                <div className="space-y-4 p-4 border rounded-lg">
                                    <h3 className="font-medium">Estilos</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="nav-bg-color">Color de Fondo</Label>
                                            <Input id="nav-bg-color" type="color" value={data.navigation.backgroundColor} onChange={(e) => handleInputChange('navigation', 'backgroundColor', e.target.value)} className="p-1 h-10"/>
                                        </div>
                                        <div>
                                            <Label htmlFor="nav-text-color">Color de Texto</Label>
                                            <Input id="nav-text-color" type="color" value={data.navigation.textColor} onChange={(e) => handleInputChange('navigation', 'textColor', e.target.value)} className="p-1 h-10"/>
                                        </div>
                                        <div>
                                            <Label htmlFor="nav-hover-color">Color de Hover</Label>
                                            <Input id="nav-hover-color" type="color" value={data.navigation.hoverColor} onChange={(e) => handleInputChange('navigation', 'hoverColor', e.target.value)} className="p-1 h-10"/>
                                        </div>
                                    </div>
                                     <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Tamaño de Fuente: {data.navigation.fontSize}px</Label>
                                            <Slider
                                                value={[data.navigation.fontSize]}
                                                onValueChange={(value) => handleInputChange('navigation', 'fontSize', value[0])}
                                                min={12} max={24} step={1}
                                            />
                                        </div>
                                        <div>
                                            <Label>Espaciado entre enlaces: {data.navigation.spacing}</Label>
                                            <Slider
                                                value={[data.navigation.spacing]}
                                                onValueChange={(value) => handleInputChange('navigation', 'spacing', value[0])}
                                                min={1} max={10} step={1}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch id="nav-shadow" checked={data.navigation.useShadow} onCheckedChange={(checked) => handleInputChange('navigation', 'useShadow', checked)} />
                                        <Label htmlFor="nav-shadow">Añadir Sombra</Label>
                                    </div>
                                </div>

                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
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
