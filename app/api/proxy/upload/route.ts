import { NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';

export async function POST(request: Request) {
  const user = await getUser();
  
  if (!user || !user.id) {
    return NextResponse.json({ detail: 'No autorizado' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    // Inyectamos de forma segura el ID del usuario aquí en el backend
    formData.append('id_usuario', user.id.toString());

    const res = await fetch('https://saas-energy-backend.onrender.com/api/procesar-factura', {
      method: 'POST',
      headers: {
        'X-API-KEY': process.env.VECTIA_BACKEND_SECRET || ''
      },
      body: formData
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ detail: 'Error contactando al motor de IA' }, { status: 500 });
  }
}
