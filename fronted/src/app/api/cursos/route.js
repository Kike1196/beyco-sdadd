// app/api/cursos/route.js
import { NextResponse } from 'next/server';

export async function GET() {
  console.log("=== 🚀 API /api/cursos -> redirigiendo al backend Spring ===");

  try {
    // Llama al backend de Spring Boot
    const response = await fetch("http://localhost:8080/api/cursos", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("❌ Error en respuesta del backend:", response.status);
      return NextResponse.json(
        { success: false, error: `Error del servidor: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Muestra la estructura completa en la consola de Next.js
    console.log("📦 Cursos recibidos del backend:");
    console.log(JSON.stringify(data, null, 2));

    // 🔧 Normaliza el formato de los datos para que coincidan con el frontend
    // Detecta si los datos vienen dentro de "data" (algunos controladores lo hacen)
    const cursos = Array.isArray(data)
      ? data
      : Array.isArray(data.data)
      ? data.data
      : [];

    // Mapea los nombres de columnas del backend al formato esperado por el frontend
    const cursosNormalizados = cursos.map(curso => ({
      id: curso.id || curso.idCurso || curso.Id_Curso || null,
      nombre: curso.nombre || curso.nombreCurso || curso.Nombre || null,
      lugar: curso.lugar || curso.Lugar || curso.sede || null,
      precio: curso.precio || curso.costo || curso.Precio || curso.Costo || 0,
    }));

    console.log(`✅ ${cursosNormalizados.length} cursos listos para el frontend`);

    return NextResponse.json(cursosNormalizados);

  } catch (error) {
    console.error("💥 Error al conectar con el backend:", error.message);
    return NextResponse.json(
      { success: false, error: "No se pudo conectar al backend" },
      { status: 500 }
    );
  }
}
