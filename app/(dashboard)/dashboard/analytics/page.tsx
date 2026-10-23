'use client';

import { useState, useMemo, useEffect } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, Download, MapPin, TrendingUp, Zap, AlertTriangle, 
  FileX2, Droplets, Flame, Leaf, Scale, CheckCircle, ShieldCheck
} from 'lucide-react';
import { 
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';

import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const fetcherProxy = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Error al cargar los datos');
  }
  return res.json();
};

const formatCompactNumber = (number: number) => {
  return new Intl.NumberFormat('es-CO', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(number);
};

const formatCurrency = (number: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(number);
};

const MARKER_COLORS = ['bg-blue-700', 'bg-emerald-600', 'bg-violet-600', 'bg-amber-500', 'bg-rose-600', 'bg-cyan-700'];

export default function AnalyticsPage() {
  const [isDownloading, setIsDownloading] = useState(false);
  
  const [filtroTiempo, setFiltroTiempo] = useState<string>('historico');
  const [filtroSede, setFiltroSede] = useState<string>('todas');
  const [filtroMedidor, setFiltroMedidor] = useState<string>('todos'); 
  
  const [activeTab, setActiveTab] = useState<'energia' | 'agua' | 'gas'>('energia');
  const [viewMode, setViewMode] = useState<'consumo' | 'gasto'>('gasto');
  
  const [geoCoords, setGeoCoords] = useState<Record<string, {lat: number, lon: number}>>({});
  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  const { data: responseData, error, isLoading } = useSWR('/api/proxy/analytics', fetcherProxy);
  const isInitialLoading = isLoading && !error;

  useEffect(() => {
    setFiltroMedidor('todos');
  }, [filtroSede]);

  // ==========================================
  // MOTOR DE CÁLCULO FINANCIERO Y OPERATIVO
  // ==========================================
  const { kpis, chartData, sedesList, medidoresList, sedesData, rankingSedes, alertas, moduloESG, hasData } = useMemo(() => {
    const facturasCrud = responseData?.data || [];
    
    const cuentaToDireccion: Record<string, string> = {};
    facturasCrud.forEach((f: any) => {
      if (f.numero_cliente && !cuentaToDireccion[f.numero_cliente]) {
         cuentaToDireccion[f.numero_cliente] = f.ciudad ? `${f.direccion_sede || 'Sede'}, ${f.ciudad}` : (f.direccion_sede || 'Sede');
      }
    });

    const getDireccionUnificada = (f: any) => {
        if (f.numero_cliente && cuentaToDireccion[f.numero_cliente]) {
            return cuentaToDireccion[f.numero_cliente];
        }
        return f.ciudad ? `${f.direccion_sede || 'Sede'}, ${f.ciudad}` : (f.direccion_sede || 'Sede');
    };

    const todasLasSedes = new Set<string>();
    const todosLosMedidores = new Set<string>();

    facturasCrud.forEach((f: any) => {
      const direccionCompleta = getDireccionUnificada(f);
      todasLasSedes.add(direccionCompleta);
      
      if (filtroSede === 'todas' || direccionCompleta === filtroSede) {
        if (f.consumos_medidores) {
          f.consumos_medidores.forEach((m: any) => {
            if (m.numero_medidor) todosLosMedidores.add(m.numero_medidor);
          });
        }
      }
    });

    const facturasFiltradas = facturasCrud.filter((f: any) => {
      const direccionCompleta = getDireccionUnificada(f);
      if (filtroSede !== 'todas' && direccionCompleta !== filtroSede) return false;
      
      if (filtroTiempo !== 'historico') {
        const fDate = new Date(f.periodo_fin || f.created_at);
        const now = new Date();
        const diffDays = Math.ceil(Math.abs(now.getTime() - fDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (filtroTiempo === '1m' && diffDays > 30) return false;
        if (filtroTiempo === '3m' && diffDays > 90) return false;
        if (filtroTiempo === '6m' && diffDays > 180) return false;
        if (filtroTiempo === '1y' && diffDays > 365) return false;
      }

      if (filtroMedidor !== 'todos') {
        const tieneMedidor = f.consumos_medidores?.some((m: any) => m.numero_medidor === filtroMedidor);
        if (!tieneMedidor) return false;
      }

      return true;
    });

    let gastoTotal = 0;
    let gastoCoreTotal = 0;
    let gastoTercerosTotal = 0;
    let energiaConsumo = 0, aguaConsumo = 0, gasConsumo = 0;
    
    let costoReactivaAcumulado = 0;
    let costoSolidaridadAcumulado = 0;
    
    const sedesUnicas = new Set<string>();
    const datosMensuales: Record<string, any> = {};
    const sedesFinanciero: Record<string, number> = {}; 
    const sedesAguaDiario: Record<string, { totalConsumo: number, totalDias: number }> = {}; 
    const sedesEmisiones: Record<string, number> = {};

    facturasFiltradas.forEach((factura: any) => {
      const direccionCompleta = getDireccionUnificada(factura);
      sedesUnicas.add(direccionCompleta);

      let consumoTotalFactura = 0;
      let consumoTarget = 0;

      if (factura.consumos_medidores) {
        factura.consumos_medidores.forEach((medidor: any) => {
          const val = Number(medidor.consumo) || 0;
          consumoTotalFactura += val;
          if (filtroMedidor === 'todos' || medidor.numero_medidor === filtroMedidor) {
             consumoTarget += val;
          }
        });
      }

      const proporcionGasto = filtroMedidor === 'todos' ? 1 : (consumoTotalFactura > 0 ? (consumoTarget / consumoTotalFactura) : 0);
      
      const core = Number(factura.costo_servicio_core) || 0;
      const terceros = Number(factura.cargos_terceros) || 0;
      const totalF = Number(factura.valor_total) || 0;
      const diasFacturados = Number(factura.dias_facturados) || 30;

      const gastoPonderado = totalF * proporcionGasto;
      const corePonderado = core * proporcionGasto;
      
      gastoTotal += gastoPonderado;
      gastoCoreTotal += corePonderado;
      gastoTercerosTotal += (terceros * proporcionGasto);
      
      if (!sedesFinanciero[direccionCompleta]) sedesFinanciero[direccionCompleta] = 0;
      sedesFinanciero[direccionCompleta] += gastoPonderado;

      const servicio = factura.tipo_servicio || 'energia';
      const mes = factura.periodo_fin ? factura.periodo_fin.substring(0, 7) : 'Desconocido';

      let co2Factura = 0;

      if (servicio === 'energia') {
        energiaConsumo += consumoTarget;
        co2Factura = (consumoTarget * 0.164) / 1000;
      }
      if (servicio === 'agua') {
        aguaConsumo += consumoTarget;
        co2Factura = (consumoTarget * 0.3) / 1000;
        
        if (!sedesAguaDiario[direccionCompleta]) sedesAguaDiario[direccionCompleta] = { totalConsumo: 0, totalDias: 0 };
        sedesAguaDiario[direccionCompleta].totalConsumo += consumoTarget;
        sedesAguaDiario[direccionCompleta].totalDias += diasFacturados;
      }
      if (servicio === 'gas') {
        gasConsumo += consumoTarget;
        co2Factura = (consumoTarget * 2.02) / 1000;
      }

      if (!sedesEmisiones[direccionCompleta]) sedesEmisiones[direccionCompleta] = 0;
      sedesEmisiones[direccionCompleta] += co2Factura;

      if (!datosMensuales[mes]) {
        datosMensuales[mes] = { name: mes, energia_gasto: 0, agua_gasto: 0, gas_gasto: 0, energia_consumo: 0, agua_consumo: 0, gas_consumo: 0 };
      }

      datosMensuales[mes][`${servicio}_gasto`] += corePonderado;
      datosMensuales[mes][`${servicio}_consumo`] += consumoTarget;

      if (proporcionGasto > 0) {
        const detalles = factura.detalles_adicionales || {};
        costoReactivaAcumulado += (Number(detalles.costo_energia_reactiva_cop) || 0) * proporcionGasto;
        costoSolidaridadAcumulado += (Number(detalles.costo_contribucion_solidaridad_cop) || 0) * proporcionGasto;
      }
    });

    let alertaFuga = false;
    let mensajeFuga = "";
    
    const consumosDiariosAgua = Object.entries(sedesAguaDiario)
      .filter(([_, data]) => data.totalDias > 0)
      .map(([sede, data]) => ({ sede, promedioDiario: data.totalConsumo / data.totalDias }));

    if (consumosDiariosAgua.length >= 2) {
      consumosDiariosAgua.sort((a, b) => b.promedioDiario - a.promedioDiario); 
      const maxSede = consumosDiariosAgua[0];
      const minSede = consumosDiariosAgua[consumosDiariosAgua.length - 1];
      
      if (minSede.promedioDiario > 0 && (maxSede.promedioDiario / minSede.promedioDiario) >= 3) {
        alertaFuga = true;
        mensajeFuga = `'${maxSede.sede}' consume ${(maxSede.promedioDiario/minSede.promedioDiario).toFixed(1)}x más agua diaria que '${minSede.sede}'.`;
      }
    }

    const co2Energia = (energiaConsumo * 0.164) / 1000; 
    const co2Gas = (gasConsumo * 2.02) / 1000;
    const co2Agua = (aguaConsumo * 0.3) / 1000;
    const huellaTotal = co2Energia + co2Gas + co2Agua;

    const rankingSedes = Object.entries(sedesFinanciero)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      hasData: facturasCrud.length > 0,
      kpis: { gastoTotal, gastoCoreTotal, gastoTercerosTotal, energiaConsumo, aguaConsumo, gasConsumo, totalSedes: sedesUnicas.size },
      chartData: Object.values(datosMensuales).sort((a: any, b: any) => a.name.localeCompare(b.name)),
      sedesList: Array.from(todasLasSedes), 
      medidoresList: Array.from(todosLosMedidores),
      sedesData: sedesFinanciero, 
      rankingSedes,
      alertas: { costoReactivaAcumulado, costoSolidaridadAcumulado, alertaFuga, mensajeFuga },
      moduloESG: { huellaTotal, co2Energia, co2Gas, co2Agua, sedesEmisiones }
    };
  }, [responseData?.data, filtroSede, filtroTiempo, filtroMedidor]);

  const hasFilteredData = chartData.length > 0;

  // ==========================================
  // GEOCODIFICACIÓN GOOGLE MAPS
  // ==========================================
  const sedesActivasStr = Object.keys(sedesData).sort().join('|');

  useEffect(() => {
    if (!sedesActivasStr) return;

    const geocodeAddresses = async () => {
      const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
      const sedesArray = sedesActivasStr.split('|');
      let changed = false;
      const newCoords = { ...geoCoords };

      for (const sede of sedesArray) {
        if (newCoords[sede]) continue; 

        try {
          const query = encodeURIComponent(`${sede}, Colombia`);
          const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${googleApiKey}`;
          
          const res = await fetch(url);
          const data = await res.json();
          
          if (data.status === 'OK' && data.results.length > 0) {
            newCoords[sede] = {
              lat: data.results[0].geometry.location.lat,
              lon: data.results[0].geometry.location.lng
            };
            changed = true;
          }
        } catch (e) {
          console.error("Error contactando a Google API:", e);
        }
      }
      
      if (changed) {
        setGeoCoords(newCoords);
      }
    };

    geocodeAddresses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sedesActivasStr]);


  // ==========================================
  // EXPORTACIÓN PDF
  // ==========================================
  const handleDownloadPDF = () => {
    try {
      setIsDownloading(true);
      const doc = new jsPDF();

      doc.setFontSize(20);
      doc.setTextColor(30, 58, 138); 
      doc.text("Reporte Analítico - Vectia", 14, 22);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Fecha de generacion: ${new Date().toLocaleDateString('es-CO')}`, 14, 32);
      
      let filtroTextoTiempo = "Historico Completo";
      if(filtroTiempo === '1m') filtroTextoTiempo = "Ultimo mes";
      if(filtroTiempo === '3m') filtroTextoTiempo = "Ultimos 3 meses";
      if(filtroTiempo === '6m') filtroTextoTiempo = "Ultimos 6 meses";
      if(filtroTiempo === '1y') filtroTextoTiempo = "Ultimo año";

      doc.text(`Filtro Tiempo: ${filtroTextoTiempo}`, 14, 38);
      doc.text(`Filtro Sede: ${filtroSede === 'todas' ? 'Todas las sedes' : filtroSede}`, 14, 44);
      doc.text(`Filtro Contador: ${filtroMedidor === 'todos' ? 'Todos' : filtroMedidor}`, 14, 50);

      doc.setFontSize(14);
      doc.setTextColor(17, 24, 39);
      doc.text("Resumen Operativo y Financiero", 14, 65);

      autoTable(doc, {
        startY: 70,
        head: [['Metrica', 'Valor Consolidado']],
        body: [
          ['Gasto Total Facturado', formatCurrency(kpis.gastoTotal)],
          ['Costo Core (Neto Servicios)', formatCurrency(kpis.gastoCoreTotal)],
          ['Cargos a Terceros (Aseo/Otros)', formatCurrency(kpis.gastoTercerosTotal)],
          ['Consumo Energia Electrica', `${kpis.energiaConsumo.toLocaleString('es-CO')} kWh`],
          ['Consumo Acueducto', `${kpis.aguaConsumo.toLocaleString('es-CO')} m3`],
          ['Sedes Analizadas', `${kpis.totalSedes}`]
        ],
        theme: 'grid',
        headStyles: { fillColor: [30, 58, 138] as [number, number, number] }, 
      });

      let finalY = (doc as any).lastAutoTable.finalY + 15;

      doc.setFontSize(14);
      doc.setTextColor(17, 24, 39);
      doc.text("Analisis y Alertas Regulatorias", 14, finalY);
      finalY += 8;

      const bodyAlertas = [];
      if (alertas.costoReactivaAcumulado > 0) {
        bodyAlertas.push(['MULTA CREG 015 (Energia Reactiva)', formatCurrency(alertas.costoReactivaAcumulado)]);
      } else {
        bodyAlertas.push(['Energia Reactiva', 'Sin multas (Optimo)']);
      }

      if (alertas.costoSolidaridadAcumulado > 0) {
        bodyAlertas.push(['Contribucion de Solidaridad', formatCurrency(alertas.costoSolidaridadAcumulado)]);
      } else {
        bodyAlertas.push(['Contribucion de Solidaridad', 'Sin cobros atipicos']);
      }
      
      if (alertas.alertaFuga) {
        bodyAlertas.push(['Fuga/Ineficiencia Hidrica', alertas.mensajeFuga]);
      } else {
        bodyAlertas.push(['Eficiencia Hidrica', 'Sin anomalias detectadas']);
      }

      autoTable(doc, {
        startY: finalY,
        head: [['Concepto / Alerta', 'Impacto Detectado']],
        body: bodyAlertas,
        theme: 'striped',
        headStyles: { fillColor: [220, 38, 38] as [number, number, number] }, 
      });


      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text("Generado de forma segura en el navegador por Vectia IA", 14, 285);

      doc.save(`Vectia_Auditoria_${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (err) {
      console.error(err);
      alert("Hubo un error al generar el informe PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDescargarESG = () => {
    try {
      setIsDownloading(true);
      const doc = new jsPDF();
      const greenDark: [number, number, number] = [4, 120, 87]; 
      const greenLight: [number, number, number] = [16, 185, 129]; 
      const textDark: [number, number, number] = [17, 24, 39];

      doc.setFontSize(20);
      doc.setTextColor(greenDark[0], greenDark[1], greenDark[2]);
      doc.text("Reporte ESG: Huella de Carbono Corporativa", 14, 22);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Fecha de emision: ${new Date().toLocaleDateString('es-CO')}`, 14, 32);

      let filtroTextoTiempo = "Historico Completo";
      if(filtroTiempo === '1m') filtroTextoTiempo = "Ultimo mes";
      if(filtroTiempo === '3m') filtroTextoTiempo = "Ultimos 3 meses";
      if(filtroTiempo === '6m') filtroTextoTiempo = "Ultimos 6 meses";
      if(filtroTiempo === '1y') filtroTextoTiempo = "Ultimo año";

      doc.text(`Periodo analizado: ${filtroTextoTiempo}`, 14, 38);
      
      doc.setFontSize(14);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text("Resumen de Emisiones Globales", 14, 58);

      doc.setFontSize(12);
      doc.setTextColor(greenDark[0], greenDark[1], greenDark[2]);
      doc.text(`Total Huella de Carbono: ${moduloESG.huellaTotal.toLocaleString('es-CO', {maximumFractionDigits:2})} Toneladas de CO2e`, 14, 66);

      autoTable(doc, {
        startY: 72,
        head: [['Suministro (Fuente)', 'Alcance (GHG Protocol)', 'Consumo Fisico', 'Emisiones (Ton CO2e)']],
        body: [
          ['Energia Electrica', 'Alcance 2 (Indirecto)', `${kpis.energiaConsumo.toLocaleString('es-CO')} kWh`, moduloESG.co2Energia.toFixed(2)],
          ['Gas Natural', 'Alcance 1 (Directo)', `${kpis.gasConsumo.toLocaleString('es-CO')} m3`, moduloESG.co2Gas.toFixed(2)],
          ['Acueducto / Saneamiento', 'Alcance 3 (Cadena valor)', `${kpis.aguaConsumo.toLocaleString('es-CO')} m3`, moduloESG.co2Agua.toFixed(2)]
        ],
        theme: 'grid',
        headStyles: { fillColor: greenDark },
      });

      let finalY = (doc as any).lastAutoTable.finalY + 15;
      
      doc.setFontSize(14);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text("Top Sedes (Por Magnitud de Emisiones)", 14, finalY);

      const sedesArray = Object.entries(moduloESG.sedesEmisiones).sort((a, b) => b[1] - a[1]).slice(0, 5); 
      const bodySedes = sedesArray.map(([sede, emisiones], idx) => [
        `${idx + 1}`, sede, `${emisiones.toLocaleString('es-CO', {maximumFractionDigits: 2})} Ton CO2e`
      ]);

      autoTable(doc, {
        startY: finalY + 6,
        head: [['Nivel', 'Instalacion', 'Emisiones (Ton CO2e)']],
        body: bodySedes,
        theme: 'grid',
        headStyles: { fillColor: greenLight },
      });

      doc.setFontSize(8);
      doc.setTextColor(120);
      const disclaimer = "METODOLOGIA Y FACTORES DE EMISION:\nCalculos alineados con los estandares internacionales del Protocolo de Gases de Efecto Invernadero (GHG Protocol).\n- Energia Electrica (Alcance 2): Factor de emision marginal del Sistema Interconectado Nacional (SIN) publicado oficialmente por la UPME (Unidad de Planeacion Minero Energetica de Colombia).\n- Gas Natural y Agua (Alcances 1 y 3): Calculos fundamentados en los promedios estandar provistos por la Agencia de Proteccion Ambiental (EPA) aplicados a los volumenes extraidos de la facturacion oficial del cliente.\n*Documento autogenerado para fines de auditoria y reporteria por Vectia IA.";
      
      doc.text(disclaimer, 14, 255, { maxWidth: 180 });


      doc.save(`Vectia_ESG_${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (err) {
      console.error(err);
      alert("Hubo un error al generar el informe ESG.");
    } finally {
      setIsDownloading(false);
    }
  };

  const primerSedeEncontrada = Object.keys(sedesData).find(s => geoCoords[s]);
  const defaultCenter = primerSedeEncontrada 
    ? { lat: geoCoords[primerSedeEncontrada].lat, lng: geoCoords[primerSedeEncontrada].lon } 
    : { lat: 4.6097, lng: -74.0817 }; 

  const getChartConfig = () => {
    const dataKey = `${activeTab}_${viewMode === 'gasto' ? 'gasto' : 'consumo'}`;
    const name = activeTab === 'energia' ? 'Energía Eléctrica' : activeTab === 'agua' ? 'Acueducto' : 'Gas Natural';
    const color = activeTab === 'energia' ? '#f59e0b' : activeTab === 'agua' ? '#3b82f6' : '#a855f7';
    return { dataKey, name, color };
  };
  const { dataKey, name, color } = getChartConfig();

  return (
    <section className="flex-1 p-4 lg:p-8 bg-gray-50/30 min-h-screen">
      
      {/* 1. HEADER Y FILTROS GLOBALES */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Enterprise Dashboard</h1>
          <p className="text-sm text-gray-500">Inteligencia operativa y financiera de tus instalaciones</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-lg border shadow-sm w-full lg:w-auto">
          <select 
            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none cursor-pointer"
            value={filtroTiempo}
            onChange={(e) => setFiltroTiempo(e.target.value)}
          >
            <option value="historico">Histórico Completo</option>
            <option value="1m">Último mes</option>
            <option value="3m">Últimos 3 meses</option>
            <option value="6m">Últimos 6 meses</option>
            <option value="1y">Último año</option>
          </select>

          <select 
            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none max-w-[150px] truncate cursor-pointer"
            value={filtroSede}
            onChange={(e) => setFiltroSede(e.target.value)}
          >
            <option value="todas">Todas las sedes</option>
            {sedesList.map((sede, idx) => (
              <option key={idx} value={sede}>{sede}</option>
            ))}
          </select>

          <select 
            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none max-w-[150px] truncate cursor-pointer"
            value={filtroMedidor}
            onChange={(e) => setFiltroMedidor(e.target.value)}
          >
            <option value="todos">Todos los contadores</option>
            {medidoresList.map((med, idx) => (
              <option key={idx} value={med}>{med}</option>
            ))}
          </select>

          <div className="h-6 w-px bg-gray-200 mx-1 hidden xl:block"></div>
          
          <Button 
            onClick={handleDownloadPDF} 
            disabled={isDownloading || !hasFilteredData} 
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

      {/* 2. TARJETAS DE KPIs (Se muestran arriba del todo para lectura inmediata) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-l-4 border-l-slate-800">
          <CardContent className="p-5">
            <div className="flex justify-between items-center space-y-0 pb-2">
              <p className="text-sm font-medium text-gray-500">Gasto Total Facturado</p>
              <TrendingUp className="h-4 w-4 text-slate-800" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {isInitialLoading ? "..." : formatCurrency(kpis.gastoTotal)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Servicios: {formatCurrency(kpis.gastoCoreTotal)} | Terceros: {formatCurrency(kpis.gastoTercerosTotal)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-center space-y-0 pb-2">
              <p className="text-sm font-medium text-gray-500">Consumo Energía</p>
              <Zap className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {isInitialLoading ? "..." : kpis.energiaConsumo.toLocaleString('es-CO')} <span className="text-sm font-normal text-gray-500">kWh</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-center space-y-0 pb-2">
              <p className="text-sm font-medium text-gray-500">Consumo Agua</p>
              <Droplets className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {isInitialLoading ? "..." : kpis.aguaConsumo.toLocaleString('es-CO')} <span className="text-sm font-normal text-gray-500">m³</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-center space-y-0 pb-2">
              <p className="text-sm font-medium text-gray-500">Consumo Gas</p>
              <Flame className="h-4 w-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {isInitialLoading ? "..." : kpis.gasConsumo.toLocaleString('es-CO')} <span className="text-sm font-normal text-gray-500">m³</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. NÚCLEO ANALÍTICO (Gráficas y Mapas) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">
        <Card className="xl:col-span-2 overflow-hidden relative flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle>Eficiencia Operativa</CardTitle>
                <CardDescription>Costo neto del servicio (sin aseo/terceros) vs. Consumo Físico</CardDescription>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <div className="flex bg-gray-100 p-1 rounded-md">
                  <button onClick={() => setViewMode('gasto')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'gasto' ? 'bg-white shadow text-slate-800' : 'text-gray-500 hover:text-gray-900'}`}>
                    Costo Neto (COP)
                  </button>
                  <button onClick={() => setViewMode('consumo')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'consumo' ? 'bg-white shadow text-slate-800' : 'text-gray-500 hover:text-gray-900'}`}>
                    Físico (Unidades)
                  </button>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-md">
                  <button onClick={() => setActiveTab('energia')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'energia' ? 'bg-white shadow text-amber-600' : 'text-gray-500 hover:text-gray-900'}`}>
                    Energía
                  </button>
                  <button onClick={() => setActiveTab('agua')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'agua' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}>
                    Agua
                  </button>
                  <button onClick={() => setActiveTab('gas')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'gas' ? 'bg-white shadow text-purple-600' : 'text-gray-500 hover:text-gray-900'}`}>
                    Gas
                  </button>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 min-h-[350px] relative mt-4">
            {(!hasFilteredData && !isInitialLoading) && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px] rounded-b-lg">
                <BarChart3 className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-700 font-medium text-lg">No hay datos en este periodo</p>
                <p className="text-gray-500 text-sm mt-1">Ajusta los filtros o sube nuevas facturas</p>
              </div>
            )}

            {isInitialLoading ? (
               <div className="w-full h-full flex items-center justify-center text-gray-400">Cargando métricas...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={hasFilteredData ? chartData : [{name: 'Sin datos'}]} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#6b7280', fontSize: 12}} 
                    tickFormatter={(val) => viewMode === 'gasto' && val >= 1000 ? `$${val/1000}k` : val} 
                  />
                  
                  <RechartsTooltip 
                    cursor={{fill: '#f3f4f6'}}
                    formatter={(value: any) => {
                      const val = Number(value) || 0;
                      const unit = viewMode === 'gasto' ? 'COP' : (activeTab === 'energia' ? 'kWh' : 'm³');
                      const prefix = viewMode === 'gasto' ? '$' : '';
                      return [`${prefix}${val.toLocaleString('es-CO', {maximumFractionDigits: 2})} ${unit}`, name];
                    }}
                  />
                  
                  <Bar dataKey={dataKey} fill={color} fillOpacity={0.7} radius={[4, 4, 0, 0]} barSize={50} />
                  <Line 
                    type="monotone" 
                    dataKey={dataKey} 
                    stroke={color} 
                    strokeWidth={3} 
                    dot={{ r: 5, fill: color, stroke: '#fff', strokeWidth: 2 }} 
                    activeDot={{ r: 7 }} 
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="relative overflow-hidden flex flex-col h-full min-h-[350px]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-gray-500" /> Cobertura Geoespacial
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0 px-6 pb-6">
              <div className="bg-gray-100 w-full h-[250px] rounded-lg border border-gray-200 overflow-hidden relative flex flex-col items-center justify-center flex-shrink-0">
                {!hasFilteredData && !isInitialLoading ? (
                   <div className="z-10 flex flex-col items-center justify-center text-center px-4 relative h-full w-full">
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                      <FileX2 className="h-10 w-10 text-gray-300 mb-2 z-10" />
                      <p className="text-gray-500 text-sm font-medium z-10">Mapa inactivo</p>
                   </div>
                ) : Object.keys(geoCoords).length > 0 ? (
                  <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
                    <Map 
                      mapId="VECTIA_DASHBOARD_MAP" 
                      defaultCenter={defaultCenter} 
                      defaultZoom={12} 
                      gestureHandling={'greedy'}
                      disableDefaultUI={true}
                      zoomControl={true}
                      style={{ width: "100%", height: "100%" }}
                    >
                      {Object.keys(sedesData).map((sede, idx) => {
                        const coords = geoCoords[sede];
                        if (!coords) return null; 

                        const sedeIndex = sedesList.indexOf(sede);
                        const colorClass = MARKER_COLORS[sedeIndex % MARKER_COLORS.length];
                        const totalGastoSede = sedesData[sede];

                        return (
                          <AdvancedMarker key={idx} position={{ lat: coords.lat, lng: coords.lon }} onClick={() => setActiveMarker(sede)}>
                            <div className={`${colorClass} text-white font-bold text-xs px-3 py-1.5 rounded-full shadow-lg border-2 border-white flex items-center justify-center transform transition-transform hover:scale-110 cursor-pointer`}>
                              ${formatCompactNumber(totalGastoSede)}
                            </div>
                          </AdvancedMarker>
                        );
                      })}

                      {Object.keys(sedesData).map((sede, idx) => {
                        const coords = geoCoords[sede];
                        if (!coords) return null;

                        return activeMarker === sede && (
                          <InfoWindow key={`info-${idx}`} position={{ lat: coords.lat, lng: coords.lon }} onCloseClick={() => setActiveMarker(null)}>
                            <div className="p-1 text-sm min-w-[120px]">
                              <p className="font-bold border-b pb-1 mb-1 text-gray-900">{sede}</p>
                              <p className="text-gray-600">Gasto Exacto: <br/><span className="font-medium text-gray-900">{formatCurrency(sedesData[sede])}</span></p>
                            </div>
                          </InfoWindow>
                        )
                      })}
                    </Map>
                  </APIProvider>
                ) : (
                  <div className="z-10 flex flex-col items-center justify-center text-center px-4">
                    <MapPin className="h-10 w-10 text-blue-500 mb-2 animate-bounce" />
                    <p className="text-gray-500 text-sm font-medium">Renderizando mapa...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Las 5 sedes de mayor gasto total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 rounded-l-lg">Sede</th>
                      <th className="px-4 py-2 rounded-r-lg text-right">Gasto COP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isInitialLoading ? (
                      <tr><td colSpan={2} className="text-center py-4 text-gray-400">Calculando...</td></tr>
                    ) : rankingSedes.length > 0 ? (
                      rankingSedes.map(([sede, gasto], idx) => (
                        <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900 truncate max-w-[150px]" title={sede}>{sede}</td>
                          <td className="px-4 py-3 text-right text-gray-600 font-semibold">{formatCurrency(gasto)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={2} className="text-center py-4 text-gray-400 italic">Sin datos registrados</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 4. PANEL DE AUDITORÍA (Nuevo Grid 3 Columnas) */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-gray-600" /> Auditoría Regulatoria y Operativa
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card: Energía Reactiva */}
          <Card className={`border-t-4 shadow-sm ${alertas.costoReactivaAcumulado > 0 ? 'border-t-red-500 bg-red-50/20' : 'border-t-emerald-500 bg-emerald-50/20'}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {alertas.costoReactivaAcumulado > 0 ? (
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <ShieldCheck className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className={`text-sm font-bold ${alertas.costoReactivaAcumulado > 0 ? 'text-red-900' : 'text-emerald-900'}`}>
                    {alertas.costoReactivaAcumulado > 0 ? 'Multa CREG 015 Detectada' : 'Óptimo: Cero Multas CREG 015'}
                  </h4>
                  <p className={`text-xs mt-1 leading-relaxed ${alertas.costoReactivaAcumulado > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                    {alertas.costoReactivaAcumulado > 0 
                      ? <>Estás perdiendo <b>{formatCurrency(alertas.costoReactivaAcumulado)}</b> por ineficiencias electromecánicas. Revisa tus bancos de condensadores.</>
                      : 'Las sedes están operando con un factor de potencia normal. Sin fugas de capital.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card: Fugas / Benchmarking */}
          <Card className={`border-t-4 shadow-sm ${alertas.alertaFuga ? 'border-t-blue-500 bg-blue-50/20' : 'border-t-emerald-500 bg-emerald-50/20'}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {alertas.alertaFuga ? (
                  <Droplets className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className={`text-sm font-bold ${alertas.alertaFuga ? 'text-blue-900' : 'text-emerald-900'}`}>
                    {alertas.alertaFuga ? 'Anomalía Hídrica Detectada' : 'Eficiencia Hídrica Normal'}
                  </h4>
                  <p className={`text-xs mt-1 leading-relaxed ${alertas.alertaFuga ? 'text-blue-700' : 'text-emerald-700'}`}>
                    {alertas.alertaFuga 
                      ? <>{alertas.mensajeFuga}</>
                      : 'Al comparar el consumo diario normalizado, no se detectaron variaciones atípicas entre sedes.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card: Contribución de Solidaridad */}
          <Card className={`border-t-4 shadow-sm ${alertas.costoSolidaridadAcumulado > 0 ? 'border-t-purple-500 bg-purple-50/20' : 'border-t-emerald-500 bg-emerald-50/20'}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {alertas.costoSolidaridadAcumulado > 0 ? (
                  <Scale className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className={`text-sm font-bold ${alertas.costoSolidaridadAcumulado > 0 ? 'text-purple-900' : 'text-emerald-900'}`}>
                    {alertas.costoSolidaridadAcumulado > 0 ? 'Cobro de Solidaridad' : 'Sin Cobros Atípicos'}
                  </h4>
                  <p className={`text-xs mt-1 leading-relaxed ${alertas.costoSolidaridadAcumulado > 0 ? 'text-purple-700' : 'text-emerald-700'}`}>
                    {alertas.costoSolidaridadAcumulado > 0 
                      ? <>Se identificó un recargo por <b>{formatCurrency(alertas.costoSolidaridadAcumulado)}</b>. Sugerimos revisar exenciones aplicables por actividad económica.</>
                      : 'No se identificaron recargos por contribución de solidaridad en la facturación analizada.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* 5. MÓDULO ESG REDISEÑADO (Sleek Bar) */}
      <Card className="bg-white border-emerald-200 shadow-sm mb-8">
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full">
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Leaf className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900">Módulo ESG: Sostenibilidad Corporativa</h3>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Activo</span>
              </div>
              <p className="text-sm text-gray-600 mt-0.5 line-clamp-2 md:line-clamp-none">
                Huella consolidada: <b className="text-emerald-700">{moduloESG.huellaTotal.toLocaleString('es-CO', {maximumFractionDigits:2})} Ton CO2e</b> (Energía: {moduloESG.co2Energia.toFixed(1)}t | Gas: {moduloESG.co2Gas.toFixed(1)}t | Agua: {moduloESG.co2Agua.toFixed(1)}t).
              </p>
            </div>
          </div>
          
          <Button 
            onClick={handleDescargarESG} 
            disabled={!hasFilteredData || isDownloading} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white w-full md:w-auto shadow-sm flex-shrink-0 h-10"
          >
            {isDownloading ? 'Generando...' : 'Descargar Reporte ESG'}
          </Button>
        </CardContent>
      </Card>

    </section>
  );
}
