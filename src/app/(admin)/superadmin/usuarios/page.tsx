
"use client";

import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, setDoc, deleteDoc } from 'firebase/firestore';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import type { User } from '@/models/user';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { deleteUser as deleteUserFlow } from '@/ai/flows/delete-user-flow';

const userSchema = z.object({
  name: z.string().min(3, "El nombre es requerido."),
  email: z.string().email("El correo no es válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres.").optional(),
  role: z.enum(['cliente_admin', 'staff', 'super_admin']),
  status: z.enum(['active', 'inactive']),
});

type UserFormData = z.infer<typeof userSchema>;

export default function UsersPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewUserDialogOpen, setNewUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { register, handleSubmit, control, reset, setValue, formState: { errors, isSubmitting } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);

  const { data: users, isLoading } = useCollection<User>(usersQuery);

  const filteredUsers = useMemo(() => {
    return users?.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) ?? [];
  }, [users, searchTerm]);
  
  const handleCreateUser = async (data: UserFormData) => {
    if (!firestore || !data.password) return;
    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const newUser = userCredential.user;

      const userDocRef = doc(firestore, 'users', newUser.uid);
      const userData: Omit<User, 'id'> = {
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      await setDoc(userDocRef, {id: newUser.uid, ...userData});

      toast({ title: "Usuario Creado", description: `El usuario ${data.name} ha sido creado con éxito.` });
      reset({ name: '', email: '', password: '', role: 'cliente_admin', status: 'active' });
      setNewUserDialogOpen(false);
    } catch (error: any) {
      handleAuthError(error);
    }
  };
  
  const handleEditUser = async (data: UserFormData) => {
    if (!firestore || !selectedUser) return;
    try {
        const userDocRef = doc(firestore, 'users', selectedUser.id);
        const updatedData: Partial<User> = {
            name: data.name,
            role: data.role,
            status: data.status,
        };
        
        await updateDocumentNonBlocking(userDocRef, updatedData);
        
        toast({ title: "Usuario Actualizado", description: `Los datos de ${data.name} han sido actualizados.` });
        setEditUserDialogOpen(false);
        setSelectedUser(null);
    } catch (error: any) {
        toast({ variant: "destructive", title: "Error al actualizar", description: error.message });
    }
  };

  const handleToggleStatus = (user: User) => {
    if (!firestore) return;
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const userDocRef = doc(firestore, 'users', user.id);
    updateDocumentNonBlocking(userDocRef, { status: newStatus });
    toast({ title: "Estado Actualizado", description: `El usuario ${user.name} ahora está ${newStatus}.` });
  };
  
  const handleDeleteUser = async () => {
    if (!firestore || !selectedUser) return;
    
    try {
      // Step 1: Delete from Firestore
      const userDocRef = doc(firestore, 'users', selectedUser.id);
      await deleteDoc(userDocRef);

      // Step 2: Delete from Firebase Auth using the server-side flow
      await deleteUserFlow({ uid: selectedUser.id });

      toast({ title: "Usuario Eliminado", description: `El usuario ${selectedUser.name} ha sido eliminado.` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error al eliminar", description: error.message });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };
  
  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setValue('name', user.name);
    setValue('email', user.email);
    setValue('role', user.role);
    setValue('status', user.status);
    setValue('password', ''); // Password is not editable
    setEditUserDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleAuthError = (error: any) => {
      if (error.code === 'auth/email-already-in-use') {
        toast({ variant: "destructive", title: "Correo ya registrado", description: "El correo electrónico que ingresaste ya pertenece a otro usuario." });
      } else {
        toast({ variant: "destructive", title: "Error de autenticación", description: error.message });
      }
  };

  const getStatusVariant = (status: string) => {
    return status === 'active' ? 'default' : 'secondary';
  };
  
  const getRoleVariant = (role: string) => {
    switch (role) {
      case 'super_admin': return 'destructive';
      case 'cliente_admin': return 'default';
      case 'staff': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Usuarios</CardTitle>
              <CardDescription>Gestiona los usuarios de la plataforma.</CardDescription>
            </div>
            <Dialog open={isNewUserDialogOpen} onOpenChange={setNewUserDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Añadir Usuario
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                  <DialogTitle>Añadir Nuevo Usuario</DialogTitle>
                  <DialogDescription>Completa el formulario para crear una nueva cuenta.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleCreateUser)}>
                  <div className="grid gap-4 py-4">
                    {/* Form fields for new user */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name-new" className="text-right">Nombre</Label>
                        <Input id="name-new" {...register("name")} className="col-span-3" />
                    </div>
                    {errors.name && <p className="col-start-2 col-span-3 text-sm text-destructive">{errors.name.message}</p>}
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email-new" className="text-right">Email</Label>
                        <Input id="email-new" type="email" {...register("email")} className="col-span-3" />
                    </div>
                     {errors.email && <p className="col-start-2 col-span-3 text-sm text-destructive">{errors.email.message}</p>}

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password-new" className="text-right">Contraseña</Label>
                        <Input id="password-new" type="password" {...register("password")} className="col-span-3" />
                    </div>
                     {errors.password && <p className="col-start-2 col-span-3 text-sm text-destructive">{errors.password.message}</p>}
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role-new" className="text-right">Rol</Label>
                        <Controller
                            name="role"
                            control={control}
                            defaultValue="cliente_admin"
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="cliente_admin">Cliente Admin</SelectItem><SelectItem value="staff">Staff</SelectItem></SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                    
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status-new" className="text-right">Estado</Label>
                         <Controller
                            name="status"
                            control={control}
                            defaultValue="active"
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="active">Activo</SelectItem><SelectItem value="inactive">Inactivo</SelectItem></SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creando...' : 'Crear Usuario'}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Registrado</TableHead>
                  <TableHead>Último Acceso</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center">Cargando usuarios...</TableCell></TableRow>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell><Badge variant={getRoleVariant(user.role)}>{user.role.replace('_', ' ')}</Badge></TableCell>
                      <TableCell><Badge variant={getStatusVariant(user.status)}>{user.status === 'active' ? 'Activo' : 'Inactivo'}</Badge></TableCell>
                      <TableCell>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Abrir menú</span><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => openEditDialog(user)}>Editar</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(user)}>Cambiar estado</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => openDeleteDialog(user)}>Eliminar</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={7} className="text-center">No se encontraron usuarios.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Edit User Dialog */}
      <Dialog open={isEditUserDialogOpen} onOpenChange={setEditUserDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>Modifica los detalles del usuario. El email y la contraseña no se pueden cambiar aquí.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleEditUser)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name-edit" className="text-right">Nombre</Label>
                <Input id="name-edit" {...register("name")} className="col-span-3" />
              </div>
              {errors.name && <p className="col-start-2 col-span-3 text-sm text-destructive">{errors.name.message}</p>}
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email-edit" className="text-right">Email</Label>
                <Input id="email-edit" type="email" {...register("email")} className="col-span-3" disabled />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role-edit" className="text-right">Rol</Label>
                <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="cliente_admin">Cliente Admin</SelectItem><SelectItem value="staff">Staff</SelectItem></SelectContent>
                        </Select>
                    )}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status-edit" className="text-right">Estado</Label>
                 <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="active">Activo</SelectItem><SelectItem value="inactive">Inactivo</SelectItem></SelectContent>
                        </Select>
                    )}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Guardar Cambios'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Alert Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente al usuario
              <span className="font-bold"> {selectedUser?.name} </span>
              de la autenticación de Firebase y de la base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
