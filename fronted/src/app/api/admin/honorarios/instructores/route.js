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

    // Validar campos requeridos
    if (
      !curp || !nombre || !apellidoPaterno || !apellidoMaterno ||
      !fechaNacimiento || !puesto || !estadoNacimiento || !rfc || !cursoId
    ) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    console.log(`📝 Enviando datos al backend Spring: ${nombre} ${apellidoPaterno}`);

    // Enviar al backend de Spring Boot
    const response = await fetch('http://localhost:8080/api/alumnos/registrar-completo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        curp: curp.toUpperCase(),
        nombre,
        apellidoPaterno,
        apellidoMaterno,
        fechaNacimiento,
        puesto,
        estadoNacimiento,
        rfc: rfc.toUpperCase(),
        cursoId
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error del backend:', errorData);
      return NextResponse.json(
        { error: errorData.message || 'Error del servidor' },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('✅ Respuesta del backend:', result);

    return NextResponse.json({
      success: true,
      message: 'Alumno registrado e inscrito exitosamente',
      data: result
    });

  } catch (error) {
    console.error('❌ Error al conectar con el backend:', error);
    return NextResponse.json(
      { error: 'No se pudo conectar al servidor' },
      { status: 500 }
    );
  }
}