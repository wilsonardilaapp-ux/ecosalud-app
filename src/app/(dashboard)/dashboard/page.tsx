
"use client"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { useUser, useCollection, useDoc, useFirestore, useMemoFirebase, setDocumentNonBlocking } from "@/firebase";
import { FileText, ShoppingCart, MessageSquare, CheckCircle, XCircle, ShoppingBag, Loader2, UploadCloud, Image as ImageIcon } from "lucide-react";
import { collection, doc } from "firebase/firestore";
import type { Product } from "@/models/product";
import type { ContactSubmission } from "@/models/contact-submission";
import type { LandingPageData } from "@/models/landing-page";
import type { Order } from "@/models/order";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, Line, LineChart, Pie, PieChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { useMemo, useState, useRef } from "react";
import type { GlobalConfig } from "@/models/global-config";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";
import { uploadMedia } from "@/ai/flows/upload-media-flow";
import { Label } from "@/components/ui/label";

const MAX_FILE_SIZE_MB = 0.5; // 500KB
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const FaviconConfigurator = () => {
    const firestore = useFirestore();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const configDocRef = useMemoFirebase(() => !firestore ? null : doc(firestore, 'globalConfig', 'system'), [firestore]);
    const { data: config } = useDoc<GlobalConfig>(configDocRef);

    const [faviconFile, setFaviconFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(config?.faviconUrl || null);
    const [isUploading, setIsUploading] = useState(false);
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_FILE_SIZE_BYTES) {
            toast({
                variant: 'destructive',
                title: "Archivo muy grande",
                description: `El archivo es demasiado grande. El máximo es ${MAX_FILE_SIZE_MB}MB.`,
            });
            return;
        }

        setFaviconFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSaveFavicon = async () => {
        if (!faviconFile || !configDocRef) return;
        
        setIsUploading(true);
        toast({ title: "Subiendo favicon...", description: "Por favor, espera." });

        const reader = new FileReader();
        reader.readAsDataURL(faviconFile);
        reader.onloadend = async () => {
            const mediaDataUri = reader.result as string;
            try {
                const result = await uploadMedia({ mediaDataUri });
                setDocumentNonBlocking(configDocRef, { faviconUrl: result.secure_url }, { merge: true });
                toast({ title: "¡Favicon guardado!", description: "El nuevo favicon ha sido guardado correctamente." });
            } catch (error: any) {
                toast({ variant: 'destructive', title: "Error al subir", description: error.message });
            } finally {
                setIsUploading(false);
                setFaviconFile(null);
            }
        };
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Configuración del Favicon</CardTitle>
                <CardDescription>
                    Sube una imagen para usarla como favicon en la pestaña del navegador.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-6 items-center">
                <div 
                    className="md:col-span-1 aspect-square w-full max-w-[200px] mx-auto border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center p-4 cursor-pointer hover:border-primary"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {isUploading ? (
                        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                    ) : previewUrl ? (
                        <Image src={previewUrl} alt="Vista previa del favicon" width={64} height={64} className="object-contain" />
                    ) : (
                        <>
                            <UploadCloud className="h-10 w-10 text-muted-foreground" />
                            <p className="mt-2 text-sm font-medium">Subir imagen</p>
                        </>
                    )}
                     <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".png,.jpg,.jpeg,.ico,.svg"
                    />
                </div>
                <div className="md:col-span-2 space-y-4">
                    <div>
                        <Label>Vista Previa</Label>
                        <div className="mt-2 flex items-center gap-2 rounded-md border p-3 bg-muted/50">
                            {previewUrl ? (
                                <Image src={previewUrl} alt="Favicon" width={24} height={24} />
                            ) : (
                                <div className="w-6 h-6 bg-gray-300 rounded-sm flex items-center justify-center">
                                    <ImageIcon className="w-4 h-4 text-gray-500"/>
                                </div>
                            )}
                            <p className="text-sm font-medium text-muted-foreground">Mi Sitio Web</p>
                        </div>
                    </div>
                     <p className="text-xs text-muted-foreground">
                        Recomendado: 32x32 px o 64x64 px en formato .png, .ico o .svg.
                    </p>
                    <Button onClick={handleSaveFavicon} disabled={!faviconFile || isUploading}>
                        {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar Favicon
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};


export default function DashboardPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    // Query for products
    const productsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return collection(firestore, 'businesses', user.uid, 'products');
    }, [firestore, user]);
    const { data: products } = useCollection<Product>(productsQuery);

    // Query for messages
    const messagesQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return collection(firestore, 'businesses', user.uid, 'contactSubmissions');
    }, [firestore, user]);
    const { data: messages } = useCollection<ContactSubmission>(messagesQuery);
    
    // Query for landing page status
    const landingPageRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'businesses', user.uid, 'landingPages', 'main');
    }, [firestore, user]);
    const { data: landingPage } = useDoc<LandingPageData>(landingPageRef);

    // Query for orders
    const ordersQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return collection(firestore, 'businesses', user.uid, 'orders');
    }, [firestore, user]);
    const { data: orders } = useCollection<Order>(ordersQuery);

    const productCount = products?.length ?? 0;
    const messageCount = messages?.length ?? 0;
    const orderCount = orders?.length ?? 0;
    const isLandingPageCreated = !!landingPage;

    // --- Chart Data Processing ---
    const monthlySales = useMemo(() => {
        if (!orders) return [];
        const sales: { [key: string]: number } = {};
        orders.forEach(order => {
            const month = new Date(order.orderDate).toLocaleString('default', { month: 'short' });
            sales[month] = (sales[month] || 0) + order.subtotal;
        });
        const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return monthOrder.map(month => ({ month, total: sales[month] || 0 })).filter(d => d.total > 0);
    }, [orders]);

    const salesByStatus = useMemo(() => {
        if (!orders) return [];
        const statusCount: { [key: string]: number } = {};
        orders.forEach(order => {
            statusCount[order.orderStatus] = (statusCount[order.orderStatus] || 0) + 1;
        });
        return Object.entries(statusCount).map(([status, count]) => ({ status, count }));
    }, [orders]);

    const salesByProduct = useMemo(() => {
        if (!orders) return [];
        const productSales: { [key: string]: number } = {};
        orders.forEach(order => {
            productSales[order.productName] = (productSales[order.productName] || 0) + order.quantity;
        });
        return Object.entries(productSales).map(([name, quantity]) => ({ name, quantity }));
    }, [orders]);

    const lineChartConfig = {
        total: { label: "Ventas", color: "hsl(var(--chart-1))" },
    };
     const barChartConfig = {
        count: { label: "Pedidos", color: "hsl(var(--chart-2))" },
    };
    const pieChartConfig = {
        quantity: { label: "Cantidad" },
    };

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Bienvenido a tu Panel, {user?.displayName ?? user?.email}</CardTitle>
                    <CardDescription>
                        Desde aquí puedes gestionar tu negocio en Vidaplena.
                    </CardDescription>
                </CardHeader>
            </Card>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Editor de Landing Page</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLandingPageCreated ? (
                           <div className="flex items-center gap-2">
                                <CheckCircle className="h-8 w-8 text-green-500" />
                                <div>
                                    <div className="text-2xl font-bold">Creada</div>
                                    <p className="text-xs text-muted-foreground">Tu página ya está configurada.</p>
                                </div>
                           </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <XCircle className="h-8 w-8 text-destructive" />
                                <div>
                                    <div className="text-2xl font-bold">No creada</div>
                                    <p className="text-xs text-muted-foreground">Crea una página atractiva para tus clientes.</p>
                                </div>
                           </div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Productos en Catálogo</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{productCount}</div>
                        <p className="text-xs text-muted-foreground">{productCount === 1 ? "Tienes 1 producto en tu catálogo." : `Tienes ${productCount} productos en tu catálogo.`}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Mensajes Recibidos</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{messageCount}</div>
                        <p className="text-xs text-muted-foreground">{messageCount === 0 ? "Aún no tienes mensajes de clientes." : `Has recibido ${messageCount} mensajes.`}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pedidos Recibidos</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{orderCount}</div>
                        <p className="text-xs text-muted-foreground">{orderCount === 0 ? "Aún no has recibido pedidos." : `Tienes ${orderCount} pedidos en total.`}</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Análisis de Ventas</CardTitle>
                    <CardDescription>Visualiza el rendimiento de tu negocio.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="line">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="line">Ventas por Mes</TabsTrigger>
                            <TabsTrigger value="bar">Pedidos por Estado</TabsTrigger>
                            <TabsTrigger value="pie">Productos Vendidos</TabsTrigger>
                        </TabsList>
                        <TabsContent value="line">
                            <ChartContainer config={lineChartConfig} className="h-[300px] w-full">
                                <LineChart data={monthlySales}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Line dataKey="total" type="monotone" stroke="var(--color-total)" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ChartContainer>
                        </TabsContent>
                        <TabsContent value="bar">
                            <ChartContainer config={barChartConfig} className="h-[300px] w-full">
                                <BarChart data={salesByStatus}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="status" tickLine={false} axisLine={false} tickMargin={8} />
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                                </BarChart>
                            </ChartContainer>
                        </TabsContent>
                        <TabsContent value="pie" className="flex justify-center">
                             <ChartContainer config={pieChartConfig} className="h-[300px] w-full">
                                <PieChart>
                                    <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                                    <Pie data={salesByProduct} dataKey="quantity" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="hsl(var(--chart-1))" />
                                </PieChart>
                            </ChartContainer>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <FaviconConfigurator />
        </div>
    );
}
