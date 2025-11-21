import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    try {
        const { id } = params;
        
        console.log(`🔍 Buscando cursos para instructor ${id} desde Spring Boot...`);
        console.log('🔗 URL del backend:', `${process.env.NEXT_PUBLIC_API_URL}/api/instructor-cursos/instructor/${id}`);
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/instructor-cursos/instructor/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            signal: AbortSignal.timeout(10000)
        });

        console.log('📡 Status de respuesta Spring Boot:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error del backend:', errorText);
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Respuesta completa cursos desde Spring Boot:', JSON.stringify(data, null, 2));

        // Procesar la respuesta según la estructura que devuelve Spring Boot
        let cursos = [];
        
        if (Array.isArray(data)) {
            cursos = data;
        } else if (data.cursos && Array.isArray(data.cursos)) {
            cursos = data.cursos;
        } else if (data.data && Array.isArray(data.data)) {
            cursos = data.data;
        } else if (data.cursosPendientes && Array.isArray(data.cursosPendientes)) {
            cursos = data.cursosPendientes;
        } else {
            console.warn('⚠️ Estructura de respuesta inesperada:', data);
            cursos = [];
        }
        
        console.log(`✅ ${cursos.length} cursos procesados`);

        // Normalizar los datos para el frontend
        const cursosNormalizados = cursos.map(curso => {
            return {
                id: curso.id || curso.Id_Curso || curso.idCurso,
                nombre: curso.nombre || curso.Nombre_curso || curso.cursoNombre || 'Curso sin nombre',
                fechaIngreso: curso.fechaIngreso || curso.Fecha_Imparticion || curso.fechaCurso,
                lugar: curso.lugar || curso.Lugar || 'Lugar no especificado',
                empresa: curso.empresa || curso.empresaNombre || curso.Empresa || 'Empresa no especificada',
                instructorId: curso.instructorId || curso.Instructor_Id || curso.instructorId,
                examen_practico: curso.examen_practico || curso.Examen_practico || false,
                horas: curso.horas || curso.Horas || curso.horasImpartidas || 8,
                stps: curso.stps || curso.Clave_STPS,
                // Mantener datos originales para debug
                _raw: curso
            };
        });

        console.log('📚 Cursos normalizados:', cursosNormalizados);

        return NextResponse.json({
            success: true,
            cursos: cursosNormalizados
        });

    } catch (error) {
        console.error('❌ Error en API cursos:', error.message);
        
        // Fallback: devolver array vacío
        return NextResponse.json({
            success: true,
            cursos: [],
            message: 'No se pudieron cargar los cursos: ' + error.message
        });
    }
}