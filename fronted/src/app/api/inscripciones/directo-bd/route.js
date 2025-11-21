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

    console.log('🎯 Inscripción Nuevo Alumno:', { curp, nombre, cursoId });

    // Validar campos requeridos
    if (!curp || !nombre || !apellidoPaterno || !cursoId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'CURP, nombre, apellido paterno y curso son requeridos' 
        },
        { status: 400 }
      );
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    // PASO 1: Registrar el alumno
    console.log('👤 Paso 1: Registrando alumno...');
    
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

    const alumnoResponse = await fetch(`${API_URL}/api/alumnos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alumnoData)
    });

    // El alumno puede ya existir, eso está bien
    if (alumnoResponse.ok) {
      console.log('✅ Alumno registrado exitosamente');
    } else {
      const errorText = await alumnoResponse.text();
      console.log('ℹ️ Respuesta alumno:', errorText);
      // Continuamos de todos modos, puede que ya exista
    }

    // PASO 2: Crear la inscripción
    console.log('📚 Paso 2: Inscribiendo alumno al curso...');
    
    const inscripcionData = {
      alumnosCurp: curp.toUpperCase(),
      cursosIdCurso: parseInt(cursoId)
    };

    const inscripcionResponse = await fetch(`${API_URL}/api/inscripciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inscripcionData)
    });

    if (!inscripcionResponse.ok) {
      const errorText = await inscripcionResponse.text();
      console.error('❌ Error en inscripción:', errorText);
      
      // Intentar parsear el error
      let errorMsg = 'Error al inscribir al alumno';
      try {
        const errorData = JSON.parse(errorText);
        errorMsg = errorData.error || errorMsg;
      } catch (e) {
        errorMsg = errorText || errorMsg;
      }
      
      return NextResponse.json({
        success: false,
        error: errorMsg,
        message: 'El alumno fue registrado pero no se pudo inscribir al curso'
      }, { status: 500 });
    }

    const inscripcionResult = await inscripcionResponse.json();
    console.log('✅ Inscripción exitosa:', inscripcionResult);

    return NextResponse.json({
      success: true,
      message: `✅ ¡ÉXITO! El alumno "${nombre}" ha sido registrado e inscrito al curso exitosamente`,
      data: {
        alumno: nombre,
        curp: curp.toUpperCase(),
        cursoId: parseInt(cursoId),
        inscripcionAutomatica: true
      }
    });

  } catch (error) {
    console.error('❌ Error general:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Error en el proceso de inscripción'
    }, { status: 500 });
  }
}