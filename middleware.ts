import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Simplemente permite que la solicitud continúe sin interrupción.
  // Esta es una configuración segura que previene que el middleware
  // interfiera con las rutas de API o Server Actions.
  return NextResponse.next();
}

export const config = {
  // CORRECCIÓN CRÍTICA AQUÍ:
  // Este matcher asegura que el middleware NO se ejecute en:
  // 1. Rutas de API (/api/...)
  // 2. Archivos estáticos (_next/static, _next/image, favicon, etc.)
  // 3. Archivos con extensión (imágenes, svgs, etc.)
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'
  ]
};