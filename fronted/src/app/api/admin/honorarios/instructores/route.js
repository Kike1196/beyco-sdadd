import { NextResponse } from 'next/server';

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root', 
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mydb'
};

async function query(sql, params) {
    const mysql = await import('mysql2/promise');
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        console.log('📊 Ejecutando query:', sql);
        const [results] = await connection.execute(sql, params);
        return results;
    } catch (error) {
        console.error('❌ Error en query:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

export async function GET() {
    try {
        console.log('📋 API: Obteniendo instructores...');
        
        // Consulta CORREGIDA con los nombres reales de columnas
        const instructores = await query(`
            SELECT 
                u.Num_Empleado as numEmpleado,
                u.Nombre,
                u.Apellido_paterno as apellidoPaterno,
                u.Apellido_materno as apellidoMaterno,
                u.Correo as email,
                u.Telefono,
                'Instructor' as especialidad,
                COUNT(c.Id_Curso) as totalCursos,
                COUNT(c.Id_Curso) as cursosPendientes,
                COALESCE(SUM(c.Pago), 0) as totalPendiente
            FROM usuarios u
            LEFT JOIN cursos c ON u.Num_Empleado = c.Instructor_Id
            WHERE u.Id_Rol = 2 AND u.Activo = 1
            GROUP BY u.Num_Empleado, u.Nombre, u.Apellido_paterno, u.Apellido_materno, u.Correo
            ORDER BY u.Nombre, u.Apellido_paterno
        `);
        
        console.log(`✅ Instructores encontrados: ${instructores.length}`);
        
        return NextResponse.json({
            success: true,
            data: instructores
        });
    } catch (error) {
        console.error('❌ Error en API instructores:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}