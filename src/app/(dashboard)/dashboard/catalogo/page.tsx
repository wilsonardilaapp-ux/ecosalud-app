
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

export default function CatalogoPage() {
  return (
    <Card className="h-[calc(100vh-10rem)] flex flex-col items-center justify-center">
      <CardHeader className="text-center">
        <div className="inline-block bg-primary/10 text-primary p-4 rounded-full mx-auto mb-4">
            <ShoppingCart className="h-10 w-10" />
        </div>
        <CardTitle className="text-3xl font-bold">Catálogo de Productos</CardTitle>
        <CardDescription className="text-lg text-muted-foreground">
          Esta sección se encuentra en construcción.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="max-w-md text-center">
          Próximamente podrás añadir, editar y gestionar tus productos.
        </p>
      </CardContent>
    </Card>
  );
}
