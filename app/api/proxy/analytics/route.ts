import { NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';

export async function GET() {
  const user = await getUser();
  
  if (!user || !user.id) {
    return NextResponse.json({ detail: 'No autorizado. Inicia sesión.' }, { status: 401 });
  }

  try {
    const res = await fetch(`https://saas-energy-backend.onrender.com/api/analytics?id_usuario=${user.id}`, {
      headers: {
        'X-API-KEY': process.env.VECTIA_BACKEND_SECRET || ''
      }
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ detail: 'Error contactando al servidor analítico' }, { status: 500 });
  }
}
