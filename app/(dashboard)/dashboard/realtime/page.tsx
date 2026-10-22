import { Card, CardContent } from '@/components/ui/card';
import { Activity, Cpu } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function RealTimePage() {
  return (
    <section className="flex-1 p-4 lg:p-8 flex flex-col items-center justify-center min-h-[80vh] bg-gray-50/30">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Telemetría IoT</h1>
          <p className="text-sm text-gray-500">Monitoreo de infraestructura en vivo</p>
        </div>

        <Card className="border-dashed border-2 shadow-sm bg-white overflow-hidden relative">
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 opacity-50"></div>
          
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            
            <div className="relative mb-6">
              <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center relative z-10 border-4 border-white shadow-sm">
                <Activity className="h-10 w-10 text-blue-600 animate-pulse" />
              </div>
              <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-slate-900 rounded-full flex items-center justify-center z-20 shadow-md">
                <Cpu className="h-4 w-4 text-white" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">En Construcción</h2>
            
            <p className="text-gray-600 mb-8 leading-relaxed">
              El módulo de conexión de hardware IoT se encuentra en desarrollo. Pronto podrás enlazar tus medidores físicos y recibir datos de consumo segundo a segundo directamente en este panel.
            </p>

            <Button asChild variant="outline" className="text-blue-700 border-blue-200 hover:bg-blue-50 rounded-full px-6">
              <Link href="/dashboard/analytics">
                Volver al Análisis Histórico
              </Link>
            </Button>
            
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
