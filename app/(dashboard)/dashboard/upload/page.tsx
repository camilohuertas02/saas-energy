'use client';

import { useState, useRef, useEffect } from 'react';
import useSWR from 'swr';
import { createBrowserClient } from '@supabase/ssr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, FileText, Upload, Trash2, Loader2, CheckCircle2 } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createBrowserClient(supabaseUrl, supabaseKey);

// Fetcher que apunta a nuestro Proxy interno
const fetcherProxy = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al cargar datos');
  return res.json();
};

interface VectiaFile {
  id: string;
  date: string;
  name: string;
  status: 'Listo para extraer' | 'Subiendo y Procesando...' | 'Datos extraidos' | 'Error';
  fileObj?: File; 
  url?: string;  
  filePath?: string; 
  extractedData?: any; 
  dbFacturaId?: number; 
}

export default function UploadPage() {
  const [files, setFiles] = useState<VectiaFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. OBTENER HISTORIAL (Sobrevive al F5 para facturas ya procesadas)
  const { data: dbData, mutate } = useSWR('/api/proxy/analytics', fetcherProxy);

  useEffect(() => {
    if (dbData?.data) {
      const loadedFiles: VectiaFile[] = dbData.data.map((f: any) => {
         const fechaStr = f.created_at ? new Date(f.created_at).toLocaleDateString('es-CO') : 'Desconocida';
         return {
           id: `db-${f.id}`, 
           date: fechaStr,
           // Mostramos un nombre representativo del historial
           name: `Factura_${f.proveedor?.replace(/\s/g, '') || 'Servicio'}_${f.numero_factura || f.id}.pdf`,
           status: 'Datos extraidos',
           dbFacturaId: f.id,
         };
      });

      setFiles(prev => {
        // Mantenemos en pantalla los archivos que apenas se arrastraron
        const activeUploads = prev.filter(p => p.status !== 'Datos extraidos');
        return [...loadedFiles, ...activeUploads];
      });
    }
  }, [dbData]);

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

  // 2. STAGING & RENOMBRAMIENTO INTELIGENTE (No toca el bucket todavía)
  const processSelectedFiles = async (newFiles: File[]) => {
    for (const file of newFiles) {
      const newId = crypto.randomUUID();
      
      // Añadir marca de tiempo: YYYYMMDD_HHMM para evitar duplicados
      const now = new Date();
      const timestamp = `${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}_${now.getHours().toString().padStart(2,'0')}${now.getMinutes().toString().padStart(2,'0')}`;
      
      const fileExt = file.name.split('.').pop();
      const baseName = file.name.substring(0, file.name.lastIndexOf('.'));
      const safeBaseName = baseName.replace(/[^a-zA-Z0-9-]/g, '_'); 
      const newFileName = `${safeBaseName}_${timestamp}.${fileExt}`;

      // Reconstruimos el objeto File con el nuevo nombre seguro
      const modifiedFile = new File([file], newFileName, { type: file.type });

      const newVectiaFile: VectiaFile = {
        id: newId,
        date: now.toLocaleDateString('es-CO'),
        name: newFileName,
        status: 'Listo para extraer', // Se queda en memoria local
        fileObj: modifiedFile,
      };

      setFiles(prev => [newVectiaFile, ...prev]);
    }
  };

  // 3. PROCESAMIENTO TOTAL (Sube al bucket + Extrae datos)
  const handleProcessInRender = async (fileId: string) => {
    const fileToProcess = files.find(f => f.id === fileId);
    if (!fileToProcess || !fileToProcess.fileObj) return;

    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'Subiendo y Procesando...' } : f));

    try {
      // a) Ahora sí subimos al bucket de Supabase con su nombre único
      const filePath = fileToProcess.name;
      const { error: uploadError } = await supabase.storage.from('facturas_vectia').upload(filePath, fileToProcess.fileObj);
      if (uploadError) throw uploadError;

      const { data: urlData } = await supabase.storage.from('facturas_vectia').createSignedUrl(filePath, 60 * 60 * 24);

      // b) Enviamos al servidor proxy para la extracción de IA
      const formData = new FormData();
      formData.append('archivo', fileToProcess.fileObj);

      const response = await fetch('/api/proxy/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `Error HTTP: ${response.status}`);
      }

      const data = await response.json(); 
      
      // c) Actualizamos la UI al éxito total
      setFiles(prev => prev.map(f => f.id === fileId ? { 
        ...f, 
        status: 'Datos extraidos', 
        url: urlData?.signedUrl, 
        filePath: filePath,
        extractedData: data, 
        dbFacturaId: data.id_factura 
      } : f));
      
      // Actualizamos el SWR para sincronizar el historial
      mutate();

    } catch (error: any) {
      console.error("Detalle del error:", error.message);
      alert(`Fallo en el flujo: ${error.message}`);
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'Error' } : f));
    }
  };

  const handleRemove = async (fileId: string) => {
    const fileToDelete = files.find(f => f.id === fileId);
    setFiles(prev => prev.filter(f => f.id !== fileId));

    if (fileToDelete) {
      // Borra de la DB
      if (fileToDelete.dbFacturaId) {
        try {
          await supabase.from('facturas').delete().eq('id', fileToDelete.dbFacturaId);
          mutate(); 
        } catch (err) {}
      }
      // Borra del Bucket (solo si llegó a subirse)
      if (fileToDelete.filePath) {
        try {
          await supabase.storage.from('facturas_vectia').remove([fileToDelete.filePath]);
        } catch (err) {}
      }
    }
  };

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6 text-gray-900">Subir facturas</h1>
      
      <Card className="mb-8">
        <CardHeader><CardTitle>Carga de documentos</CardTitle></CardHeader>
        <CardContent 
          className={`flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg m-6 mt-0 cursor-pointer transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100'}`}
          onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}
        >
          <input type="file" ref={fileInputRef} onChange={handleFileInput} className="hidden" accept="application/pdf" multiple />
          <UploadCloud className={`h-16 w-16 mb-4 ${isDragging ? 'text-blue-600' : 'text-blue-500'}`} />
          <p className="text-gray-600 max-w-md font-medium">Haz clic o arrastra aquí tus recibos en formato PDF para añadirlos a la cola.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Historial y Cola de Extracción</CardTitle></CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                <tr><th className="px-4 py-3 whitespace-nowrap">Fecha</th><th className="px-4 py-3">Archivo</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3 text-right">Acciones</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {files.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-4 text-gray-500 whitespace-nowrap">{file.date}</td>
                    <td className="px-4 py-4 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        {file.url ? <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate max-w-[200px] sm:max-w-xs">{file.name}</a> : <span className="truncate max-w-[200px] sm:max-w-xs">{file.name}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                        ${file.status === 'Datos extraidos' ? 'bg-green-100 text-green-700' : 
                          file.status === 'Listo para extraer' ? 'bg-amber-100 text-amber-700' : 
                          file.status === 'Error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                        {file.status === 'Subiendo y Procesando...' && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                        {file.status === 'Datos extraidos' && <CheckCircle2 className="mr-1 h-3 w-3" />}
                        {file.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 flex justify-end gap-1.5">
                      <Button variant="ghost" size="icon" className="hover:text-blue-600 hover:bg-blue-50 h-8 w-8" onClick={() => handleProcessInRender(file.id)} disabled={file.status === 'Subiendo y Procesando...' || file.status === 'Datos extraidos'}>
                        <Upload className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="hover:text-red-600 hover:bg-red-50 h-8 w-8" onClick={() => handleRemove(file.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {files.length === 0 && (<tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No hay archivos procesados. Añade facturas para comenzar.</td></tr>)}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
