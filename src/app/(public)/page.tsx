import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function WelcomePage() {
  const heroImage = PlaceHolderImages.find((img) => img.id === "eco-hero");

  return (
    <div className="relative h-[calc(100vh-4rem)]">
      {heroImage && (
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          fill
          className="object-cover"
          data-ai-hint={heroImage.imageHint}
          priority
        />
      )}
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white p-4">
        <h1 className="text-4xl md:text-6xl font-bold font-headline drop-shadow-lg">
          Bienvenido a EcoSalud
        </h1>
        <p className="mt-4 max-w-2xl text-lg md:text-xl drop-shadow-md">
          Tu plataforma integral para la gestión de productos de salud y bienestar. Administra tu catálogo, landing page y más, todo en un solo lugar.
        </p>
        <Button asChild size="lg" className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/login">Acceder a la Plataforma</Link>
        </Button>
      </div>
    </div>
  );
}
