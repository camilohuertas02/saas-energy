'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Download, MapPin, TrendingUp, Zap, AlertTriangle, Building2, FileX2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

// Fetcher súper limpio, ya no necesita buscar tokens
const fetcherProxy = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Error al cargar los datos');
  }
  return res.json();
};

export default function AnalyticsPage() {
  const [viewMode, setViewMode] = useState<'consumo' | 'gasto'>('gasto');
  const [isDownloading, setIsDownloading] = useState(false);

  // Apuntamos a nuestra ruta interna de Next.js
  const { data: responseData, error, isLoading } = useSWR('/api/proxy/analytics', fetcherProxy);

  const facturas = responseData?.data || [];
  const hasData = facturas.length > 0;
  const isInitialLoading = isLoading && !error;

  const { kpis, chartData, sedes } = useMemo(() => {
    let gastoTotal = 0;
    let consumoPrincipal = 0;
    const sedesUnicas = new Set();
    const datosMensuales: Record<string, any> = {};

    facturas.forEach((factura: any) => {
      gastoTotal += Number(factura.valor_total) || 0;
      const direccion = factura.direccion_sede || 'Sede Principal';
      sedesUnicas.add(direccion);

      let consumoFactura = 0;
      if (factura.consumos_medidores) {
        factura.consumos_medidores.forEach((medidor: any) => {
          consumoFactura += Number(medidor.consumo) || 0;
        });
      }
      consumoPrincipal += consumoFactura;

      const mes = factura.periodo_inicio ? factura.periodo_inicio.substring(0, 7) : 'Desconocido';
      const servicio = factura.tipo_servicio || 'energia';

      if (!datosMensuales[mes]) {
        datosMensuales[mes] = { name: mes, energia_gasto: 0, agua_gasto: 0, gas_gasto: 0, energia_consumo: 0, agua_consumo: 0, gas_consumo: 0 };
      }

      datosMensuales[mes][`${servicio}_gasto`] += Number(factura.valor_total) || 0;
      datosMensuales[mes][`${servicio}_consumo`] += consumoFactura;
    });

    return {
      kpis: { gastoTotal, consumoPrincipal, totalSedes: sedesUnicas.size },
      chartData: Object.values(datosMensuales).sort((a: any, b: any) => a.name.localeCompare(b.name)),
      sedes: Array.from(sedesUnicas)
    };
  }, [facturas]);


  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      // Apuntamos al proxy
      const res = await fetch('/api/proxy/pdf');
      if (!res.ok) throw new Error('Error al generar el informe');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Vectia_Reporte_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Hubo un error al descargar el informe corporativo.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <section className="flex-1 p-4 lg:p-8 bg-gray-50/30 min-h-screen">
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Enterprise Dashboard</h1>
          <p className="text-sm text-gray-500">Inteligencia operativa y financiera de tus instalaciones</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-lg border shadow-sm">
          <div className="flex bg-gray-100 p-1 rounded-md">
            <button 
              onClick={() => setViewMode('consumo')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'consumo' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Uso (Físico)
            </button>
            <button 
              onClick={() => setViewMode('gasto')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'gasto' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Gasto (Financiero)
            </button>
          </div>
          <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>
          <Button 
            onClick={handleDownloadPDF} 
            disabled={isDownloading || !hasData} 
            className="bg-blue-900 hover:bg-blue-800 text-white shadow-sm disabled:opacity-50"
          >
            <Download className="mr-2 h-4 w-4" />
            {isDownloading ? 'Generando...' : 'Exportar Informe'}
          </Button>
        </div>
      </div>

      {error && !hasData && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-sm flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <span>No pudimos obtener la información analítica. Razón: {error.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className={!hasData ? "opacity-70 grayscale" : ""}>
          <CardContent className="p-6">
            <div className="flex justify-between items-center space-y-0 pb-2">
              <p className="text-sm font-medium text-gray-500">Gasto Total Acumulado</p>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ${isInitialLoading ? "..." : kpis.gastoTotal.toLocaleString('es-CO')} <span className="text-sm font-normal text-gray-500">COP</span>
            </div>
          </CardContent>
        </Card>
        <Card className={!hasData ? "opacity-70 grayscale" : ""}>
          <CardContent className="p-6">
            <div className="flex justify-between items-center space-y-0 pb-2">
              <p className="text-sm font-medium text-gray-500">Sedes Monitoreadas</p>
              <Building2 className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {isInitialLoading ? "..." : kpis.totalSedes}
            </div>
          </CardContent>
        </Card>
        <Card className={!hasData ? "opacity-70 grayscale" : ""}>
          <CardContent className="p-6">
            <div className="flex justify-between items-center space-y-0 pb-2">
              <p className="text-sm font-medium text-gray-500">Consumo Energético</p>
              <Zap className="h-4 w-4 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {isInitialLoading ? "..." : kpis.consumoPrincipal.toLocaleString('es-CO')} <span className="text-sm font-normal text-gray-500">kWh</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-6">
            <div className="flex justify-between items-center space-y-0 pb-2">
              <p className="text-sm font-medium text-blue-800">Alerta: Energía Reactiva</p>
              <AlertTriangle className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-sm font-medium text-blue-900 mt-2">
              {!hasData ? "Esperando información base..." : "Sin penalizaciones detectadas en el último periodo."}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2 overflow-hidden relative">
          <CardHeader>
            <CardTitle>{viewMode === 'gasto' ? 'Distribución de Gasto por Servicio (COP)' : 'Evolución de Consumo'}</CardTitle>
            <CardDescription>Comparativa histórica mensual</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] relative">
            
            {(!hasData && !isInitialLoading) && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px] rounded-b-lg">
                <BarChart3 className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-700 font-medium text-lg">Aún no hay datos para graficar</p>
                <p className="text-gray-500 text-sm mt-1">Sube y extrae tu primera factura para iniciar el análisis</p>
              </div>
            )}

            {isInitialLoading ? (
               <div className="w-full h-full flex items-center justify-center text-gray-400">Cargando gráficos...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hasData ? chartData : [{name: 'Mes 1'}, {name: 'Mes 2'}]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} tickFormatter={(val) => viewMode === 'gasto' ? `$${val/1000}k` : val} />
                  <RechartsTooltip 
                    cursor={{fill: '#f3f4f6'}}
                    formatter={(value: any) => {
                      const val = Number(value) || 0;
                      return [viewMode === 'gasto' ? `$${val.toLocaleString('es-CO')}` : val.toLocaleString('es-CO'), ''];
                    }}
                  />
                  <Legend iconType="circle" />
                  <Bar name="Energía" dataKey={viewMode === 'gasto' ? "energia_gasto" : "energia_consumo"} fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar name="Agua" dataKey={viewMode === 'gasto' ? "agua_gasto" : "agua_consumo"} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar name="Gas" dataKey={viewMode === 'gasto' ? "gas_gasto" : "gas_consumo"} fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-500" /> Cobertura Geográfica
            </CardTitle>
            <CardDescription>Sedes con facturación activa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 w-full h-[250px] rounded-lg border border-gray-200 overflow-hidden relative flex flex-col items-center justify-center">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              {!hasData && !isInitialLoading ? (
                 <div className="z-10 flex flex-col items-center justify-center text-center px-4">
                    <FileX2 className="h-10 w-10 text-gray-300 mb-2" />
                    <p className="text-gray-500 text-sm font-medium">Mapa inactivo</p>
                    <p className="text-gray-400 text-xs">Añade facturas con dirección para poblar el mapa.</p>
                 </div>
              ) : (
                <>
                  <MapPin className="h-10 w-10 text-blue-500 mb-2 z-10 animate-bounce" />
                  <p className="text-gray-500 text-sm z-10 font-medium">Módulo de Mapeo Satelital</p>
                  <p className="text-gray-400 text-xs z-10">(En desarrollo)</p>
                </>
              )}
            </div>
            <div className="mt-4 space-y-3">
              {isInitialLoading ? (
                 <p className="text-sm text-gray-500 text-center">Buscando sedes...</p>
              ) : sedes.length > 0 ? (
                sedes.slice(0,3).map((sede: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                    <span className="font-medium text-gray-700 truncate pr-2 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      {sede}
                    </span>
                    <span className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded">Activa</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center italic">No hay direcciones detectadas aún.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

    </section>
  );
}
