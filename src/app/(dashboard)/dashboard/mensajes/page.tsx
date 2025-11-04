
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function MensajesPage() {
  return (
    <Card className="h-[calc(100vh-10rem)] flex flex-col items-center justify-center">
      <CardHeader className="text-center">
        <div className="inline-block bg-primary/10 text-primary p-4 rounded-full mx-auto mb-4">
            <MessageSquare className="h-10 w-10" />
        </div>
        <CardTitle className="text-3xl font-bold">Bandeja de Mensajes</CardTitle>
        <CardDescription className="text-lg text-muted-foreground">
          Esta sección se encuentra en construcción.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="max-w-md text-center">
          Próximamente podrás ver y gestionar los mensajes de tus clientes.
        </p>
      </CardContent>
    </Card>
  );
}
