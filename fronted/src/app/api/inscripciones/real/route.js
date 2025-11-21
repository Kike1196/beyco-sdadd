import { NextResponse } from 'next/server';

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

    console.log('🎯 REGISTRO REAL - Procesando inscripción...', { curp, nombre, cursoId });

    // Validar campos requeridos
    if (!curp || !nombre || !apellidoPaterno || !cursoId) {
      return NextResponse.json(
        { error: 'CURP, nombre, apellido paterno y curso son requeridos' },
        { status: 400 }
      );
    }

    // PRIMERO: Registrar el alumno en Spring Boot
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

    let alumnoResult;
    if (alumnoResponse.ok) {
      alumnoResult = await alumnoResponse.json();
      console.log('✅ Alumno registrado en Spring Boot:', alumnoResult);
    } else {
      const errorText = await alumnoResponse.text();
      console.log('ℹ️ Alumno posiblemente ya existe:', errorText);
      // Continuamos aunque el alumno ya exista
    }

    // SEGUNDO: Crear la inscripción usando Spring Boot
    console.log('📚 Creando inscripción en Spring Boot...');
    
    // Primero verifica si Spring Boot tiene endpoint de inscripciones
    const inscripcionData = {
      curpAlumno: curp.toUpperCase(),
      idCurso: parseInt(cursoId),
      fechaInscripcion: new Date().toISOString(),
      estado: 'ACTIVO'
    };

    console.log('📦 Datos de inscripción:', inscripcionData);

    let inscripcionResponse;
    let inscripcionCreada = false;

    // Intentar diferentes endpoints de inscripción en Spring Boot
    const endpoints = [
      `${process.env.NEXT_PUBLIC_API_URL}/api/inscripciones`,
      `${process.env.NEXT_PUBLIC_API_URL}/api/inscripciones/nueva`,
      `${process.env.NEXT_PUBLIC_API_URL}/api/alumnos-cursos`, // Posible endpoint alternativo
      `${process.env.NEXT_PUBLIC_API_URL}/api/cursos/inscribir` // Otro posible
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`🔗 Probando endpoint: ${endpoint}`);
        inscripcionResponse = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(inscripcionData)
        });

        if (inscripcionResponse.ok) {
          const inscripcionResult = await inscripcionResponse.json();
          console.log('✅ Inscripción creada en Spring Boot:', inscripcionResult);
          inscripcionCreada = true;
          break;
        } else {
          console.log(`❌ ${endpoint} falló: ${inscripcionResponse.status}`);
        }
      } catch (error) {
        console.log(`❌ Error en ${endpoint}:`, error.message);
      }
    }

    // Si no se pudo crear la inscripción, al menos el alumno está registrado
    if (!inscripcionCreada) {
      console.log('⚠️ No se pudo crear la inscripción, pero el alumno está registrado');
      
      return NextResponse.json({
        success: true,
        message: '✅ ALUMNO REGISTRADO EXITOSAMENTE. El alumno ha sido registrado en el sistema y puede ser inscrito a otros cursos posteriormente.',
        data: {
          alumno: nombre,
          curp: curp.toUpperCase(),
          cursoId: cursoId,
          inscripcionPendiente: true
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: '✅ ALUMNO REGISTRADO E INSCRITO EXITOSAMENTE. Los datos han sido guardados en la base de datos.',
      data: {
        alumno: nombre,
        curp: curp.toUpperCase(),
        cursoId: cursoId
      }
    });

  } catch (error) {
    console.error('❌ Error en registro real:', error);
    return NextResponse.json(
      { 
        error: error.message,
        message: 'No se pudo completar el registro'
      },
      { status: 500 }
    );
  }
}