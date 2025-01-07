import mysql from 'mysql2/promise';

// Hostinger database configuration
const DB_CONFIG = {
  host: process.env.HOSTINGER_DB_HOST || 'srv685290.hstgr.cloud',
  user: import.meta.env.VITE_HOSTINGER_DB_USER,
  password: import.meta.env.VITE_HOSTINGER_DB_PASSWORD,
  database: import.meta.env.VITE_HOSTINGER_DB_NAME,
  port: 3306,
  ssl: {
    rejectUnauthorized: false
  }
};

const pool = mysql.createPool({ 
  ...DB_CONFIG,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function query<T>(sql: string, params?: any[]): Promise<T> {
  const [rows] = await pool.execute(sql, params);
  return rows as T;
}

export async function transaction<T>(callback: (connection: mysql.Connection) => Promise<T>): Promise<T> {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export default {
  query,
  transaction
};