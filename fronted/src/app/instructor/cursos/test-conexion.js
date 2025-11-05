// app/instructor/cursos/test-conexion.js (archivo temporal para pruebas)
export async function testConexionBackend() {
    try {
        const response = await fetch('http://localhost:8080/api/instructor-cursos/instructor/3');
        console.log('🔧 Estado de respuesta:', response.status);
        console.log('🔧 Headers:', response.headers);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Conexión exitosa. Datos:', data);
            return data;
        } else {
            console.error('❌ Error en respuesta:', response.statusText);
            return null;
        }
    } catch (error) {
        console.error('💥 Error de conexión:', error);
        return null;
    }
}