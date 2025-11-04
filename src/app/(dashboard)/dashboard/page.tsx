
"use client"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { useUser } from "@/firebase";
import { FileText, ShoppingCart, MessageSquare } from "lucide-react";


export default function DashboardPage() {
    const { user } = useUser();
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
                        <div className="text-2xl font-bold">No creada</div>
                        <p className="text-xs text-muted-foreground">Crea una página atractiva para tus clientes.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Productos en Catálogo</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">Añade tus productos de salud y bienestar.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Mensajes Recibidos</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">Aún no tienes mensajes de clientes.</p>
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
