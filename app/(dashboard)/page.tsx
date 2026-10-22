import { Button } from '@/components/ui/button';
import { 
  ArrowRight, AlertTriangle, Droplets, Scale, Leaf, 
  FileText, Map, ShieldCheck, ChevronRight
} from 'lucide-react';

export default function HomePage() {
  return (
    <main className="bg-gray-50 flex flex-col min-h-screen">
      
      {/* 1. HERO SECTION (El gancho operativo) */}
      <section className="pt-24 pb-16 lg:pt-32 lg:pb-24 bg-white flex flex-col items-center text-center relative overflow-hidden">
        {/* Fondo decorativo sutil */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-50/50 rounded-full blur-3xl -z-10"></div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold text-blue-800 bg-blue-50 border border-blue-100 mb-8">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
            Gestión Energética Inteligente
          </div>
          
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl md:text-6xl leading-tight max-w-4xl mx-auto">
            Detén la fuga de capital en tus <span className="text-blue-600">servicios públicos</span>
          </h1>
          
          <p className="mt-6 text-lg text-gray-600 sm:text-xl max-w-3xl mx-auto leading-relaxed">
            Vectia IA analiza tus facturas, detecta sobrecostos por energía reactiva, identifica ineficiencias y consolida tus reportes ESG. Todo en un mapa interactivo centralizado.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 h-12 text-base font-medium shadow-md">
              Agendar demostración gratuita
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base border-gray-300 text-gray-700 hover:bg-gray-50 font-medium">
              Conocer más
            </Button>
          </div>
        </div>
      </section>

      {/* 2. KILLER FEATURES (La necesidad y la solución) */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Aquí reubicamos el "Dato Clave" para que suene orgánico y justifique el producto */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Transforma el gasto de tus sedes en ahorros cuantificables</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Las empresas colombianas pierden hasta un 15% de su presupuesto anual en penalizaciones (como la CREG 015) y fugas no detectadas. Vectia IA monitorea y protege tus recursos de forma continua.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature 1: Penalización Reactiva */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -z-10"></div>
              <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600 mb-6">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Alerta CREG 015 (Energía Reactiva)</h3>
              <p className="text-gray-600 mb-4">
                Si tus motores o maquinaria están mal calibrados, la electrificadora te cobrará multas severas. Nuestra IA lee este dato específico y lanza alertas críticas antes de que la penalización afecte tu presupuesto.
              </p>
              <div className="text-sm font-medium text-red-700 bg-red-50 p-3 rounded-lg border border-red-100">
                💡 Sugerencia automática: "Considerar instalación de banco de condensadores en Sede Norte."
              </div>
            </div>

            {/* Feature 2: Detección de Fugas */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-blue-100 hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10"></div>
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 mb-6">
                <Droplets className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Benchmarking y Detección de Fugas</h3>
              <p className="text-gray-600 mb-4">
                Cruzamos las variables de todas tus sedes de forma inteligente. Si dos instalaciones tienen el mismo tamaño operativo, pero una gasta un 40% más de agua, el sistema alertará sobre una posible ineficiencia invisible.
              </p>
            </div>

            {/* Feature 3: Revisión Legal */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-purple-100 hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -z-10"></div>
              <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 mb-6">
                <Scale className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Revisión de Estratos y Recargos</h3>
              <p className="text-gray-600 mb-4">
                Decenas de sedes comerciales pagan 20% extra de "Contribución de Solidaridad" por errores de categorización. Vectia IA resalta estos cobros para que tu equipo de gestión exija las correcciones correspondientes.
              </p>
            </div>

            {/* Feature 4: Módulo ESG */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-green-100 hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -z-10"></div>
              <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600 mb-6">
                <Leaf className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Módulo ESG (Huella de Carbono)</h3>
              <p className="text-gray-600 mb-4">
                Transformamos automáticamente tus kWh de luz, m³ de gas y agua en Toneladas de CO2 equivalentes. Genera tu Reporte de Sostenibilidad Corporativa anual con un solo clic, listo para presentar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MÚSCULO TECNOLÓGICO */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
          
          {/* Bloque 1: Extracción IA */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center text-blue-600 font-semibold mb-4">
                <FileText className="mr-2 h-5 w-5" /> Procesamiento Inteligente
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Olvídate de la digitación manual.</h2>
              <p className="text-lg text-gray-600 mb-6">
                Sube tus recibos crudos en formato PDF. Nuestro motor impulsado por modelos fundacionales (LLMs) lee las tablas, unifica proveedores distintos y extrae los datos clave con precisión, ignorando el ruido publicitario del documento.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-700"><ChevronRight className="h-5 w-5 text-blue-500 mr-2"/> Extracción de histórico de consumo</li>
                <li className="flex items-center text-gray-700"><ChevronRight className="h-5 w-5 text-blue-500 mr-2"/> Separación de múltiples medidores</li>
                <li className="flex items-center text-gray-700"><ChevronRight className="h-5 w-5 text-blue-500 mr-2"/> Consolidación financiera en COP</li>
              </ul>
            </div>
            
            {/* PLACEHOLDER IMAGEN 1 */}
            <div className="w-full aspect-[4/3] bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
              <FileText className="h-16 w-16 mb-4 opacity-50" />
              <p className="font-medium">Espacio para Imagen:</p>
              <p className="text-sm">Captura de pantalla de la subida y tabla de extracción</p>
            </div>
          </div>

          {/* Bloque 2: Mapa Satelital */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* PLACEHOLDER IMAGEN 2 */}
            <div className="w-full aspect-[4/3] bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 order-2 lg:order-1">
              <Map className="h-16 w-16 mb-4 opacity-50" />
              <p className="font-medium">Espacio para Imagen:</p>
              <p className="text-sm">Captura de pantalla del mapa avanzado con las burbujas financieras</p>
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center text-blue-600 font-semibold mb-4">

<Map className="mr-2 h-5 w-5" />
Control Geoespacial
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Tus sedes en un panel financiero vivo.</h2>
              <p className="text-lg text-gray-600 mb-6">
                Impulsado por motores cartográficos avanzados, Vectia IA ubica automáticamente cada dirección extraída y genera "burbujas financieras" interactivas. Monitorea el gasto de cientos de sucursales a nivel nacional en un solo vistazo.
              </p>
              <Button variant="outline" className="mt-2 text-blue-600 border-blue-200 hover:bg-blue-50">
                Ver características
              </Button>
            </div>
          </div>

        </div>
      </section>

      {/* 4. INDUSTRIAS / CASOS DE USO */}
      <section className="py-24 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Diseñado para infraestructuras exigentes</h2>
              <ul className="space-y-8">
                <li className="flex gap-4">
                  <ShieldCheck className="h-7 w-7 text-blue-600 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-900 text-lg">Industria y Manufactura</strong>
                    <p className="text-gray-600 mt-1">Seguimiento estricto de KPIs de rendimiento energético.</p>
                    <p className="text-sm text-blue-700 mt-2 font-medium bg-blue-50 p-2 rounded w-fit border border-blue-100">
                      Caso de Uso: Alertas tempranas en motores generando energía reactiva.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <ShieldCheck className="h-7 w-7 text-blue-600 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-900 text-lg">Educación, Campus y Retail</strong>
                    <p className="text-gray-600 mt-1">Unificación de información en grandes instalaciones multi-sede.</p>
                    <p className="text-sm text-blue-700 mt-2 font-medium bg-blue-50 p-2 rounded w-fit border border-blue-100">
                      Caso de Uso: Benchmarking inteligente para descubrir ineficiencias de consumo.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <ShieldCheck className="h-7 w-7 text-blue-600 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-900 text-lg">Hospitales y Entidades Públicas</strong>
                    <p className="text-gray-600 mt-1">Gestión rigurosa para optimización del presupuesto operativo.</p>
                    <p className="text-sm text-blue-700 mt-2 font-medium bg-blue-50 p-2 rounded w-fit border border-blue-100">
                      Caso de Uso: Control de recargos injustificados en tarifas de servicios.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="mt-12 lg:mt-0 bg-slate-900 p-10 rounded-3xl border border-slate-800 shadow-2xl">
               <h3 className="text-2xl font-bold text-white mb-4">Arquitectura de grado empresarial</h3>
               <p className="text-slate-300 mb-8 leading-relaxed">
                 Nuestros modelos procesan volúmenes masivos de documentos en infraestructuras altamente seguras. Garantizamos la confidencialidad absoluta de tu información financiera mediante encriptación y aislamiento de bases de datos.
               </p>
               <Button className="w-full h-12 text-base bg-blue-600 hover:bg-blue-500 text-white rounded-xl">
                  Contactar a un asesor
               </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER CORPORATIVO */}
      <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Tecnología</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-base text-gray-500 hover:text-blue-600">Vectia IA Core</a></li>
                <li><a href="#" className="text-base text-gray-500 hover:text-blue-600">Módulo ESG</a></li>
                <li><a href="#" className="text-base text-gray-500 hover:text-blue-600">Telemetría IoT</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Empresa</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-base text-gray-500 hover:text-blue-600">Sobre nosotros</a></li>
                <li><a href="#" className="text-base text-gray-500 hover:text-blue-600">Casos de éxito</a></li>
                <li><a href="#" className="text-base text-gray-500 hover:text-blue-600">Contacto</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">A quién servimos</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-base text-gray-500 hover:text-blue-600">Sector Industrial</a></li>
                <li><a href="#" className="text-base text-gray-500 hover:text-blue-600">Universidades</a></li>
                <li><a href="#" className="text-base text-gray-500 hover:text-blue-600">Retail & Comercio</a></li>
                <li><a href="#" className="text-base text-gray-500 hover:text-blue-600">Salud & Hospitales</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Recibe actualizaciones</h4>
              <p className="text-sm text-gray-500 mb-4">Mantente al tanto de las novedades de Vectia IA y nuestras herramientas.</p>
              <form className="flex flex-col gap-3">
                <input 
                  type="email" 
                  placeholder="Correo electrónico corporativo" 
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <Button type="button" variant="outline" className="w-fit px-6 rounded-full text-gray-700">
                  Suscribirse
                </Button>
              </form>
            </div>
          </div>

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
