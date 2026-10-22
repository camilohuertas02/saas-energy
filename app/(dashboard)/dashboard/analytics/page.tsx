'use client';

import { useState, useMemo, useEffect } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, Download, MapPin, TrendingUp, Zap, AlertTriangle, 
  FileX2, Droplets, Flame, Leaf, Scale 
} from 'lucide-react';
import { 
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';

import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';

// LIBRERÍAS DE GENERACIÓN PDF EN FRONTEND
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

const MARKER_COLORS = ['bg-blue-700', 'bg-emerald-600', 'bg-violet-600', 'bg-amber-500', 'bg-rose-600', 'bg-cyan-700'];

export default function AnalyticsPage() {
  const [isDownloading, setIsDownloading] = useState(false);
  
  // ==========================================
  // ESTADOS DE FILTROS Y NAVEGACIÓN
  // ==========================================
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
  // MOTOR DE CÁLCULO Y FILTRADO
  // ==========================================
  const { kpis, chartData, sedesList, medidoresList, sedesData, alertas, moduloESG, hasData } = useMemo(() => {
    const facturasCrud = responseData?.data || [];
    
    const todasLasSedes = new Set<string>();
    const todosLosMedidores = new Set<string>();

    facturasCrud.forEach((f: any) => {
      const direccionCompleta = f.ciudad ? `${f.direccion_sede || 'Sede'}, ${f.ciudad}` : (f.direccion_sede || 'Sede');
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
      const direccionCompleta = f.ciudad ? `${f.direccion_sede || 'Sede'}, ${f.ciudad}` : (f.direccion_sede || 'Sede');
      if (filtroSede !== 'todas' && direccionCompleta !== filtroSede) return false;
      
      if (filtroTiempo !== 'historico') {
        const fDate = new Date(f.periodo_inicio || f.created_at);
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
    let energiaConsumo = 0, aguaConsumo = 0, gasConsumo = 0;
    
    const sedesUnicas = new Set<string>();
    const datosMensuales: Record<string, any> = {};
    const sedesFinanciero: Record<string, number> = {}; 
    const sedesAgua: Record<string, number> = {}; 
    const sedesEmisiones: Record<string, number> = {}; // NUEVO: Para el ranking ESG

    let alertaReactiva = false;
    let alertaSolidaridad = false;
    let alertaFuga = false;
    let mensajeFuga = "";

    facturasFiltradas.forEach((factura: any) => {
      const direccionCompleta = factura.ciudad ? `${factura.direccion_sede || 'Sede'}, ${factura.ciudad}` : (factura.direccion_sede || 'Sede');
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
      const gastoPonderado = (Number(factura.valor_total) || 0) * proporcionGasto;

      gastoTotal += gastoPonderado;
      
      if (!sedesFinanciero[direccionCompleta]) sedesFinanciero[direccionCompleta] = 0;
      sedesFinanciero[direccionCompleta] += gastoPonderado;

      const servicio = factura.tipo_servicio || 'energia';
      const mes = factura.periodo_inicio ? factura.periodo_inicio.substring(0, 7) : 'Desconocido';

      let co2Factura = 0;

      if (servicio === 'energia') {
        energiaConsumo += consumoTarget;
        co2Factura = (consumoTarget * 0.164) / 1000;
      }
      if (servicio === 'agua') {
        aguaConsumo += consumoTarget;
        co2Factura = (consumoTarget * 0.3) / 1000;
        if (!sedesAgua[direccionCompleta]) sedesAgua[direccionCompleta] = 0;
        sedesAgua[direccionCompleta] += consumoTarget;
      }
      if (servicio === 'gas') {
        gasConsumo += consumoTarget;
        co2Factura = (consumoTarget * 2.02) / 1000;
      }

      // Sumamos la emisión de esta factura a la sede correspondiente
      if (!sedesEmisiones[direccionCompleta]) sedesEmisiones[direccionCompleta] = 0;
      sedesEmisiones[direccionCompleta] += co2Factura;

      if (!datosMensuales[mes]) {
        datosMensuales[mes] = { name: mes, energia_gasto: 0, agua_gasto: 0, gas_gasto: 0, energia_consumo: 0, agua_consumo: 0, gas_consumo: 0 };
      }

      datosMensuales[mes][`${servicio}_gasto`] += gastoPonderado;
      datosMensuales[mes][`${servicio}_consumo`] += consumoTarget;

      if (proporcionGasto > 0) {
        const detalles = factura.detalles_adicionales || {};
        if (detalles.energia_reactiva || detalles.penalizacion) alertaReactiva = true;
        if (detalles.contribucion_solidaridad || detalles.recargo_estrato) alertaSolidaridad = true;
      }
    });

    const consumosAguaArray = Object.entries(sedesAgua);
    if (consumosAguaArray.length >= 2) {
      consumosAguaArray.sort((a, b) => b[1] - a[1]); 
      const [sedeMax, valorMax] = consumosAguaArray[0];
      const [sedeMin, valorMin] = consumosAguaArray[consumosAguaArray.length - 1];
      
      if (valorMin > 0 && (valorMax / valorMin) >= 3) {
        alertaFuga = true;
        mensajeFuga = `Anomalia detectada: La sede '${sedeMax}' consume ${(valorMax/valorMin).toFixed(1)}x veces mas agua que la sede '${sedeMin}'.`;
      }
    }

    const co2Energia = (energiaConsumo * 0.164) / 1000; 
    const co2Gas = (gasConsumo * 2.02) / 1000;
    const co2Agua = (aguaConsumo * 0.3) / 1000;
    const huellaTotal = co2Energia + co2Gas + co2Agua;

    return {
      hasData: facturasCrud.length > 0,
      kpis: { gastoTotal, energiaConsumo, aguaConsumo, gasConsumo, totalSedes: sedesUnicas.size },
      chartData: Object.values(datosMensuales).sort((a: any, b: any) => a.name.localeCompare(b.name)),
      sedesList: Array.from(todasLasSedes), 
      medidoresList: Array.from(todosLosMedidores),
      sedesData: sedesFinanciero, 
      alertas: { alertaReactiva, alertaSolidaridad, alertaFuga, mensajeFuga },
      moduloESG: { huellaTotal, co2Energia, co2Gas, co2Agua, sedesEmisiones } // Agregamos sedesEmisiones al estado
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
  // PDF 1: REPORTE FINANCIERO Y OPERATIVO
  // ==========================================
  const handleDownloadPDF = () => {
    try {
      setIsDownloading(true);
      const doc = new jsPDF();

      doc.setFontSize(20);
      doc.setTextColor(30, 58, 138); 
      doc.text("Reporte Analítico - Vectia Enterprise", 14, 22);

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
          ['Gasto Total', `$${kpis.gastoTotal.toLocaleString('es-CO')} COP`],
          ['Consumo Energia Electrica', `${kpis.energiaConsumo.toLocaleString('es-CO')} kWh`],
          ['Consumo Acueducto', `${kpis.aguaConsumo.toLocaleString('es-CO')} m3`],
          ['Consumo Gas Natural', `${kpis.gasConsumo.toLocaleString('es-CO')} m3`],
          ['Huella de Carbono (ESG)', `${moduloESG.huellaTotal.toLocaleString('es-CO', {maximumFractionDigits:2})} Ton CO2e`],
          ['Sedes Analizadas', `${kpis.totalSedes}`]
        ],
        theme: 'grid',
        headStyles: { fillColor: [30, 58, 138] }, 
      });

      let finalY = (doc as any).lastAutoTable.finalY + 15;

      if (alertas.alertaReactiva || alertas.alertaFuga || alertas.alertaSolidaridad) {
        doc.setFontSize(14);
        doc.setTextColor(17, 24, 39);
        doc.text("Alertas Inteligentes Detectadas", 14, finalY);
        finalY += 8;
        
        doc.setFontSize(10);
        doc.setTextColor(220, 38, 38); 

        if (alertas.alertaReactiva) {
          doc.text("- MULTA CREG 015: Se detectaron penalizaciones por Energia Reactiva.", 14, finalY);
          finalY += 6;
        }
        if (alertas.alertaFuga) {
          doc.text(`- FUGA DETECTADA: ${alertas.mensajeFuga}`, 14, finalY);
          finalY += 6;
        }
        if (alertas.alertaSolidaridad) {
          doc.text("- AUDITORIA LEGAL: Posibles cobros injustificados por Contribucion de Solidaridad.", 14, finalY);
          finalY += 6;
        }
      }

      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text("Generado de forma segura en el navegador por Vectia IA", 14, 285);

      doc.save(`Vectia_Reporte_${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (err) {
      console.error(err);
      alert("Hubo un error al generar el informe PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  // ==========================================
  // PDF 2: REPORTE ESG (SOSTENIBILIDAD Y HUELLA)
  // ==========================================
  const handleDescargarESG = () => {
    try {
      setIsDownloading(true);
      const doc = new jsPDF();

      const greenDark = [4, 120, 87]; 
      const greenLight = [16, 185, 129]; 
      const textDark = [17, 24, 39];

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
      doc.text(`Alcance geografico: ${filtroSede === 'todas' ? 'Nacional (Todas las sedes)' : filtroSede}`, 14, 44);

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

      const arboles = Math.round(moduloESG.huellaTotal * 45);
      const gasolina = Math.round(moduloESG.huellaTotal * 112);

      doc.setFontSize(14);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text("Impacto Ambiental Equivalente", 14, finalY);
      finalY += 8;

      doc.setFontSize(11);
      doc.setTextColor(80);
      doc.text(`Las emisiones generadas durante este periodo equivalen aproximadamente a:`, 14, finalY);
      finalY += 6;
      doc.text(`- El consumo directo de ${gasolina.toLocaleString('es-CO')} galones de gasolina.`, 14, finalY);
      finalY += 6;
      doc.text(`- El CO2 absorbido por ${arboles.toLocaleString('es-CO')} arboles maduros durante todo un año.`, 14, finalY);
      finalY += 15;

      // Ranking Ambiental (Por Emisiones)
      doc.setFontSize(14);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text("Top Sedes (Por Magnitud de Emisiones)", 14, finalY);

      // Usamos el nuevo objeto sedesEmisiones calculado en el useMemo
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
      const disclaimer = "METODOLOGIA Y FACTORES DE EMISION:\nCalculos alineados con los estandares internacionales del Protocolo de Gases de Efecto Invernadero (GHG Protocol).\n- Energia Electrica (Alcance 2): Factor de emision marginal del Sistema Interconectado Nacional (SIN) publicado oficialmente por la UPME (Unidad de Planeacion Minero Energetica de Colombia).\n- Gas Natural y Agua (Alcances 1 y 3): Calculos fundamentados en los promedios estandar provistos por la Agencia de Proteccion Ambiental (EPA) aplicados a los volumenes extraidos de la facturacion oficial del cliente.\n*Documento autogenerado para fines de auditoria y reporteria por Inteligencia Artificial Vectia.";
      
      doc.text(disclaimer, 14, 255, { maxWidth: 180 });

      doc.save(`Vectia_Reporte_ESG_${new Date().toISOString().split('T')[0]}.pdf`);

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

      {/* 2. SMART BANNERS */}
      <div className="space-y-3 mb-8">
        {alertas.alertaReactiva && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 shadow-sm animate-in fade-in">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-red-900">Alerta Crítica: Multa por Energía Reactiva (CREG 015)</h4>
              <p className="text-sm text-red-700 mt-1">Se detectaron cobros por energía reactiva en el periodo seleccionado. <b>Acción sugerida:</b> Evaluar calibración de motores o instalación de banco de condensadores para detener esta fuga de capital.</p>
            </div>
          </div>
        )}
        {alertas.alertaFuga && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3 shadow-sm animate-in fade-in">
            <Droplets className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-blue-900">Benchmarking Operativo: Posible Ineficiencia</h4>
              <p className="text-sm text-blue-700 mt-1">{alertas.mensajeFuga}</p>
            </div>
          </div>
        )}
        {alertas.alertaSolidaridad && (
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg flex items-start gap-3 shadow-sm animate-in fade-in">
            <Scale className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-purple-900">Auditoría Regulatoria: Cobros Injustificados</h4>
              <p className="text-sm text-purple-700 mt-1">Identificamos cobros por "Contribución de Solidaridad" (20% de recargo) en sedes que, por su actividad, podrían estar exentas. Sugerimos revisión legal con la electrificadora.</p>
            </div>
          </div>
        )}
      </div>

      {/* 3. TARJETAS DE KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-l-4 border-l-slate-800">
          <CardContent className="p-6">
            <div className="flex justify-between items-center space-y-0 pb-2">
              <p className="text-sm font-medium text-gray-500">Gasto Consolidado</p>
              <TrendingUp className="h-4 w-4 text-slate-800" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ${isInitialLoading ? "..." : kpis.gastoTotal.toLocaleString('es-CO')} <span className="text-sm font-normal text-gray-500">COP</span>
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

      {/* 4. NÚCLEO ANALÍTICO (Gráfica Compuesta y Mapa) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        <Card className="lg:col-span-2 overflow-hidden relative flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
              <div>
                <CardTitle>Comportamiento de Consumo</CardTitle>
                <CardDescription>Análisis aislado por tipo de suministro</CardDescription>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <div className="flex bg-gray-100 p-1 rounded-md">
                  <button onClick={() => setViewMode('gasto')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'gasto' ? 'bg-white shadow text-slate-800' : 'text-gray-500 hover:text-gray-900'}`}>
                    Financiero (COP)
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

        {/* MAPA AVANZADO */}
        <Card className="relative overflow-hidden flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-500" /> Cobertura y Gasto
            </CardTitle>
            <CardDescription>Ubicación de sedes operativas</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
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
                            <p className="text-gray-600">Gasto Exacto: <br/><span className="font-medium text-gray-900">${sedesData[sede].toLocaleString('es-CO', {maximumFractionDigits: 0})}</span></p>
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
            
            <div className="mt-4 space-y-3 overflow-y-auto max-h-[150px] pr-2">
              {isInitialLoading ? (
                 <p className="text-sm text-gray-500 text-center">Analizando ubicaciones...</p>
              ) : Object.keys(sedesData).length > 0 ? (
                Object.keys(sedesData).map((sede: string, idx: number) => {
                  const sedeIndex = sedesList.indexOf(sede);
                  const colorClass = MARKER_COLORS[sedeIndex % MARKER_COLORS.length];
                  
                  return (
                    <div key={idx} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                      <span className="font-medium text-gray-700 truncate pr-2 flex items-center gap-2" title={sede}>
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${colorClass}`}></div>
                        <span className="truncate max-w-[150px] sm:max-w-[200px]">{sede}</span>
                      </span>
                      <span className="text-gray-500 font-medium">${formatCompactNumber(sedesData[sede])}</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-400 text-center italic">Sin sedes en este periodo.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 5. MÓDULO ESG */}
      <Card className="bg-emerald-50 border-emerald-200 mb-8">
        <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Leaf className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-emerald-900">Módulo ESG: Sostenibilidad Corporativa</h3>
              <p className="text-sm text-emerald-700 mt-1 max-w-2xl leading-relaxed">
                De acuerdo con los factores de emisión oficiales, la operación en el periodo filtrado representa <b>{moduloESG.huellaTotal.toLocaleString('es-CO', {maximumFractionDigits:2})} Toneladas de CO2e</b> asociadas a consumos físicos (Energía: {moduloESG.co2Energia.toFixed(1)}t | Gas: {moduloESG.co2Gas.toFixed(1)}t | Agua Tratada: {moduloESG.co2Agua.toFixed(1)}t).
              </p>
            </div>
          </div>
          <Button 
            onClick={handleDescargarESG} 
            disabled={!hasFilteredData || isDownloading} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white flex-shrink-0 w-full sm:w-auto shadow-sm"
          >
            {isDownloading ? 'Procesando Documento...' : 'Descargar Reporte ESG'}
          </Button>
        </CardContent>
      </Card>

    </section>
  );
}
