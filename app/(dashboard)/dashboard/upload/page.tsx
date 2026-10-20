'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  UploadCloud, 
  FileText, 
  Upload, 
  RefreshCw, 
  Trash2 
} from 'lucide-react';

// Datos de prueba para visualizar la interfaz. 
// Más adelante esto será reemplazado por tu estado/conexión al backend.
const mockFiles = [
  { 
    id: 1, 
    date: '20/10/2026', 
    name: 'Factura_Energia_Sede_Norte_Oct.pdf', 
    status: 'Sin cargar' 
  },
  { 
    id: 2, 
    date: '19/10/2026', 
    name: 'Acueducto_Planta_Principal_Sep.pdf', 
    status: 'Cargado' 
  },
];

export default function UploadPage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6 text-gray-900">
        Subir facturas
      </h1>
      
      {/* Zona de Drag & Drop (Pendiente por lógica) */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Carga de documentos</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-gray-200 rounded-lg m-6 mt-0 bg-gray-50/50">
          <UploadCloud className="h-16 w-16 text-blue-500 mb-4" />
          <p className="text-gray-600 max-w-md">
            Haz clic o arrastra aquí tus recibos y facturas de servicios públicos en formato PDF para añadirlos a la cola.
          </p>
        </CardContent>
      </Card>

      {/* Tabla de Archivos Añadidos */}
      <Card>
        <CardHeader>
          <CardTitle>Archivos añadidos</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 whitespace-nowrap">Fecha</th>
                  <th className="px-4 py-3">Archivo</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-4 text-gray-500 whitespace-nowrap">
                      {file.date}
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        <span className="truncate max-w-[200px] sm:max-w-xs" title={file.name}>
                          {file.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          file.status === 'Cargado' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {file.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 flex justify-end gap-1.5">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Subir a Vectia IA"
                        className="hover:text-blue-600 hover:bg-blue-50 h-8 w-8"
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Resubir"
                        className="hover:text-blue-600 hover:bg-blue-50 h-8 w-8"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Eliminar"
                        className="hover:text-red-600 hover:bg-red-50 h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                
                {/* Mensaje por si la tabla está vacía */}
                {mockFiles.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      No hay archivos en la cola. Añade facturas para procesarlas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
