"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Mail, MapPin, User, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Aquí conectarás con tu API de Resend o similar (ej. fetch('/api/contact', {...}))
    // Simulamos un pequeño delay de envío por ahora
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver al inicio
        </Link>
      </div>

      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col md:flex-row">
          
          {/* Columna Izquierda: Propuesta de Valor */}
          <div className="md:w-5/12 bg-slate-900 p-10 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-slate-900 -z-10"></div>
            
            <div>
              <h2 className="text-3xl font-bold mb-6">Agendar Demostración</h2>
              <p className="text-slate-300 mb-8 leading-relaxed">
                Descubre cómo Vectia IA puede consolidar la información financiera de tus sucursales y prevenir penalizaciones operativas.
              </p>
              
              <ul className="space-y-6">
                <li className="flex items-start">
                  <CheckCircle2 className="h-6 w-6 text-blue-400 mr-3 flex-shrink-0" />
                  <p className="text-sm text-slate-300"><strong className="text-white block mb-1">Evaluación con Datos Reales</strong> Sube recibos de tu propia empresa durante la llamada para ver el análisis de IA en acción.</p>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-6 w-6 text-blue-400 mr-3 flex-shrink-0" />
                  <p className="text-sm text-slate-300"><strong className="text-white block mb-1">Análisis Histórico Inmediato</strong> Conoce nuestro proceso para auditar los últimos 6 meses de facturación.</p>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-6 w-6 text-blue-400 mr-3 flex-shrink-0" />
                  <p className="text-sm text-slate-300"><strong className="text-white block mb-1">Seguridad Empresarial</strong> Tus datos financieros jamás se utilizan para entrenar modelos públicos.</p>
                </li>
              </ul>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-800">
              <p className="text-sm text-slate-400">¿Dudas rápidas? Escríbenos a:</p>
              <p className="text-base font-medium mt-1">ventas@vectia.com.co</p>
            </div>
          </div>

          {/* Columna Derecha: Formulario */}
          <div className="md:w-7/12 p-10 lg:p-14 bg-white">
            {isSuccess ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in duration-500">
                <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Solicitud Recibida</h3>
                <p className="text-slate-600 max-w-md">
                  Gracias por tu interés. Un asesor experto revisará el perfil de tu empresa y se pondrá en contacto al correo corporativo para agendar la videollamada.
                </p>
                <Button 
                  onClick={() => setIsSuccess(false)}
                  variant="outline" 
                  className="mt-6 text-slate-600"
                >
                  Enviar otra solicitud
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Completa tus datos</h3>
                  <p className="text-slate-500 text-sm mb-8">Por favor, utiliza tu correo electrónico corporativo.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-700">Nombre Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input id="name" required placeholder="Ej. Carlos Mendoza" className="pl-10 h-12 bg-slate-50 border-slate-200" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700">Correo Corporativo</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input id="email" type="email" required placeholder="carlos@tuempresa.com" className="pl-10 h-12 bg-slate-50 border-slate-200" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-slate-700">Empresa</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input id="company" required placeholder="Nombre de la empresa" className="pl-10 h-12 bg-slate-50 border-slate-200" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="locations" className="text-slate-700">Número de Sedes/Sucursales</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <select 
                          id="locations" 
                          required 
                          defaultValue=""
                          className="flex h-12 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm pl-10 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-700"
                        >
                          <option value="" disabled>Selecciona una opción</option>
                          <option value="1-10">1 a 10 sedes</option>
                          <option value="11-50">11 a 50 sedes</option>
                          <option value="50+">Más de 50 sedes</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-base mt-4 transition-all"
                >
                  {isSubmitting ? 'Enviando solicitud...' : 'Solicitar Demostración'}
                </Button>
                
                <p className="text-xs text-center text-slate-400 mt-4">
                  Tus datos están protegidos y encriptados. No enviamos spam.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
