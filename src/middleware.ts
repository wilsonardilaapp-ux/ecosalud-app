import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Simplemente permite que la solicitud continúe sin interrupción.
  return NextResponse.next();
}

export const config = {
  // Al no especificar un "matcher", el middleware no se ejecutará en ninguna ruta.
  // Esto es más simple y previene conflictos.
};
