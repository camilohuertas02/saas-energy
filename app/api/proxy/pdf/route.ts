import { NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';

export async function GET() {
  const user = await getUser();
  
  if (!user || !user.id) {
    return new Response('No autorizado', { status: 401 });
  }

  try {
    const res = await fetch(`https://saas-energy-backend.onrender.com/api/informe-pdf?id_usuario=${user.id}`, {
      headers: {
        'X-API-KEY': process.env.VECTIA_BACKEND_SECRET || ''
      }
    });

    if (!res.ok) throw new Error('Error en backend');

    const blob = await res.blob();
    return new Response(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=informe_vectia.pdf'
      }
    });
  } catch (error) {
    return new Response('Error generando el informe', { status: 500 });
  }
}
