'use client';

import { useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import useSWR from 'swr';
import { User } from '@/lib/db/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, FileText, Upload, Trash2, Loader2 } from 'lucide-react';

// INICIALIZACIÓN DE SUPABASE
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'TU_SUPABASE_URL';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'TU_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface VectiaFile {
  id: string;
  date: string;
  name: string;
  status: 'Sin cargar' | 'Subiendo...' | 'Cargado sin extraer datos' | 'Procesando LLM...' | 'Datos extraidos' | 'Error';
  fileObj: File; 
  url?: string;  
  filePath?: string; 
  extractedData?: any; 
  dbFacturaId?: number; 
}

export default function UploadPage() {
  const { data: user } = useSWR<User>('/api/user', fetcher);

  const [files, setFiles] = useState<VectiaFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
    if (droppedFiles.length > 0) processSelectedFiles(droppedFiles);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(f => f.type === 'application/pdf');
      processSelectedFiles(selectedFiles);
    }
  };

  const processSelectedFiles = async (newFiles: File[]) => {
    for (const file of newFiles) {
      const newId = crypto.randomUUID();
      const newVectiaFile: VectiaFile = {
        id: newId,
        date: new Date().toLocaleDateString('es-CO'),
        name: file.name,
        status: 'Subiendo...',
        fileObj: file,
      };

      setFiles(prev => [...prev, newVectiaFile]);

      try {
        const filePath = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        
        const { error: uploadError } = await supabase.storage
          .from('facturas_vectia')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = await supabase.storage
          .from('facturas_vectia')
          .createSignedUrl(filePath, 60 * 60 * 24);

        setFiles(prev => prev.map(f => 
          f.id === newId ? { 
            ...f, 
            status: 'Cargado sin extraer datos', 
            url: urlData?.signedUrl,
            filePath: filePath 
          } : f
        ));

      } catch (error) {
        console.error("Error subiendo a Supabase:", error);
        setFiles(prev => prev.map(f => 
          f.id === newId ? { ...f, status: 'Error' } : f
        ));
      }
    }
  };

  const handleProcessInRender = async (fileId: string) => {
    const fileToProcess = files.find(f => f.id === fileId);
    if (!fileToProcess || !fileToProcess.fileObj) return;

    // 1. SEGURIDAD: Obtenemos el token JWT directamente de la sesión de Supabase
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
      console.error("No hay sesión activa o token válido");
      alert("Por favor, inicia sesión para procesar la factura.");
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'Error' } : f));
      return;
    }

    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'Procesando LLM...' } : f));

    const formData = new FormData();
    formData.append('archivo', fileToProcess.fileObj);
    // IMPORTANTE: Ya NO enviamos 'id_usuario' aquí. El backend lo deducirá del token.

    try {
      const response = await fetch('https://saas-energy-backend.onrender.com/api/procesar-factura', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}` // 2. Enviamos el token de forma segura
        },
        body: formData,
      });

      // Si la respuesta no es OK (ej. error 500 de Render o error de autenticación 401)
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.detail || `Error HTTP: ${response.status}`;
        throw new Error(errorMessage);
      }

      // Si todo salió bien, extraemos los datos
      const data = await response.json(); 
      
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { 
          ...f, 
          status: 'Datos extraidos', 
          extractedData: data,
          dbFacturaId: data.id_factura 
        } : f
      ));
      
      console.log("¡Factura procesada y guardada exitosamente!", data);

    } catch (error: any) {
      console.error("Detalle del error del backend:", error.message);
      alert(`Fallo al procesar: ${error.message}`);
      
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'Error' } : f));
    }
  };

  const handleRemove = async (fileId: string) => {
    const fileToDelete = files.find(f => f.id === fileId);
    
    // Eliminamos de la UI primero para mayor fluidez
    setFiles(prev => prev.filter(f => f.id !== fileId));

    if (fileToDelete) {
      // 1. Borrar de la Base de Datos si ya había sido extraída
      if (fileToDelete.dbFacturaId) {
        try {
          const { error: dbError } = await supabase
            .from('facturas')
            .delete()
            .eq('id', fileToDelete.dbFacturaId);

          if (dbError) {
            console.error("Error borrando el registro de la base de datos:", dbError);
          } else {
            console.log(`Registro de factura ${fileToDelete.dbFacturaId} eliminado de la base de datos.`);
          }
        } catch (err) {
          console.error("Fallo inesperado al eliminar registro de BD:", err);
        }
      }

      // 2. Borrar el archivo de Supabase Storage
      if (fileToDelete.filePath) {
        try {
          const { error: storageError } = await supabase.storage
            .from('facturas_vectia')
            .remove([fileToDelete.filePath]);
          
          if (storageError) {
            console.error("Error eliminando archivo en Supabase Storage:", storageError);
          } else {
            console.log(`Archivo ${fileToDelete.name} eliminado del Storage.`);
          }
        } catch (err) {
          console.error("Fallo inesperado al eliminar de Storage:", err);
        }
      }
    }
  };

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6 text-gray-900">
        Subir facturas
      </h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Carga de documentos</CardTitle>
        </CardHeader>
        <CardContent 
          className={`flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg m-6 mt-0 cursor-pointer transition-colors
            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileInput} 
            className="hidden" 
            accept="application/pdf" 
            multiple 
          />
          <UploadCloud className={`h-16 w-16 mb-4 ${isDragging ? 'text-blue-600' : 'text-blue-500'}`} />
          <p className="text-gray-600 max-w-md font-medium">
            Haz clic o arrastra aquí tus recibos en formato PDF para añadirlos a la cola.
          </p>
        </CardContent>
      </Card>

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
                {files.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-4 text-gray-500 whitespace-nowrap">
                      {file.date}
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        {file.url ? (
                          <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate max-w-[200px] sm:max-w-xs" title={file.name}>
                            {file.name}
                          </a>
                        ) : (
                          <span className="truncate max-w-[200px] sm:max-w-xs" title={file.name}>
                            {file.name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                          ${file.status === 'Datos extraidos' ? 'bg-green-100 text-green-700' : 
                            file.status === 'Cargado sin extraer datos' ? 'bg-blue-100 text-blue-700' :
                            file.status === 'Error' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-600'}`}
                      >
                        {file.status === 'Subiendo...' || file.status === 'Procesando LLM...' ? (
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        ) : null}
                        {file.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 flex justify-end gap-1.5">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Extraer datos con Vectia IA"
                        className="hover:text-blue-600 hover:bg-blue-50 h-8 w-8"
                        onClick={() => handleProcessInRender(file.id)}
                        disabled={file.status === 'Subiendo...' || file.status === 'Procesando LLM...' || file.status === 'Datos extraidos'}
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Eliminar de la lista"
                        className="hover:text-red-600 hover:bg-red-50 h-8 w-8"
                        onClick={() => handleRemove(file.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                
                {files.length === 0 && (
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
