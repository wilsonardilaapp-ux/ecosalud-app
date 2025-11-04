"use client";

import { useMemo } from 'react';
import { useDoc, useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { GlobalConfig } from '@/models/global-config';
import { useToast } from "@/hooks/use-toast";

const configSchema = z.object({
  supportEmail: z.string().email({ message: "Email de soporte no válido." }),
  defaultLimits: z.number().min(0, { message: "El límite debe ser positivo." }),
  theme: z.string().min(1, { message: "El tema no puede estar vacío." }),
});

export default function SettingsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const configDocRef = useMemo(() => {
    if (!firestore) return null;
    return doc(firestore, 'globalConfig', 'system');
  }, [firestore]);

  const { data: config, isLoading } = useDoc<GlobalConfig>(configDocRef);

  const { control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(configSchema),
    values: {
        supportEmail: config?.supportEmail ?? '',
        defaultLimits: config?.defaultLimits ?? 100,
        theme: config?.theme ?? 'default'
    }
  });

  const onSubmit = (data: z.infer<typeof configSchema>) => {
    if (!configDocRef) return;
    updateDocumentNonBlocking(configDocRef, data);
    toast({
        title: "Configuración guardada",
        description: "Los cambios se han guardado correctamente.",
    });
  };

  const handleMaintenanceToggle = (maintenance: boolean) => {
    if (!configDocRef) return;
    updateDocumentNonBlocking(configDocRef, { maintenance: !maintenance });
  };
  
  if (isLoading) {
      return <div>Cargando configuración...</div>
  }

  return (
    <div className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Configuración Global</CardTitle>
                <CardDescription>Ajusta la configuración general de la plataforma EcoSalud.</CardDescription>
            </CardHeader>
        </Card>
      <Card>
        <CardHeader>
          <CardTitle>Modo Mantenimiento</CardTitle>
          <CardDescription>
            Activa este modo para deshabilitar temporalmente el acceso público a la plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 rounded-md border p-4">
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">
                Mantenimiento
              </p>
              <p className="text-sm text-muted-foreground">
                {config?.maintenance ? 'El modo mantenimiento está activado.' : 'La plataforma está operativa.'}
              </p>
            </div>
            <Switch
              checked={config?.maintenance ?? false}
              onCheckedChange={() => handleMaintenanceToggle(config?.maintenance ?? false)}
              aria-readonly
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Ajustes Generales</CardTitle>
          <CardDescription>
            Configura los parámetros principales del sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="supportEmail">Email de Soporte</Label>
              <Controller
                name="supportEmail"
                control={control}
                render={({ field }) => (
                    <Input id="supportEmail" placeholder="soporte@ecosalud.com" {...field} />
                )}
              />
              {errors.supportEmail && <p className="text-sm text-destructive">{errors.supportEmail.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultLimits">Límites por Defecto</Label>
               <Controller
                name="defaultLimits"
                control={control}
                render={({ field }) => (
                    <Input id="defaultLimits" type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))}/>
                )}
              />
              {errors.defaultLimits && <p className="text-sm text-destructive">{errors.defaultLimits.message}</p>}
            </div>
             <div className="space-y-2">
              <Label htmlFor="theme">Tema de la Plataforma</Label>
               <Controller
                name="theme"
                control={control}
                render={({ field }) => (
                    <Input id="theme" placeholder="ej. 'default', 'dark'" {...field} />
                )}
              />
              {errors.theme && <p className="text-sm text-destructive">{errors.theme.message}</p>}
            </div>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Guardar Cambios'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}