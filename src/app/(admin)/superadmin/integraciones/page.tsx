"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlugZap } from "lucide-react";

export default function IntegrationsPage() {
  return (
    <Card className="h-[calc(100vh-10rem)] flex flex-col items-center justify-center">
      <CardHeader className="text-center">
        <div className="inline-block bg-primary/10 text-primary p-4 rounded-full mx-auto mb-4">
            <PlugZap className="h-10 w-10" />
        </div>
        <CardTitle className="text-3xl font-bold">Integraciones</CardTitle>
        <CardDescription className="text-lg text-muted-foreground">
          Esta sección se encuentra en construcción.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="max-w-md text-center">
          Próximamente podrás conectar y gestionar integraciones con servicios de terceros.
        </p>
      </CardContent>
    </Card>
  );
}