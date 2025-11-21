import { NextResponse } from 'next/server';

export async function GET() {
    try {
        console.log('📋 API: Obteniendo instructores desde Spring Boot...');
        console.log('🔗 URL del backend:', `${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/instructores`);
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/instructores`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            // Agregar timeout para evitar esperas infinitas
            signal: AbortSignal.timeout(10000)
        });

        console.log('📡 Status de respuesta Spring Boot:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error del backend:', errorText);
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Respuesta completa desde Spring Boot:', JSON.stringify(data, null, 2));

        // Procesar la respuesta según la estructura que devuelve Spring Boot
        let instructores = [];
        
        if (Array.isArray(data)) {
            instructores = data;
        } else if (data.instructores && Array.isArray(data.instructores)) {
            instructores = data.instructores;
        } else if (data.data && Array.isArray(data.data)) {
            instructores = data.data;
        } else {
            console.warn('⚠️ Estructura de respuesta inesperada:', data);
            instructores = [];
        }
        
        console.log(`✅ ${instructores.length} instructores procesados`);

        // Normalizar los datos para el frontend
        const instructoresNormalizados = instructores.map(instructor => {
            // Intentar múltiples formatos de ID
            const id = instructor.id || instructor.Num_Empleado || instructor.numEmpleado || instructor.userId;
            const nombre = instructor.Nombre || instructor.nombre || instructor.Nombre_Completo || 'Instructor';
            
            return {
                id: id,
                Num_Empleado: instructor.Num_Empleado || instructor.numEmpleado || id,
                Nombre: nombre,
                Apellido_paterno: instructor.Apellido_paterno || instructor.apellidoPaterno || '',
                Apellido_materno: instructor.Apellido_materno || instructor.apellidoMaterno || '',
                Correo: instructor.Correo || instructor.correo || instructor.email || '',
                // Mantener datos originales para debug
                _raw: instructor
            };
        });

        console.log('👥 Instructores normalizados:', instructoresNormalizados);

        return NextResponse.json({
            success: true,
            instructores: instructoresNormalizados
        });

    } catch (error) {
        console.error('❌ Error en API instructores:', error.message);
        
        if (error.name === 'TimeoutError') {
            console.error('⏰ Timeout al conectar con el backend');
        }
        
        // Fallback: devolver array vacío para que el frontend funcione
        return NextResponse.json({
            success: true,
            instructores: [],
            message: 'No se pudieron cargar los instructores: ' + error.message
        });
    }
}