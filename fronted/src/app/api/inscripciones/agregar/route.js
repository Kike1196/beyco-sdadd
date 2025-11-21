import { NextResponse } from 'next/server';

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root', 
    password: process.env.DB_PASSWORD || 'root123', // Probar sin password
    database: process.env.DB_NAME || 'mydb'
};

async function query(sql, params) {
    try {
        const mysql = await import('mysql2/promise');
        const connection = await mysql.createConnection(dbConfig);
        const [results] = await connection.execute(sql, params);
        await connection.end();
        return results;
    } catch (error) {
        console.error('❌ Error de conexión BD:', error.message);
        
        // Intentar sin password si falla
        if (error.code === 'ER_ACCESS_DENIED_ERROR' && dbConfig.password) {
            console.log('🔄 Intentando sin password...');
            const configSinPassword = { ...dbConfig, password: '' };
            const mysql = await import('mysql2/promise');
            const connection = await mysql.createConnection(configSinPassword);
            const [results] = await connection.execute(sql, params);
            await connection.end();
            return results;
        }
        
        throw error;
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { curp, cursoId } = body;

        console.log('📝 Inscribiendo alumno existente:', { curp, cursoId });

        if (!curp || !cursoId) {
            return NextResponse.json(
                { error: 'CURP y ID del curso son requeridos' },
                { status: 400 }
            );
        }

        // Verificar que el alumno existe en Spring Boot
        const alumnoResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/alumnos`);
        const alumnosData = await alumnoResponse.json();
        
        const alumnoExistente = alumnosData.alumnos.find(a => a.curp === curp.toUpperCase());
        
        if (!alumnoExistente) {
            return NextResponse.json(
                { error: 'El alumno no existe' },
                { status: 404 }
            );
        }

        console.log(`✅ Alumno encontrado: ${alumnoExistente.nombre}`);

        // Realizar la inscripción en alumnos_has_cursos
        try {
            // Verificar que el curso existe
            const [cursos] = await query(
                'SELECT Id_Curso, Nombre_curso FROM cursos WHERE Id_Curso = ?',
                [cursoId]
            );

            if (cursos.length === 0) {
                return NextResponse.json(
                    { error: 'El curso seleccionado no existe' },
                    { status: 404 }
                );
            }

            console.log(`✅ Curso encontrado: ${cursos[0].Nombre_curso}`);

            // Verificar si ya está inscrito
            const [inscripcionesExistentes] = await query(
                `SELECT * FROM alumnos_has_cursos 
                 WHERE alumnos_Curp = ? AND cursos_Id_Curso = ?`,
                [curp.toUpperCase(), cursoId]
            );

            if (inscripcionesExistentes.length > 0) {
                return NextResponse.json(
                    { error: 'El alumno ya está inscrito en este curso' },
                    { status: 400 }
                );
            }

            // Realizar la inscripción
            await query(
                `INSERT INTO alumnos_has_cursos (alumnos_Curp, cursos_Id_Curso) 
                 VALUES (?, ?)`,
                [curp.toUpperCase(), cursoId]
            );

            console.log('✅ Inscripción exitosa');

            return NextResponse.json({
                success: true,
                message: 'Alumno inscrito al curso exitosamente',
                data: {
                    alumno: alumnoExistente.nombre,
                    curso: cursos[0].Nombre_curso
                }
            });

        } catch (bdError) {
            console.error('❌ Error de BD:', bdError);
            
            return NextResponse.json({
                success: false,
                error: 'Error de conexión con la base de datos',
                message: 'No se pudo completar la inscripción debido a problemas de conexión'
            }, { status: 500 });
        }

    } catch (error) {
        console.error('❌ Error al inscribir alumno:', error);
        return NextResponse.json(
            { 
                error: error.message,
                message: 'No se pudo completar la inscripción'
            },
            { status: 500 }
        );
    }
}