import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { 
  AlertTriangle, Droplets, History, Leaf, 
  FileText, Map, ShieldCheck, ChevronRight, BarChart3, Lock
} from 'lucide-react';

import uploadImg from './img/upload-3.png';
import dashboardImg from './img/dashboard-5.png';

export default function HomePage() {
  return (
    <main className="bg-slate-50 flex flex-col min-h-screen font-sans">
      
      {/* 1. HERO SECTION (Más corporativo y estructurado) */}
      <section className="pt-24 pb-16 lg:pt-32 lg:pb-24 bg-white flex flex-col items-center text-center relative border-b border-slate-200">
        {/* Patrón de fondo estilo cuadrícula corporativa sutil */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-200 mb-8">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2"></span>
           Gestión Energética Inteligente
          </div>
          
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl md:text-6xl leading-tight max-w-4xl mx-auto">
            Detén la fuga de capital en los <span className="text-blue-600">servicios públicos</span> de tus sedes
          </h1>
          
          <p className="mt-6 text-lg text-slate-600 sm:text-xl max-w-3xl mx-auto leading-relaxed">
            Vectia IA analiza tus facturas, detecta sobrecostos por energía reactiva, identifica ineficiencias y consolida tus reportes ESG. Todo en un centro de comando centralizado.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/contact">
              <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-8 h-12 text-base font-medium shadow-sm transition-all">
                Agendar demostración
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-lg px-8 h-12 text-base border-slate-300 text-slate-700 hover:bg-slate-50 font-medium">
                Conocer más
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. KILLER FEATURES (La necesidad y la solución) */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Transforma el gasto operativo en ahorros cuantificables</h2>
            <p className="mt-4 text-lg text-slate-600 max-w-3xl mx-auto">
              Las empresas colombianas pierden hasta un 15% de su presupuesto anual en penalizaciones y fugas no detectadas. Vectia IA monitorea y protege tus recursos continuamente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Feature 1: Análisis Histórico (NUEVO - Retorno Inmediato) */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 mb-6">
                <History className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Análisis Histórico (Retorno Inmediato)</h3>
              <p className="text-slate-600">
                No empiezas desde cero. Procesamos el histórico de tus últimos 6 meses en el primer día de implementación para detectar cobros retroactivos mal aplicados, variaciones atípicas o fugas pasadas que tu equipo no notó.
              </p>
            </div>

            {/* Feature 2: Penalización Reactiva */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 mb-6">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Alerta CREG 015 (Energía Reactiva)</h3>
              <p className="text-slate-600 mb-4">
                Si tus motores o maquinaria están mal calibrados, el operador te cobrará multas progresivas. Nuestra plataforma lee este dato específico y lanza alertas críticas antes de que la penalización afecte tu flujo de caja.
              </p>
              <div className="text-sm font-medium text-amber-800 bg-amber-50/50 p-3 rounded-md border border-amber-100">
                💡 Sugerencia: "Instalación de banco de condensadores requerida en Sede Norte."
              </div>
            </div>

            {/* Feature 3: Detección de Fugas */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600 mb-6">
                <Droplets className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Benchmarking y Detección de Fugas</h3>
              <p className="text-slate-600">
                Cruzamos las variables de todas tus sedes de forma inteligente. Si dos instalaciones tienen el mismo tamaño operativo, pero una gasta un 40% más de agua, el sistema alertará sobre una posible ineficiencia invisible.
              </p>
            </div>

            {/* Feature 4: Módulo ESG */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 mb-6">
                <Leaf className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Módulo ESG (Huella de Carbono)</h3>
              <p className="text-slate-600">
                Transformamos automáticamente tus kWh de luz, m³ de gas y agua en Toneladas de CO2 equivalentes. Genera tu Reporte de Sostenibilidad Corporativa anual con un solo clic, listo para la junta directiva.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MÚSCULO TECNOLÓGICO */}
      <section className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
          
          {/* Bloque 1: Extracción IA */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center text-blue-600 font-semibold mb-4 text-sm uppercase tracking-wider">
                <FileText className="mr-2 h-4 w-4" /> Procesamiento Inteligente
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Olvídate de la digitación manual.</h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Sube tus recibos crudos en formato PDF. Nuestro motor impulsado por modelos fundacionales lee las tablas, unifica proveedores distintos y extrae los datos clave con precisión, ignorando el ruido publicitario del documento.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center text-slate-700 font-medium"><ChevronRight className="h-5 w-5 text-blue-600 mr-2"/> Extracción de histórico de consumo</li>
                <li className="flex items-center text-slate-700 font-medium"><ChevronRight className="h-5 w-5 text-blue-600 mr-2"/> Separación de múltiples medidores</li>
                <li className="flex items-center text-slate-700 font-medium"><ChevronRight className="h-5 w-5 text-blue-600 mr-2"/> Consolidación financiera en COP</li>
              </ul>
            </div>
            
            <div className="w-full relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200/60 bg-slate-50">
              {/* Se usará la imagen upload.png */}
              <Image
                  src={uploadImg}
                  alt="Procesamiento de facturas Vectia IA"
                  className="w-full h-auto object-cover"
                  placeholder="blur"
                />
            </div>
          </div>

          {/* Bloque 2: Dashboard Empresarial */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="w-full relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200/60 bg-slate-50 order-2 lg:order-1">
              {/* Se usará la imagen dashboard.png */}  
              <Image
                  src={dashboardImg}
                  alt="Procesamiento de facturas Vectia IA"
                  className="w-full h-auto object-cover"
                  placeholder="blur"
                />
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center text-blue-600 font-semibold mb-4 text-sm uppercase tracking-wider">
                <BarChart3 className="mr-2 h-4 w-4" /> Centro de Comando
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Tu operación consolidada en un panel financiero vivo.</h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Impulsado por modelos analíticos y motores cartográficos, Vectia IA extrae y unifica los datos en un dashboard interactivo. Visualiza en tiempo real los KPIs de costo total, consumo de energía, agua y gas.
              </p>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Monitorea la eficiencia operativa de cientos de sucursales, identifica al instante el top 5 de sedes con mayor gasto y apóyate en el panel de control regulatorio para asegurar la ausencia de cobros atípicos.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 4. INDUSTRIAS / CASOS DE USO / SEGURIDAD */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-10">Diseñado para infraestructuras exigentes</h2>
              <ul className="space-y-10">
                <li className="flex gap-4">
                  <div className="mt-1 bg-white p-2 rounded-lg shadow-sm border border-slate-200">
                    <ShieldCheck className="h-6 w-6 text-blue-600 flex-shrink-0" />
                  </div>
                  <div>
                    <strong className="text-slate-900 text-lg">Industria y Manufactura</strong>
                    <p className="text-slate-600 mt-1">Seguimiento estricto de KPIs de rendimiento energético.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="mt-1 bg-white p-2 rounded-lg shadow-sm border border-slate-200">
                    <ShieldCheck className="h-6 w-6 text-blue-600 flex-shrink-0" />
                  </div>
                  <div>
                    <strong className="text-slate-900 text-lg">Educación, Campus y Retail</strong>
                    <p className="text-slate-600 mt-1">Unificación de información en grandes instalaciones multi-sede.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="mt-1 bg-white p-2 rounded-lg shadow-sm border border-slate-200">
                    <ShieldCheck className="h-6 w-6 text-blue-600 flex-shrink-0" />
                  </div>
                  <div>
                    <strong className="text-slate-900 text-lg">Hospitales y Entidades Públicas</strong>
                    <p className="text-slate-600 mt-1">Gestión rigurosa para optimización del presupuesto operativo.</p>
                  </div>
                </li>
              </ul>
            </div>
            
            {/* Tarjeta de Seguridad Reforzada */}
            <div className="mt-12 lg:mt-0 bg-slate-900 p-10 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
               {/* Decoración sutil de fondo */}
               <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 blur-3xl rounded-full"></div>
               
               <div className="flex items-center mb-6">
                 <Lock className="h-6 w-6 text-blue-400 mr-3" />
                 <h3 className="text-2xl font-bold text-white">Seguridad y Privacidad (Crucial para B2B)</h3>
               </div>
               
               <p className="text-slate-300 mb-6 leading-relaxed text-sm">
                 Entendemos que la información de facturación de su empresa es estrictamente confidencial. Por ello, Vectia IA opera bajo una arquitectura de grado empresarial:
               </p>
               
               <ul className="space-y-4 mb-8">
                 <li className="flex items-start text-sm text-slate-300">
                   <ChevronRight className="h-4 w-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0"/>
                   <span>Toda la información se almacena con <strong className="text-white font-medium">encriptación AES-256</strong> (estándar bancario).</span>
                 </li>
                 <li className="flex items-start text-sm text-slate-300">
                   <ChevronRight className="h-4 w-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0"/>
                   <span>Sus recibos y datos de consumo <strong className="text-white font-medium">NUNCA son utilizados</strong> para entrenar modelos públicos de IA.</span>
                 </li>
                 <li className="flex items-start text-sm text-slate-300">
                   <ChevronRight className="h-4 w-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0"/>
                   <span>Aislamiento total de bases de datos por cliente.</span>
                 </li>
               </ul>

               <Link href="/contact">
                 <Button className="w-full h-12 text-base bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors">
                    Agendar demostración
                 </Button>
               </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER CORPORATIVO */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            
            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Tecnología</h4>
              <ul className="space-y-3">
                <li><Link href="/" className="text-sm text-slate-500 hover:text-blue-600 font-medium">Vectia IA</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Empresa</h4>
              <ul className="space-y-3">
                <li><Link href="#" className="text-sm text-slate-500 hover:text-blue-600 font-medium">Sobre nosotros</Link></li>
                <li><Link href="#" className="text-sm text-slate-500 hover:text-blue-600 font-medium">Casos de éxito</Link></li>
                <li><Link href="/contact" className="text-sm text-slate-500 hover:text-blue-600 font-medium">Contacto</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">A quién servimos</h4>
              <ul className="space-y-3">
                <li><span className="text-sm text-slate-500 font-medium">Sector Industrial</span></li>
                <li><span className="text-sm text-slate-500 font-medium">Universidades</span></li>
                <li><span className="text-sm text-slate-500 font-medium">Retail & Comercio</span></li>
                <li><span className="text-sm text-slate-500 font-medium">Salud & Hospitales</span></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-2">Recibe actualizaciones</h4>
              <p className="text-sm text-slate-500 mb-4">Mantente al tanto de las novedades de Vectia IA.</p>
              <form className="flex flex-col gap-3">
                <input 
                  type="email" 
                  placeholder="Correo corporativo" 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  required
                />
                <Button type="button" variant="outline" className="w-fit px-6 rounded-lg text-slate-700 border-slate-300">
                  Suscribirse
                </Button>
              </form>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-400">
              © 2026 Vectia S.A.S. Todos los derechos reservados.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-sm text-slate-400 hover:text-slate-900 transition-colors">Política de Privacidad</Link>
              <Link href="#" className="text-sm text-slate-400 hover:text-slate-900 transition-colors">Términos de Servicio</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
