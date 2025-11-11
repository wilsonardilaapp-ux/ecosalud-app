
"use client";

import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, collectionGroup } from "firebase/firestore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building, TestTube, Users, FileText, ShoppingCart, Loader2 } from "lucide-react";

export default function AnalyticsPage() {
  const firestore = useFirestore();

  const usersQuery = useMemoFirebase(() => !firestore ? null : collection(firestore, 'users'), [firestore]);
  const businessesQuery = useMemoFirebase(() => !firestore ? null : collection(firestore, 'businesses'), [firestore]);
  const landingPagesQuery = useMemoFirebase(() => !firestore ? null : collectionGroup(firestore, 'landingPages'), [firestore]);
  const submissionsQuery = useMemoFirebase(() => !firestore ? null : collectionGroup(firestore, 'contactSubmissions'), [firestore]);
  const productsQuery = useMemoFirebase(() => !firestore ? null : collectionGroup(firestore, 'products'), [firestore]);

  const { data: users, isLoading: usersLoading } = useCollection(usersQuery);
  const { data: businesses, isLoading: businessesLoading } = useCollection(businessesQuery);
  const { data: landingPages, isLoading: pagesLoading } = useCollection(landingPagesQuery);
  const { data: submissions, isLoading: submissionsLoading } = useCollection(submissionsQuery);
  const { data: products, isLoading: productsLoading } = useCollection(productsQuery);
  
  const isLoading = usersLoading || businessesLoading || pagesLoading || submissionsLoading || productsLoading;

  const kpiData = [
      { title: "Empresas Registradas", value: businesses?.length.toString() ?? "0", icon: Building, change: "+15.2%", period: "el último mes" },
      { title: "Landing Pages Activas", value: landingPages?.length.toString() ?? "0", icon: TestTube, change: "+8.9%", period: "esta semana" },
      { title: "Envíos de Formularios", value: submissions?.length.toString() ?? "0", icon: FileText, change: "+112", period: "hoy" },
      { title: "Productos en Catálogo", value: products?.length.toString() ?? "0", icon: ShoppingCart, change: "+0", period: "esta semana" },
      { title: "Nuevos Usuarios", value: users?.length.toString() ?? "0", icon: Users, change: "+22.5%", period: "el último mes" },
  ];

  return (
    <div className="flex flex-col gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Métricas y Analíticas</CardTitle>
                <CardDescription>
                Visualiza los indicadores clave de rendimiento (KPIs) de la plataforma EcoSalud.
                </CardDescription>
            </CardHeader>
        </Card>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {kpiData.map(kpi => (
                <Card key={kpi.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                        <kpi.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                <span className="text-muted-foreground text-sm">...</span>
                            </div>
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{kpi.value}</div>
                                <p className="text-xs text-muted-foreground">{kpi.change} {kpi.period}</p>
                            </>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Gráficos Avanzados</CardTitle>
                <CardDescription>
                Esta sección está en desarrollo y pronto mostrará gráficos interactivos.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64 bg-secondary/50 rounded-lg">
                <p className="text-muted-foreground">Próximamente: Gráficos de analíticas...</p>
            </CardContent>
        </Card>
    </div>
  );
}
