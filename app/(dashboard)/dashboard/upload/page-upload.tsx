'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud } from 'lucide-react';

export default function UploadPage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">Subir facturas</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Carga de documentos</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <UploadCloud className="h-16 w-16 text-blue-500 mb-4" />
          <p className="text-gray-600 max-w-md">
            Aquí podrás subir tus recibos y facturas de servicios públicos en formato PDF para que Vectia IA extraiga automáticamente los datos.
            (Este módulo de carga se construirá próximamente).
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
