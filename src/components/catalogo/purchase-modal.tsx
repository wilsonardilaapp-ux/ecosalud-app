
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/models/product';
import type { PaymentSettings } from '@/models/payment-settings';
import type { Order } from '@/models/order';
import { useFirestore, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';

const purchaseSchema = z.object({
  fullName: z.string().min(3, { message: 'El nombre es requerido.' }),
  email: z.string().email({ message: 'El correo electrónico no es válido.' }),
  whatsapp: z.string().min(7, { message: 'Por favor, introduce un número de WhatsApp válido.' }),
  address: z.string().optional(),
  message: z.string().optional(),
  quantity: z.preprocess(
    (val) => parseInt(String(val), 10),
    z.number().int().min(1, { message: 'La cantidad debe ser al menos 1.' })
  ),
});

interface PurchaseModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  businessPhone: string;
  paymentSettings: PaymentSettings | null;
}

export function PurchaseModal({ isOpen, onOpenChange, product, businessPhone, paymentSettings }: PurchaseModalProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof purchaseSchema>>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      quantity: 1,
      address: "",
      message: "",
      fullName: "",
      email: "",
      whatsapp: "",
    },
  });

  const hasPaymentMethods = paymentSettings && (paymentSettings.nequi?.enabled || paymentSettings.bancolombia?.enabled || paymentSettings.daviplata?.enabled || paymentSettings.pagoContraEntrega?.enabled);
  const defaultTab = paymentSettings?.nequi?.enabled ? "nequi" : paymentSettings?.bancolombia?.enabled ? "bancolombia" : paymentSettings?.daviplata?.enabled ? "daviplata" : "pagoContraEntrega";
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(defaultTab);


  const onSubmit = (data: z.infer<typeof purchaseSchema>) => {
    if (!firestore || !user) return;
    
    const paymentMethodLabels: { [key: string]: string } = {
        nequi: 'Nequi',
        bancolombia: 'Bancolombia',
        daviplata: 'Daviplata',
        pagoContraEntrega: 'Pago Contra Entrega'
    };
    const paymentMethodText = paymentMethodLabels[selectedPaymentMethod] || 'No especificado';
    const subtotal = product.price * data.quantity;

    const orderData: Omit<Order, 'id'> = {
        businessId: user.uid,
        customerName: data.fullName,
        customerEmail: data.email,
        customerPhone: data.whatsapp,
        customerAddress: data.address || 'No especificada',
        productId: product.id,
        productName: product.name,
        quantity: data.quantity,
        unitPrice: product.price,
        subtotal,
        paymentMethod: paymentMethodText,
        orderDate: new Date().toISOString(),
        orderStatus: 'Pendiente',
    };

    const ordersCollection = collection(firestore, 'businesses', user.uid, 'orders');
    addDocumentNonBlocking(ordersCollection, orderData);

    toast({
        title: "¡Pedido Realizado!",
        description: "Tu pedido ha sido enviado al vendedor. ¡Gracias por tu compra!",
    });
    onOpenChange(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copiado', description: 'El número ha sido copiado al portapapeles.' });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Realizar Pedido</DialogTitle>
          <DialogDescription>Completa el formulario para enviar tu pedido y consulta las opciones de pago.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid md:grid-cols-2 gap-8 py-4">
            {/* Columna del Formulario */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">1. Completa tus datos</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Nombre Completo</Label>
                  <Input id="fullName" {...register('fullName')} />
                  {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName.message}</p>}
                </div>
                <div>
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input id="email" type="email" {...register('email')} />
                  {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <Label htmlFor="whatsapp">Número de WhatsApp</Label>
                  <Input id="whatsapp" type="tel" {...register('whatsapp')} placeholder="ej. 3001234567" />
                  {errors.whatsapp && <p className="text-sm text-destructive mt-1">{errors.whatsapp.message}</p>}
                </div>
                <div>
                  <Label htmlFor="address">Dirección de envío</Label>
                  <Input id="address" {...register('address')} placeholder="Tu dirección de envío" />
                </div>
                <div>
                  <Label htmlFor="message">Mensaje Adicional</Label>
                  <Textarea id="message" {...register('message')} placeholder="Instrucciones especiales, etc." />
                </div>
                <div>
                  <Label htmlFor="quantity">Cantidad</Label>
                  <Input id="quantity" type="number" min="1" {...register('quantity')} />
                  {errors.quantity && <p className="text-sm text-destructive mt-1">{errors.quantity.message}</p>}
                </div>
              </div>
            </div>

            {/* Columna de Pagos */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">2. Realiza el pago</h3>
              {hasPaymentMethods ? (
                <Tabs defaultValue={defaultTab} value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    {paymentSettings?.nequi?.enabled && <TabsTrigger value="nequi">Nequi</TabsTrigger>}
                    {paymentSettings?.bancolombia?.enabled && <TabsTrigger value="bancolombia">Bancolombia</TabsTrigger>}
                    {paymentSettings?.daviplata?.enabled && <TabsTrigger value="daviplata">Daviplata</TabsTrigger>}
                    {paymentSettings?.pagoContraEntrega?.enabled && <TabsTrigger value="pagoContraEntrega">Contra Entrega</TabsTrigger>}
                  </TabsList>
                  {paymentSettings?.nequi?.enabled && (
                      <TabsContent value="nequi">
                          <PaymentTabContent
                              methodName="Nequi"
                              accountNumber={paymentSettings.nequi.accountNumber}
                              qrImageUrl={paymentSettings.nequi.qrImageUrl}
                              onCopy={copyToClipboard}
                          />
                      </TabsContent>
                  )}
                  {paymentSettings?.bancolombia?.enabled && (
                      <TabsContent value="bancolombia">
                          <PaymentTabContent
                              methodName="Bancolombia"
                              accountNumber={paymentSettings.bancolombia.accountNumber}
                              qrImageUrl={paymentSettings.bancolombia.qrImageUrl}
                              onCopy={copyToClipboard}
                          />
                      </TabsContent>
                  )}
                  {paymentSettings?.daviplata?.enabled && (
                      <TabsContent value="daviplata">
                          <PaymentTabContent
                              methodName="Daviplata"
                              accountNumber={paymentSettings.daviplata.accountNumber}
                              qrImageUrl={paymentSettings.daviplata.qrImageUrl}
                              onCopy={copyToClipboard}
                          />
                      </TabsContent>
                  )}
                  {paymentSettings?.pagoContraEntrega?.enabled && (
                    <TabsContent value="pagoContraEntrega">
                      <div className="mt-4 space-y-4 text-center p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Pagarás el pedido cuando lo recibas. Asegúrate de tener el monto exacto.</p>
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              ) : (
                <p className="text-sm text-muted-foreground">El vendedor no ha configurado métodos de pago.</p>
              )}
            </div>
          </div>
          <div className="flex justify-end pt-4">
             <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
                <ShoppingBag className="mr-2 h-5 w-5" />
                {isSubmitting ? 'Enviando Pedido...' : 'Confirmar y Enviar Pedido'}
              </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const PaymentTabContent = ({methodName, accountNumber, qrImageUrl, onCopy }: { methodName: string, accountNumber: string, qrImageUrl: string | null, onCopy: (text: string) => void }) => (
    <div className="mt-4 space-y-4 text-center p-4 border rounded-lg">
        <p className="text-sm text-muted-foreground">Escanea el QR o copia el número para pagar con {methodName}.</p>
        {qrImageUrl && (
             <div className="relative aspect-square w-48 mx-auto">
                <Image src={qrImageUrl} alt={`QR ${methodName}`} layout="fill" className="rounded-md object-contain" />
            </div>
        )}
        {accountNumber && (
            <div className="space-y-1">
                <p className="font-semibold">{accountNumber}</p>
                <Button variant="outline" size="sm" onClick={() => onCopy(accountNumber)}>Copiar número</Button>
            </div>
        )}
    </div>
);

    