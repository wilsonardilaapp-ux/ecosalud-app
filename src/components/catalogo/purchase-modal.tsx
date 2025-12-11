
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
import { Tabs, TabsContent, TabsTrigger, TabsList } from '@/components/ui/tabs';
import { ShoppingBag, Building2, HandCoins } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/models/product';
import type { PaymentSettings } from '@/models/payment-settings';
import type { Order } from '@/models/order';
import { useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { TikTokIcon, WhatsAppIcon, XIcon, FacebookIcon, InstagramIcon } from '@/components/icons';


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
  businessId: string;
  businessPhone: string;
  paymentSettings: PaymentSettings | null;
}

const paymentMethodsConfig = {
    nequi: { label: "Nequi", icon: "/iconos/nequi.png" },
    bancolombia: { label: "Bancolombia", icon: "/iconos/bancolombia.png" },
    daviplata: { label: "Daviplata", icon: "/iconos/daviplata.png" },
    breB: { label: "Bre-B", icon: <Building2 className="h-6 w-6" /> },
    pagoContraEntrega: { label: "Contra Entrega", icon: <HandCoins className="h-6 w-6" /> },
};

export function PurchaseModal({ isOpen, onOpenChange, product, businessId, businessPhone, paymentSettings }: PurchaseModalProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const availableMethods = Object.entries(paymentMethodsConfig)
        .map(([key, config]) => ({
            key,
            ...config,
            enabled: (paymentSettings?.[key as keyof PaymentSettings] as any)?.enabled ?? false
        }))
        .filter(method => method.enabled);

  const defaultTab = availableMethods.length > 0 ? availableMethods[0].key : "";
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(defaultTab);

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

  const onSubmit = (data: z.infer<typeof purchaseSchema>) => {
    // 1. Guardar el pedido en Firestore (si está disponible)
    if (firestore && businessId) {
      const paymentMethodLabels: { [key: string]: string } = {
          nequi: 'Nequi',
          bancolombia: 'Bancolombia',
          daviplata: 'Daviplata',
          breB: 'Bre-B',
          pagoContraEntrega: 'Pago Contra Entrega'
      };
      const paymentMethodText = paymentMethodLabels[selectedPaymentMethod] || 'No especificado';
      const subtotal = product.price * data.quantity;

      const orderData: Omit<Order, 'id'> = {
          businessId: businessId,
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

      const ordersCollection = collection(firestore, 'businesses', businessId, 'orders');
      addDocumentNonBlocking(ordersCollection, orderData);

      toast({
          title: "¡Pedido Registrado!",
          description: "Tu pedido ha sido enviado al vendedor y guardado. Serás redirigido a WhatsApp.",
      });
    } else {
        toast({
            title: "Pedido listo para enviar",
            description: "Serás redirigido a WhatsApp para completar tu pedido.",
        });
    }

    // 2. Abrir WhatsApp con el mensaje
    const subtotal = product.price * data.quantity;
    const paymentMethodText = selectedPaymentMethod === 'pagoContraEntrega' ? 'Pago Contra Entrega' : selectedPaymentMethod.charAt(0).toUpperCase() + selectedPaymentMethod.slice(1);
    
    let messageBody = `¡Hola! 👋 Estoy interesado en realizar un pedido:\n\n`
    messageBody += `*Producto:* ${product.name}\n`;
    messageBody += `*Cantidad:* ${data.quantity}\n`;
    messageBody += `*Precio Unitario:* ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(product.price)}\n`;
    messageBody += `*Subtotal:* ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(subtotal)}\n\n`;
    messageBody += `*Mis Datos:*\n`;
    messageBody += `*Nombre:* ${data.fullName}\n`;
    messageBody += `*Email:* ${data.email}\n`;
    messageBody += `*WhatsApp:* ${data.whatsapp}\n`;
    if (data.address) messageBody += `*Dirección:* ${data.address}\n`;
    messageBody += `*Método de pago elegido:* ${paymentMethodText}\n\n`;
    if (data.message) messageBody += `*Mensaje adicional:* ${data.message}\n`;
    messageBody += `¡Quedo atento a la confirmación! 👍`;

    const whatsappUrl = `https://wa.me/${businessPhone.replace(/\D/g, '')}?text=${encodeURIComponent(messageBody)}`;
    window.open(whatsappUrl, '_blank');

    onOpenChange(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copiado', description: 'El número ha sido copiado al portapapeles.' });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Realizar Pedido</DialogTitle>
          <DialogDescription>Completa el formulario para enviar tu pedido y consulta las opciones de pago.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex-grow overflow-y-auto pr-2">
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
              {availableMethods.length > 0 ? (
                <Tabs defaultValue={defaultTab} value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod} className="w-full">
                  <TabsList className="grid grid-cols-2 gap-3 mb-4 h-auto bg-transparent p-0">
                    {availableMethods.map((method) => (
                      <TabsTrigger
                        key={method.key}
                        value={method.key}
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 p-4 h-auto border rounded-lg transition-colors data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary",
                          "bg-background text-foreground hover:bg-accent"
                        )}
                      >
                         {typeof method.icon === 'string' ? (
                            <Image src={method.icon} alt={method.label} width={24} height={24} className="object-contain" />
                         ) : (
                            method.icon
                         )}
                        <span className="text-sm font-medium">{method.label}</span>
                      </TabsTrigger>
                    ))}
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
                  {paymentSettings?.breB?.enabled && (
                    <TabsContent value="breB">
                        <BreBPaymentTabContent
                            data={paymentSettings.breB}
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
          <div className="flex justify-end pt-4 sticky bottom-0 bg-background pb-4">
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

const BreBPaymentTabContent = ({ data, onCopy }: { data: PaymentSettings['breB'], onCopy: (text: string) => void }) => (
    <div className="mt-4 space-y-4 text-center p-4 border rounded-lg">
        <p className="text-sm text-muted-foreground">Usa el código QR o los datos de la llave para pagar con Bre-B.</p>
        
        {data.qrImageUrl && (
            <div className="relative aspect-square w-48 mx-auto">
                <Image src={data.qrImageUrl} alt="QR Bre-B" layout="fill" className="rounded-md object-contain" />
            </div>
        )}
        
        <div className="space-y-2 text-left bg-muted/50 p-3 rounded-md">
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Titular:</span>
                <span className="text-sm">{data.holderName}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Llave ({data.keyType}):</span>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{data.keyValue}</span>
                    <Button variant="outline" size="sm" onClick={() => onCopy(data.keyValue)}>Copiar</Button>
                </div>
            </div>
             {data.commerceCode && (
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Cód. Comercio:</span>
                    <span className="text-sm">{data.commerceCode}</span>
                </div>
             )}
        </div>
    </div>
);
