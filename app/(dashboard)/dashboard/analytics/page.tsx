'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">Análisis</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Análisis de Consumo</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <BarChart3 className="h-16 w-16 text-blue-500 mb-4" />
          <p className="text-gray-600 max-w-md">
            Aquí podrás visualizar gráficos avanzados sobre tus patrones de consumo, detectar ineficiencias y generar reportes financieros.
            (Los tableros analíticos se construirán próximamente).
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
