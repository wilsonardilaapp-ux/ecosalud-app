"use client";

import { useCollection, useFirestore, updateDocumentNonBlocking, addDocumentNonBlocking, deleteDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { Module } from '@/models/module';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Trash2, Box } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useState } from 'react';

const moduleSchema = z.object({
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  description: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres." }),
});

export default function ModulesPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isDialogOpen, setDialogOpen] = useState(false);

  const modulesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'modules');
  }, [firestore]);

  const { data: modules, isLoading } = useCollection<Module>(modulesQuery);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof moduleSchema>>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      name: '',
      description: '',
    }
  });

  const handleStatusChange = (module: Module) => {
    if (!firestore) return;
    const newStatus = module.status === 'active' ? 'inactive' : 'active';
    const moduleDocRef = doc(firestore, 'modules', module.id);
    updateDocumentNonBlocking(moduleDocRef, { status: newStatus });
    toast({ title: "Estado actualizado", description: `El módulo "${module.name}" ahora está ${newStatus}.` });
  };
  
  const handleDelete = (module: Module) => {
    if (!firestore) return;
    if (confirm(`¿Estás seguro de que quieres eliminar el módulo "${module.name}"?`)) {
      const moduleDocRef = doc(firestore, 'modules', module.id);
      deleteDocumentNonBlocking(moduleDocRef);
      toast({ title: "Módulo eliminado", description: `El módulo "${module.name}" ha sido eliminado.`, variant: 'destructive' });
    }
  }

  const onSubmit = (data: z.infer<typeof moduleSchema>) => {
    if (!firestore) return;
    const newModule = {
      ...data,
      status: 'inactive', // New modules start as inactive
      createdAt: new Date().toISOString(),
    };
    const modulesCollection = collection(firestore, 'modules');
    addDocumentNonBlocking(modulesCollection, newModule);
    toast({ title: "Módulo Creado", description: `El módulo "${data.name}" ha sido creado.` });
    reset();
    setDialogOpen(false);
  };

  if (isLoading) {
    return <div>Cargando módulos...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>Módulos de la Plataforma</CardTitle>
            <CardDescription>
              Gestiona las funcionalidades principales que estarán disponibles para los clientes.
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Módulo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Añadir Nuevo Módulo</DialogTitle>
                <DialogDescription>
                  Define un nuevo módulo para la plataforma. Una vez creado, podrás activarlo.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-right">Nombre</Label>
                  <Input id="name" {...register("name")} className="col-span-3" />
                  {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="description" className="text-right">Descripción</Label>
                  <Textarea id="description" {...register("description")} className="col-span-3" />
                   {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancelar</Button>
                  </DialogClose>
                  <Button type="submit">Crear Módulo</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {modules && modules.length > 0 ? (
          modules.map((module) => (
            <Card key={module.id} className="flex flex-col">
              <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1.5">
                        <CardTitle>{module.name}</CardTitle>
                        <CardDescription>{module.description}</CardDescription>
                    </div>
                    <Badge variant={module.status === 'active' ? 'default' : 'secondary'}>
                      {module.status === 'active' ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
              </CardHeader>
              <CardContent className="grid gap-6 flex-grow">
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor={`status-${module.id}`} className="text-base">
                      Estado
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Activa o desactiva este módulo.
                    </p>
                  </div>
                  <Switch
                    id={`status-${module.id}`}
                    checked={module.status === 'active'}
                    onCheckedChange={() => handleStatusChange(module)}
                  />
                </div>
              </CardContent>
              <div className="p-6 pt-0">
                 <Button variant="destructive" size="sm" className="w-full" onClick={() => handleDelete(module)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar Módulo
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="p-10 flex flex-col items-center justify-center text-center gap-4 min-h-[400px]">
              <div className="p-4 bg-secondary rounded-full">
                <Box className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold">No hay módulos creados</h3>
              <p className="text-muted-foreground max-w-sm">
                Empieza añadiendo tu primer módulo. Los módulos representan las principales áreas de funcionalidad que ofreces, como "Landing Pages", "Catálogo de Productos" o "Formularios de Contacto".
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

