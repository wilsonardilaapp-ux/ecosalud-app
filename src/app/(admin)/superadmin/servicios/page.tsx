"use client";

import { useCollection, useFirestore, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import type { SystemService } from '@/models/system-service';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

// Datos de ejemplo para los servicios
const sampleServices: Omit<SystemService, 'id' | 'lastUpdate'>[] = [
  { name: 'Gestión de Landing Pages', status: 'active', limit: 500 },
  { name: 'Catálogo de Productos', status: 'active', limit: 800 },
  { name: 'Formularios de Contacto', status: 'inactive', limit: 200 },
  { name: 'Analíticas de Google', status: 'active', limit: 1000 },
  { name: 'Integración con Cloudinary', status: 'inactive', limit: 300 },
];

// Componente para sembrar datos si la colección está vacía
function SeedServices() {
  const firestore = useFirestore();
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeed = async () => {
    if (!firestore) return;
    setIsSeeding(true);
    try {
      const batch = writeBatch(firestore);
      const servicesCollection = collection(firestore, 'systemServices');
      
      sampleServices.forEach((serviceData) => {
        const serviceRef = doc(servicesCollection); // Crea un nuevo documento con ID automático
        batch.set(serviceRef, {
          ...serviceData,
          id: serviceRef.id,
          lastUpdate: new Date().toISOString(),
        });
      });

      await batch.commit();
    } catch (error) {
      console.error("Error seeding services:", error);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Card className="col-span-full">
        <CardContent className="p-6 flex flex-col items-center justify-center gap-4">
           <p className="text-center text-muted-foreground">No hay servicios para mostrar. ¿Quieres añadir datos de ejemplo?</p>
           <Button onClick={handleSeed} disabled={isSeeding}>
                {isSeeding ? 'Añadiendo datos...' : 'Añadir Datos de Ejemplo'}
            </Button>
       </CardContent>
   </Card>
  );
}


export default function ServicesPage() {
  const firestore = useFirestore();

  const servicesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'systemServices');
  }, [firestore]);

  const { data: services, isLoading } = useCollection<SystemService>(servicesQuery);

  const handleStatusChange = (serviceId: string, currentStatus: string) => {
    if (!firestore) return;
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const serviceDocRef = doc(firestore, 'systemServices', serviceId);
    updateDocumentNonBlocking(serviceDocRef, { status: newStatus, lastUpdate: new Date().toISOString() });
  };

  const handleLimitChange = (serviceId: string, newLimit: number[]) => {
    if (!firestore) return;
    const serviceDocRef = doc(firestore, 'systemServices', serviceId);
    updateDocumentNonBlocking(serviceDocRef, { limit: newLimit[0], lastUpdate: new Date().toISOString() });
  };

  if (isLoading) {
    return <div>Cargando servicios...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Servicios del Sistema</CardTitle>
                <CardDescription>
                Activa, desactiva y configura los servicios globales de la plataforma.
                </CardDescription>
            </CardHeader>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services && services.length > 0 ? (
            services.map((service) => (
            <Card key={service.id}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                    <div className="space-y-1.5">
                        <CardTitle>{service.name}</CardTitle>
                        <CardDescription>Última actualización: {new Date(service.lastUpdate).toLocaleString()}</CardDescription>
                    </div>
                    <Badge variant={service.status === 'active' ? 'default' : 'secondary'}>
                        {service.status === 'active' ? 'Activo' : 'Inactivo'}
                    </Badge>
                </CardHeader>
                <CardContent className="grid gap-6">
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label htmlFor={`status-${service.id}`} className="text-base">
                            Estado del servicio
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            Activa o desactiva este servicio globalmente.
                        </p>
                    </div>
                    <Switch
                        id={`status-${service.id}`}
                        checked={service.status === 'active'}
                        onCheckedChange={() => handleStatusChange(service.id, service.status)}
                    />
                    </div>
                    <div className="space-y-4 rounded-lg border p-4">
                        <div className="space-y-0.5">
                             <Label htmlFor={`limit-${service.id}`} className="text-base">
                                Límite de Uso
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Establece el límite de consumo para este servicio.
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                           <Slider
                                id={`limit-${service.id}`}
                                defaultValue={[service.limit]}
                                max={1000}
                                step={10}
                                onValueCommit={(value) => handleLimitChange(service.id, value)}
                                disabled={service.status !== 'active'}
                            />
                            <span className="text-lg font-bold w-12 text-center">{service.limit}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
            ))
        ) : (
           <SeedServices />
        )}
        </div>
    </div>
  );
}
