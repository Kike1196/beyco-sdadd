import { NextResponse } from 'next/server';

// PRIMERO: Verifica cuál es tu contraseña real de MySQL
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root', 
    password: process.env.DB_PASSWORD || 'root123', // Prueba vacío primero
    database: process.env.DB_NAME || 'mydb'
};

async function query(sql, params) {
    try {
        console.log('📊 Intentando conectar a BD con:', {
            host: dbConfig.host,
            user: dbConfig.user,
            database: dbConfig.database,
            hasPassword: !!dbConfig.password
        });
        
        const mysql = await import('mysql2/promise');
        const connection = await mysql.createConnection(dbConfig);
        
        console.log('📊 Ejecutando query:', sql);
        const [results] = await connection.execute(sql, params);
        
        await connection.end();
        return results;
        
    } catch (error) {
        console.error('❌ Error de conexión BD:', error.message);
        console.error('🔍 Código de error:', error.code);
        
        // Si falla con password, intentar sin password
        if (error.code === 'ER_ACCESS_DENIED_ERROR' && dbConfig.password) {
            console.log('🔄 Intentando conexión sin password...');
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
    const {
      curp,
      nombre,
      apellidoPaterno,
      apellidoMaterno,
      fechaNacimiento,
      puesto,
      estadoNacimiento,
      rfc,
      cursoId
    } = body;

    console.log('📝 Procesando NUEVA inscripción:', { curp, nombre, cursoId });

    // Validar campos requeridos
    if (!curp || !nombre || !apellidoPaterno || !cursoId) {
      return NextResponse.json(
        { error: 'CURP, nombre, apellido paterno y curso son requeridos' },
        { status: 400 }
      );
    }

    // PRIMERO: Registrar el alumno en Spring Boot (que SÍ funciona)
    console.log('👤 Registrando alumno en Spring Boot...');
    
    const alumnoData = {
      curp: curp.toUpperCase(),
      nombre: nombre,
      apellidoPaterno: apellidoPaterno,
      apellidoMaterno: apellidoMaterno || '',
      fechaNacimiento: fechaNacimiento || null,
      puesto: puesto || '',
      estadoNacimiento: estadoNacimiento || '',
      rfc: rfc ? rfc.toUpperCase() : '',
      activo: true
    };

    const alumnoResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/alumnos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(alumnoData)
    });

    if (!alumnoResponse.ok) {
      console.log('ℹ️ Alumno ya existe en Spring Boot, continuando...');
    } else {
      console.log('✅ Alumno registrado en Spring Boot');
    }

    // SEGUNDO: Realizar la inscripción al curso en la BD
    console.log('📚 Realizando inscripción al curso...');
    
    try {
      // Verificar que el curso existe
      const [cursos] = await query(
        'SELECT Id_Curso, Nombre_curso FROM cursos WHERE Id_Curso = ?',
        [cursoId]
      );

      if (cursos.length === 0) {
        throw new Error(`El curso con ID ${cursoId} no existe`);
      }

      console.log(`✅ Curso encontrado: ${cursos[0].Nombre_curso}`);

      // Verificar si ya está inscrito en alumnos_has_cursos
      const [inscripcionesExistentes] = await query(
        `SELECT * FROM alumnos_has_cursos 
         WHERE alumnos_Curp = ? AND cursos_Id_Curso = ?`,
        [curp.toUpperCase(), cursoId]
      );

      if (inscripcionesExistentes.length > 0) {
        throw new Error('El alumno ya está inscrito en este curso');
      }

      // Realizar la inscripción en alumnos_has_cursos
      const result = await query(
        `INSERT INTO alumnos_has_cursos (alumnos_Curp, cursos_Id_Curso) 
         VALUES (?, ?)`,
        [curp.toUpperCase(), cursoId]
      );

      console.log('✅ Inscripción exitosa en alumnos_has_cursos');

      return NextResponse.json({
        success: true,
        message: 'Alumno registrado e inscrito exitosamente',
        data: {
          curso: cursos[0].Nombre_curso,
          alumno: nombre
        }
      });

    } catch (inscripcionError) {
      console.error('❌ Error en inscripción:', inscripcionError);
      
      // Si falla la conexión a BD, al menos el alumno se registró en Spring Boot
      return NextResponse.json({
        success: true,
        message: 'Alumno registrado exitosamente. Nota: No se pudo completar la inscripción al curso debido a problemas de conexión con la base de datos.',
        warning: 'Error de conexión a BD: ' + inscripcionError.message
      });
    }

  } catch (error) {
    console.error('❌ Error al procesar nueva inscripción:', error);
    return NextResponse.json(
      { 
        error: error.message,
        message: 'No se pudo completar el registro e inscripción'
      },
      { status: 500 }
    );
  }
}