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

export async function GET(request, { params }) {
    try {
        const { id } = params;
        
        console.log(`🔍 Buscando cursos para INSCRIPCIÓN del instructor ${id}`);
        
        // Consulta ESPECÍFICA para inscripción - solo cursos futuros
        const cursos = await query(`
            SELECT 
                c.Id_Curso as id,
                c.Nombre_curso as nombre,
                c.Fecha_Imparticion as fechaIngreso,
                c.Lugar as lugar,
                e.Nombre as empresa,
                c.Instructor_Id as instructorId,
                cat.Examen_practico as examen_practico,
                cat.Horas as horas,
                c.Clave_STPS as stps
            FROM cursos c
            LEFT JOIN empresas e ON c.Empresa_Id = e.Id_Empresa
            LEFT JOIN catalogo_cursos cat ON c.Clave_STPS = cat.Clave_STPS
            WHERE c.Instructor_Id = ?
            AND c.Fecha_Imparticion >= CURDATE()  // Solo cursos futuros
            ORDER BY c.Fecha_Imparticion ASC
        `, [id]);
        
        console.log(`✅ Cursos para inscripción: ${cursos.length}`);
        
        return NextResponse.json({
            success: true,
            cursos: cursos  // Key específica para inscripción
        });
        
    } catch (error) {
        console.error('❌ Error en API cursos:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}