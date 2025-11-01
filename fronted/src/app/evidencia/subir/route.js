import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Configuración CORS para permitir solicitudes
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request) {
    try {
        console.log('📥 Iniciando subida de evidencia...');
        
        const formData = await request.formData();
        const cursoId = formData.get('cursoId');
        const instructorId = formData.get('instructorId');
        const instructorNombre = formData.get('instructorNombre');
        
        // Obtener todos los archivos
        const archivos = formData.getAll('archivos');
        
        console.log(`📥 Recibiendo ${archivos.length} archivos para curso ${cursoId}, instructor ${instructorNombre}`);

        if (!cursoId || !instructorId || archivos.length === 0) {
            return NextResponse.json(
                { error: 'Datos incompletos: cursoId, instructorId y archivos son requeridos' },
                { 
                    status: 400,
                    headers: corsHeaders
                }
            );
        }

        // Validar tipos de archivo permitidos
        const tiposPermitidos = [
            'image/jpeg', 
            'image/png', 
            'image/gif', 
            'image/webp', 
            'video/mp4', 
            'video/avi', 
            'application/pdf'
        ];

        const archivosValidos = archivos.filter(archivo => {
            if (typeof archivo === 'string') return false;
            return tiposPermitidos.includes(archivo.type);
        });

        if (archivosValidos.length === 0) {
            return NextResponse.json(
                { error: 'No hay archivos válidos. Tipos permitidos: imágenes, videos, PDF' },
                { 
                    status: 400,
                    headers: corsHeaders
                }
            );
        }

        // Validar que la carpeta de uploads exista
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'evidencia');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
            console.log('📁 Carpeta de uploads creada:', uploadsDir);
        }

        // Carpeta específica para el curso
        const cursoDir = path.join(uploadsDir, `curso-${cursoId}`);
        if (!fs.existsSync(cursoDir)) {
            fs.mkdirSync(cursoDir, { recursive: true });
            console.log('📁 Carpeta del curso creada:', cursoDir);
        }

        const archivosSubidos = [];

        // Procesar cada archivo
        for (const archivo of archivosValidos) {
            try {
                // Generar nombre único para el archivo
                const timestamp = Date.now();
                const randomString = Math.random().toString(36).substring(2, 15);
                const extension = path.extname(archivo.name) || '.bin';
                const nombreUnico = `evidencia_${timestamp}_${randomString}${extension}`;
                const filePath = path.join(cursoDir, nombreUnico);

                console.log(`💾 Guardando archivo: ${archivo.name} -> ${nombreUnico}`);

                // Convertir archivo a buffer y guardar
                const bytes = await archivo.arrayBuffer();
                const buffer = Buffer.from(bytes);
                
                fs.writeFileSync(filePath, buffer);

                // Guardar información del archivo
                const archivoInfo = {
                    id: archivosSubidos.length + 1,
                    nombre: archivo.name,
                    nombreUnico: nombreUnico,
                    ruta: `/uploads/evidencia/curso-${cursoId}/${nombreUnico}`,
                    tipo: archivo.type,
                    tamanio: archivo.size,
                    fecha: new Date().toISOString(),
                    cursoId: parseInt(cursoId),
                    instructorId: instructorId,
                    instructorNombre: instructorNombre
                };

                archivosSubidos.push(archivoInfo);
                
                console.log(`✅ Archivo guardado: ${archivo.name} (${(archivo.size / 1024 / 1024).toFixed(2)} MB)`);

            } catch (fileError) {
                console.error(`❌ Error procesando archivo ${archivo.name}:`, fileError);
                // Continuar con el siguiente archivo
            }
        }

        if (archivosSubidos.length === 0) {
            return NextResponse.json(
                { error: 'No se pudo procesar ningún archivo' },
                { 
                    status: 500,
                    headers: corsHeaders
                }
            );
        }

        console.log(`✅ Subida completada: ${archivosSubidos.length} archivos procesados`);

        return NextResponse.json({
            success: true,
            message: `${archivosSubidos.length} archivo(s) subido(s) correctamente`,
            archivos: archivosSubidos,
            totalSubidos: archivosSubidos.length
        }, { 
            headers: corsHeaders 
        });

    } catch (error) {
        console.error('❌ Error general subiendo evidencia:', error);
        return NextResponse.json(
            { 
                error: 'Error interno del servidor',
                details: error.message 
            },
            { 
                status: 500,
                headers: corsHeaders
            }
        );
    }
}

// GET para obtener evidencia existente
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const cursoId = searchParams.get('cursoId');

        console.log('📋 Solicitando evidencia para curso:', cursoId);

        if (!cursoId) {
            return NextResponse.json(
                { error: 'ID de curso requerido' },
                { 
                    status: 400,
                    headers: corsHeaders
                }
            );
        }

        // En una implementación real, aquí obtendrías los datos de la base de datos
        // Por ahora devolvemos datos de ejemplo o verificamos archivos físicos
        
        const cursoDir = path.join(process.cwd(), 'public', 'uploads', 'evidencia', `curso-${cursoId}`);
        
        let archivosExistentes = [];
        
        // Verificar si existe la carpeta y obtener archivos
        if (fs.existsSync(cursoDir)) {
            try {
                const files = fs.readdirSync(cursoDir);
                archivosExistentes = files.map((file, index) => {
                    const filePath = path.join(cursoDir, file);
                    const stats = fs.statSync(filePath);
                    
                    return {
                        id: index + 1,
                        nombre: file,
                        nombreUnico: file,
                        ruta: `/uploads/evidencia/curso-${cursoId}/${file}`,
                        tipo: 'image/jpeg', // Esto debería determinarse dinámicamente
                        tamanio: stats.size,
                        fecha: stats.mtime.toISOString(),
                        cursoId: parseInt(cursoId),
                        instructorId: '3',
                        instructorNombre: 'Ana Solis'
                    };
                });
            } catch (readError) {
                console.error('Error leyendo directorio:', readError);
            }
        }

        // Si no hay archivos reales, devolver datos de ejemplo
        if (archivosExistentes.length === 0) {
            archivosExistentes = [
                {
                    id: 1,
                    nombre: 'foto_grupo.jpg',
                    ruta: '/uploads/evidencia/curso-2/foto_grupo.jpg',
                    tipo: 'image/jpeg',
                    tamanio: 2048576,
                    fecha: '2025-01-15T10:30:00Z',
                    cursoId: parseInt(cursoId),
                    instructorId: '3',
                    instructorNombre: 'Ana Solis'
                },
                {
                    id: 2,
                    nombre: 'practica_equipos.jpg',
                    ruta: '/uploads/evidencia/curso-2/practica_equipos.jpg',
                    tipo: 'image/jpeg',
                    tamanio: 3048576,
                    fecha: '2025-01-15T11:45:00Z',
                    cursoId: parseInt(cursoId),
                    instructorId: '3',
                    instructorNombre: 'Ana Solis'
                }
            ];
        }

        console.log(`📋 Devolviendo ${archivosExistentes.length} archivos para curso ${cursoId}`);

        return NextResponse.json(archivosExistentes, { 
            headers: corsHeaders 
        });

    } catch (error) {
        console.error('❌ Error obteniendo evidencia:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { 
                status: 500,
                headers: corsHeaders
            }
        );
    }
}