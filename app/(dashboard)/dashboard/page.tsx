'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardOverviewPage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">Resumen general</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Bienvenido a Vectia IA</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Aquí podrás visualizar un resumen de la actividad, consumo y analíticas de tu infraestructura.
            (Este panel se construirá próximamente).
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
