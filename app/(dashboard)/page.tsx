import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart3, Cpu, FileSearch, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="bg-gray-50 flex flex-col min-h-screen">
      {/* Contenido principal (crece para empujar el footer al final si la pantalla es muy alta) */}
      <div className="flex-grow">
        {/* Hero Section - Una sola columna centrada */}
        <section className="py-24 lg:py-32 bg-white flex flex-col items-center text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold text-blue-800 bg-blue-50 border border-blue-100 mb-8">
              Vectia IA - Inteligencia Artificial Corporativa
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl md:text-6xl leading-tight">
              Automatiza tu gestión de <span className="text-blue-600">servicios públicos</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 sm:text-xl max-w-2xl mx-auto">
              Vectia IA procesa, unifica y analiza tus facturas automáticamente. Detecta ineficiencias, reduce costos operativos y potencia tu infraestructura con nuestra extensión de monitoreo IoT.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 h-12 text-base">
                Agendar Demo
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base border-gray-300 text-gray-700 hover:bg-gray-50">
                Conoce Vectia IA
                <ArrowRight className="ml-2 h-5 w-5 text-blue-600" />
              </Button>
            </div>
          </div>
        </section>

        {/* Servicios / Características */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900">Una plataforma, control total de tus recursos</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Analítica documental mediante Inteligencia Artificial con capacidad de expansión a telemetría en tiempo real.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1: El Core (Software) */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6">
                  <FileSearch className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Vectia IA Core</h3>
                <p className="text-gray-600">
                  Automatiza la extracción de datos de tus recibos y PDFs. Centraliza tu información financiera y detecta sobrecostos o anomalías de facturación sin intervención manual.
                </p>
              </div>

              {/* Feature 2: La Extensión (Hardware) */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6">
                  <Cpu className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Extensión IoT en sitio</h3>
                <p className="text-gray-600">
                  Complementa tu análisis integrando sensores de electricidad, agua y calidad del aire. Monitoreo predictivo en tiempo real y alertas de fugas o fallas.
                </p>
              </div>

              {/* Feature 3: El Resultado (Dashboards) */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Dashboards Gerenciales</h3>
                <p className="text-gray-600">
                  Paneles visuales intuitivos que calculan el retorno de inversión, unifican los datos de múltiples sedes y generan informes de cumplimiento y sostenibilidad.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Industrias / Sectores */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Diseñado para infraestructuras exigentes</h2>
                <ul className="space-y-8">
                  <li className="flex gap-4">
                    <ShieldCheck className="h-7 w-7 text-blue-600 flex-shrink-0" />
                    <div>
                      <strong className="text-gray-900 text-lg">Educación y Campus</strong>
                      <p className="text-gray-600 mt-2">Unificación de información en grandes instalaciones y prevención rigurosa del malgasto de recursos públicos.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <ShieldCheck className="h-7 w-7 text-blue-600 flex-shrink-0" />
                    <div>
                      <strong className="text-gray-900 text-lg">Industria y Manufactura</strong>
                      <p className="text-gray-600 mt-2">Seguimiento estricto de KPIs de rendimiento energético y detección temprana de fallas en equipos de alto consumo.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <ShieldCheck className="h-7 w-7 text-blue-600 flex-shrink-0" />
                    <div>
                      <strong className="text-gray-900 text-lg">Atención Médica y Utilidades</strong>
                      <p className="text-gray-600 mt-2">Generación automatizada de informes de cumplimiento normativo y asistencia operativa para proveedores de servicios.</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="mt-12 lg:mt-0 bg-slate-900 p-10 rounded-3xl border border-slate-800 shadow-2xl">
                 <h3 className="text-2xl font-bold text-white mb-4">Arquitectura de grado empresarial</h3>
                 <p className="text-slate-300 mb-8 leading-relaxed">
                   Nuestros modelos de Inteligencia Artificial procesan grandes volúmenes de datos en infraestructuras altamente seguras. Ya sea con implementaciones en la nube o en servidores locales, garantizamos la confidencialidad absoluta de tu información financiera y operativa.
                 </p>
                 <Button className="w-full h-12 text-base bg-blue-600 hover:bg-blue-500 text-white rounded-xl">
                    Contactar a un ingeniero
                 </Button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* FOOTER CORPORATIVO */}
      <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top section with columns */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            
            {/* Column 1: Tecnología */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Tecnología</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-base text-gray-500 hover:text-blue-600">Vectia IA Core</a></li>
                <li><a href="#" className="text-base text-gray-500 hover:text-blue-600">Extensión IoT</a></li>
                <li><a href="#" className="text-base text-gray-500 hover:text-blue-600">Telemetría en tiempo real</a></li>
              </ul>
            </div>

            {/* Column 2: Empresa */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Empresa</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-base text-gray-500 hover:text-blue-600">Sobre nosotros</a></li>
                <li><a href="#" className="text-base text-gray-500 hover:text-blue-600">Blog / Noticias</a></li>
                <li><a href="#" className="text-base text-gray-500 hover:text-blue-600">Contacto</a></li>
              </ul>
            </div>

            {/* Column 3: Sectores */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">A quién servimos</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-base text-gray-500 hover:text-blue-600">Educación</a></li>
                <li><a href="#" className="text-base text-gray-500 hover:text-blue-600">Atención Médica</a></li>
                <li><a href="#" className="text-base text-gray-500 hover:text-blue-600">Industria</a></li>
                <li><a href="#" className="text-base text-gray-500 hover:text-blue-600">Servicios Públicos</a></li>
              </ul>
            </div>

            {/* Column 4: Newsletter (Adaptado de Cufflink) */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Recibe actualizaciones</h4>
              <p className="text-sm text-gray-500 mb-4">Mantente al tanto de las novedades de Vectia IA y nuevas integraciones.</p>
              <form className="flex flex-col gap-3">
                <input 
                  type="email" 
                  placeholder="Correo electrónico" 
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <Button type="button" variant="outline" className="w-fit px-6 rounded-full text-gray-700">
                  Suscribirse
                </Button>
              </form>
            </div>
          </div>

          {/* Bottom section (Copyright & Legals) */}
          <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Vectia S.A.S. Todos los derechos reservados.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-gray-400 hover:text-gray-900">Política de Privacidad</a>
              <a href="#" className="text-sm text-gray-400 hover:text-gray-900">Términos de Servicio</a>
            </div>
          </div>

        </div>
      </footer>
    </main>
  );
}
