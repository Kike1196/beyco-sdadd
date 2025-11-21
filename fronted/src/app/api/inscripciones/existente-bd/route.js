import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { curp, cursoId } = body;

    console.log('📝 Inscribiendo alumno existente MEJORADO:', { curp, cursoId });

    if (!curp || !cursoId) {
      return NextResponse.json(
        { error: 'CURP y ID del curso son requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el alumno existe en Spring Boot
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

    // Intentar crear la inscripción via Spring Boot
    let inscripcionCreada = false;
    
    try {
      const relacionData = {
        alumnosCurp: curp.toUpperCase(),
        cursosIdCurso: parseInt(cursoId)
      };

      console.log('🔗 Intentando crear relación via Spring Boot...');
      
      const relacionResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/alumnos-cursos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(relacionData)
      });

      if (relacionResponse.ok) {
        console.log('✅ Relación creada via Spring Boot');
        inscripcionCreada = true;
      } else {
        console.log('❌ No hay endpoint de relaciones en Spring Boot');
      }
    } catch (springError) {
      console.log('❌ Error con Spring Boot relaciones:', springError.message);
    }

    // Si no se pudo crear automáticamente, dar instrucciones manuales
    if (!inscripcionCreada) {
      const comandoSQL = `INSERT INTO alumnos_has_cursos (alumnos_Curp, cursos_Id_Curso) VALUES ('${curp.toUpperCase()}', ${cursoId});`;
      
      return NextResponse.json({
        success: true,
        message: `✅ ALUMNO ENCONTRADO EXITOSAMENTE

🎓 ALUMNO: ${alumnoExistente.nombre}
📧 CURP: ${curp.toUpperCase()}

📋 PARA INSCRIBIR AL CURSO:

1. Abre MySQL:
   mysql -u root -p

2. Ejecuta:
   ${comandoSQL}

3. Verifica:
   SELECT * FROM alumnos_has_cursos WHERE alumnos_Curp = '${curp.toUpperCase()}';

El alumno está listo para ser inscrito manualmente al curso.`,
        data: {
          alumno: alumnoExistente.nombre,
          curp: curp.toUpperCase(),
          cursoId: cursoId,
          comandoSQL: comandoSQL,
          inscripcionManualRequerida: true
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: '✅ ALUMNO INSCRITO EXITOSAMENTE AL CURSO',
      data: {
        alumno: alumnoExistente.nombre,
        cursoId: cursoId
      }
    });

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