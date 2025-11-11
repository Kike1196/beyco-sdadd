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
        const { searchParams } = new URL(request.url);
        const fechaInicio = searchParams.get('fechaInicio');
        const fechaFin = searchParams.get('fechaFin');
        
        console.log(`🔍 Buscando cursos para instructor ${id}`);
        
        // Verificar que el instructor existe
        const instructores = await query(
            'SELECT * FROM usuarios WHERE Num_Empleado = ? AND Id_Rol = 2 AND Activo = 1',
            [id]
        );
        
        if (instructores.length === 0) {
            console.log(`❌ Instructor ${id} no encontrado`);
            return NextResponse.json({
                success: false,
                error: 'Instructor no encontrado'
            }, { status: 404 });
        }
        
        const instructor = instructores[0];
        console.log(`✅ Instructor encontrado: ${instructor.Nombre} ${instructor.Apellido_paterno}`);
        
        // Obtener cursos del instructor con nombres de columnas CORRECTOS
        let sql = `
            SELECT 
                c.Id_Curso as id,
                c.Nombre_curso as cursoNombre,
                c.Clave_STPS as stps,
                8 as horasImpartidas,  -- Valor por defecto
                c.Fecha_Imparticion as fechaCurso,
                c.Pago as monto,
                'pendiente' as estatus,
                c.Lugar as lugar,
                e.Nombre as empresaNombre
            FROM cursos c
            LEFT JOIN empresas e ON c.Empresa_Id = e.Id
            WHERE c.Instructor_Id = ?
        `;
        
        const queryParams = [id];
        
        if (fechaInicio && fechaFin) {
            sql += ' AND c.Fecha_Imparticion BETWEEN ? AND ?';
            queryParams.push(fechaInicio, fechaFin);
        }
        
        sql += ' ORDER BY c.Fecha_Imparticion DESC';
        
        console.log(`📊 Consulta SQL: ${sql}`);
        
        const cursos = await query(sql, queryParams);
        
        console.log(`✅ Cursos encontrados: ${cursos.length}`);
        
        // Calcular total pendiente
        const totalPendiente = cursos.reduce((total, curso) => {
            return total + parseFloat(curso.monto || 0);
        }, 0);
        
        const responseData = {
            instructorId: parseInt(id),
            instructorNombre: `${instructor.Nombre} ${instructor.Apellido_paterno} ${instructor.Apellido_materno}`,
            instructorEmail: instructor.Correo,
            instructorEspecialidad: 'Instructor',
            cursosPendientes: cursos,
            totalPendiente: totalPendiente,
            totalCursos: cursos.length,
            cursosPendientesCount: cursos.length,
            periodo: { fechaInicio, fechaFin }
        };
        
        console.log(`💰 Total pendiente: $${totalPendiente}`);
        
        return NextResponse.json({
            success: true,
            data: responseData
        });
        
    } catch (error) {
        console.error('❌ Error en API cursos:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}