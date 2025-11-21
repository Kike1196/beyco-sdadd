// app/api/alumnos/buscar/route.js
import { NextResponse } from 'next/server';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const apellido = searchParams.get("apellido") || "";
  const curp = searchParams.get("curp") || "";

  console.log(`🔍 Redirigiendo búsqueda de alumnos: apellido=${apellido}, curp=${curp}`);

  try {
    // Llama al backend de Spring Boot
    const backendUrl = `http://localhost:8080/api/alumnos/buscar?apellido=${apellido}&curp=${curp}`;
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      console.error("❌ Error en el backend:", response.status);
      return NextResponse.json(
        { success: false, error: `Error del servidor: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`✅ ${data.length || 0} alumnos recibidos del backend`);

    return NextResponse.json({
      success: true,
      data: data,
    });

  } catch (error) {
    console.error("💥 Error al conectar con el backend:", error.message);
    return NextResponse.json(
      { success: false, error: "No se pudo conectar al backend" },
      { status: 500 }
    );
  }
}
