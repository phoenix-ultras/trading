const { Pool } = require('pg');
const env = require('./env');

function getSafeConnectionDetails() {
  try {
    const parsedUrl = new URL(env.databaseUrl);

    return {
      host: parsedUrl.hostname,
      port: parsedUrl.port || '5432',
      database: parsedUrl.pathname.replace(/^\//, ''),
      username: parsedUrl.username || 'postgres'
    };
  } catch (error) {
    return {
      connectionString: 'invalid DATABASE_URL'
    };
  }
}

const pool = new Pool({
  connectionString: env.databaseUrl
});

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error', {
    message: error.message,
    code: error.code,
    connection: getSafeConnectionDetails()
  });
});

async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT current_database() AS database_name, NOW() AS server_time');

    console.log('PostgreSQL connection successful', {
      connection: getSafeConnectionDetails(),
      database: result.rows[0].database_name,
      serverTime: result.rows[0].server_time
    });

    client.release();
  } catch (error) {
    console.error('PostgreSQL connection failed', {
      message: error.message,
      code: error.code,
      connection: getSafeConnectionDetails()
    });

    throw error;
  }
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  testConnection
};
