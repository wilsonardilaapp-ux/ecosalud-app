import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Simplemente permite que la solicitud continúe sin interrupción.
  // Esta es una configuración segura que previene que el middleware
  // interfiera con las rutas de API o Server Actions.
  return NextResponse.next();
}

export const config = {
  // Este matcher asegura que el middleware NO se ejecute en rutas de API,
  // archivos estáticos, o archivos de optimización de imágenes.
  // Esto previene errores como `(0, n.next) is not a function`.
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
