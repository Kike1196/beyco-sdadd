import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const { curp, cursoId } = body;

        console.log('📝 Inscribiendo alumno existente REAL:', { curp, cursoId });

        if (!curp || !cursoId) {
            return NextResponse.json(
                { error: 'CURP y ID del curso son requeridos' },
                { status: 400 }
            );
        }

        // Verificar que el alumno existe
        const alumnosResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/alumnos`);
        const alumnosData = await alumnosResponse.json();
        
        const alumnoExistente = alumnosData.alumnos.find(a => a.curp === curp.toUpperCase());
        
        if (!alumnoExistente) {
            return NextResponse.json(
                { error: 'El alumno no existe en el sistema' },
                { status: 404 }
            );
        }

        console.log(`✅ Alumno encontrado: ${alumnoExistente.nombre}`);

        // Crear la inscripción en Spring Boot
        const inscripcionData = {
            curpAlumno: curp.toUpperCase(),
            idCurso: parseInt(cursoId),
            fechaInscripcion: new Date().toISOString(),
            estado: 'ACTIVO'
        };

        console.log('📦 Datos de inscripción:', inscripcionData);

        let inscripcionResponse;
        let inscripcionCreada = false;

        // Probar diferentes endpoints
        const endpoints = [
            `${process.env.NEXT_PUBLIC_API_URL}/api/inscripciones`,
            `${process.env.NEXT_PUBLIC_API_URL}/api/inscripciones/nueva`,
            `${process.env.NEXT_PUBLIC_API_URL}/api/alumnos-cursos`,
            `${process.env.NEXT_PUBLIC_API_URL}/api/cursos/inscribir`
        ];

        for (const endpoint of endpoints) {
            try {
                console.log(`🔗 Probando: ${endpoint}`);
                inscripcionResponse = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(inscripcionData)
                });

                if (inscripcionResponse.ok) {
                    const result = await inscripcionResponse.json();
                    console.log('✅ Inscripción creada:', result);
                    inscripcionCreada = true;
                    break;
                } else {
                    console.log(`❌ ${endpoint} falló: ${inscripcionResponse.status}`);
                }
            } catch (error) {
                console.log(`❌ Error en ${endpoint}:`, error.message);
            }
        }

        if (inscripcionCreada) {
            return NextResponse.json({
                success: true,
                message: '✅ ALUMNO INSCRITO EXITOSAMENTE al curso. Los datos han sido guardados en la base de datos.',
                data: {
                    alumno: alumnoExistente.nombre,
                    cursoId: cursoId
                }
            });
        } else {
            return NextResponse.json({
                success: false,
                error: 'No se pudo encontrar un endpoint válido para inscripciones',
                message: 'El alumno existe pero no se pudo completar la inscripción al curso.'
            }, { status: 500 });
        }

    } catch (error) {
        console.error('❌ Error al inscribir alumno existente:', error);
        return NextResponse.json(
            { 
                error: error.message,
                message: 'No se pudo completar la inscripción'
            },
            { status: 500 }
        );
    }
}