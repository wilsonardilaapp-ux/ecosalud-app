
"use client"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { useUser, useCollection, useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { FileText, ShoppingCart, MessageSquare, CheckCircle, XCircle } from "lucide-react";
import { collection, doc } from "firebase/firestore";
import type { Product } from "@/models/product";
import type { ContactSubmission } from "@/models/contact-submission";
import type { LandingPageData } from "@/models/landing-page";

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

    const productCount = products?.length ?? 0;
    const messageCount = messages?.length ?? 0;
    const isLandingPageCreated = !!landingPage;

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Bienvenido a tu Panel, {user?.displayName ?? user?.email}</CardTitle>
                    <CardDescription>
                        Desde aquí puedes gestionar tu negocio en EcoSalud.
                    </CardDescription>
                </CardHeader>
            </Card>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Próximos pasos</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Configura tu información de negocio.</li>
                        <li>Diseña tu Landing Page.</li>
                        <li>Sube tus productos al catálogo.</li>
                        <li>Define tus métodos de pago.</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
