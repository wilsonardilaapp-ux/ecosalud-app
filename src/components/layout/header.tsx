import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/icons";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold font-headline text-foreground">
            EcoSalud
          </span>
        </Link>
        <nav>
          <Button asChild variant="outline">
            <Link href="/login">Iniciar Sesión</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
