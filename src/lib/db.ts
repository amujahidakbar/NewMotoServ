import mysql from 'mysql2/promise';

const poolConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

let pool: mysql.Pool;

async function initDB() {
  try {
    // 1. Try to connect to MySQL without specifying a database first
    const connection = await mysql.createConnection(poolConfig);
    
    // 2. Create database if it doesn't exist
    const dbName = process.env.DB_DATABASE || 'motoserv';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.end();

    // 3. Create the connection pool with the database specified
    pool = mysql.createPool({
      ...poolConfig,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    console.log(`Connected to MySQL database "${dbName}" successfully.`);

    // 4. Run migrations to create tables
    await runMigrations();

  } catch (error) {
    console.error('Failed to initialize database connection:', error);
    throw error;
  }
}

async function runMigrations() {
  const connection = await pool.getConnection();
  try {
    // Start transaction for safety
    await connection.beginTransaction();

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create motorcycles table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS motorcycles (
        id VARCHAR(50) PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        brand VARCHAR(255),
        plate VARCHAR(50),
        type VARCHAR(50) NOT NULL,
        current_odo INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create intervals table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS intervals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        motorcycle_id VARCHAR(50) NOT NULL,
        component_name VARCHAR(100) NOT NULL,
        interval_km INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (motorcycle_id) REFERENCES motorcycles(id) ON DELETE CASCADE,
        UNIQUE KEY uq_moto_comp (motorcycle_id, component_name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create last_services table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS last_services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        motorcycle_id VARCHAR(50) NOT NULL,
        component_name VARCHAR(100) NOT NULL,
        last_service_km INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (motorcycle_id) REFERENCES motorcycles(id) ON DELETE CASCADE,
        UNIQUE KEY uq_moto_last (motorcycle_id, component_name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create service_history table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS service_history (
        id VARCHAR(50) PRIMARY KEY,
        motorcycle_id VARCHAR(50) NOT NULL,
        date DATE NOT NULL,
        odometer INT NOT NULL,
        components TEXT NOT NULL, -- Will store stringified JSON array
        cost INT DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (motorcycle_id) REFERENCES motorcycles(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create fuel_logs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS fuel_logs (
        id VARCHAR(50) PRIMARY KEY,
        motorcycle_id VARCHAR(50) NOT NULL,
        date DATE NOT NULL,
        odometer INT NOT NULL,
        liters DOUBLE NOT NULL,
        price INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (motorcycle_id) REFERENCES motorcycles(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create feedbacks table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS feedbacks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        user_email VARCHAR(255) NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.commit();
    console.log('Database tables verified/created successfully.');
  } catch (error) {
    await connection.rollback();
    console.error('Database migration failed, changes rolled back:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Helper query function
export async function query(sql: string, params?: any[]) {
  if (!pool) {
    await initDB();
  }
  const [results] = await pool.execute(sql, params);
  return results;
}

export default {
  query,
  initDB
};
