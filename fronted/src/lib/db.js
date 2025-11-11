import mysql from 'mysql2/promise';

// Configuración de la base de datos - usa tus credenciales reales
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root', 
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mydb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

console.log('🔌 Configuración DB:', {
    host: dbConfig.host,
    user: dbConfig.user,
    database: dbConfig.database
});

const pool = mysql.createPool(dbConfig);

export async function query(sql, params) {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log('📊 Ejecutando query:', sql);
        console.log('📊 Parámetros:', params);
        
        const [results] = await connection.execute(sql, params);
        return results;
    } catch (error) {
        console.error('❌ Error en query:', error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
}

export default pool;