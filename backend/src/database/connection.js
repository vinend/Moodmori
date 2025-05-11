require('dotenv').config();
const { Pool } = require('pg');

// Create a connection pool with robust configuration
const pool = new Pool({
  connectionString: process.env.PG_CONNECTION_STRING,
  max: 50,               // Maximum number of clients
  idleTimeoutMillis: 60000,  // Close idle clients after 30 seconds
  connectionTimeoutMillis: 60000, // Return an error after 10 seconds if connection not established
  maxUses: 7500          // Close a connection after it has been used this many times (prevents memory leaks)
});

// Handle pool errors to prevent application crashes
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client:', err);
  // Don't crash the server on connection errors
});

// Create a wrapper function for queries with retry logic
const query = async (text, params) => {
  let retries = 3;
  let lastError = null;

  while (retries > 0) {
    let client = null;
    
    try {
      // Acquire a client from the pool
      client = await pool.connect();
      
      // Execute the query
      const result = await client.query(text, params);
      
      // Release the client back to the pool
      client.release();
      
      // Return the result if successful
      return result;
    } catch (err) {
      // If we got a client before the error, release it
      if (client) client.release(true); // true = reject the client from the pool

      lastError = err;
      
      if (
        err.code === 'ECONNREFUSED' ||
        err.code === 'ETIMEDOUT' ||
        err.code === 'EPIPE' ||
        err.code === '57P01' || // Database server closed connection
        err.message.includes('terminated unexpectedly') ||
        err.message.includes('Connection terminated') ||
        err.message.includes('Connection reset') ||
        err.message.includes('Connection refused')
      ) {
        // For connection issues, wait before retrying
        console.error(`Database connection error (retries left: ${retries-1}):`, err.message);
        await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
      } else {
        // For query syntax errors or other non-connection issues, don't retry
        throw err;
      }
    }
    
    retries--;
  }

  // If we've exhausted all retries, throw the last error
  console.error('All database query retries failed:', lastError.message);
  throw lastError;
};

// Test connection and reconnect mechanism
const testConnection = async () => {
  try {
    // Simple query to test connection
    const result = await query('SELECT NOW() as now');
    console.log(`Connected to PostgreSQL database (server time: ${result.rows[0].now})`);
    return true;
  } catch (err) {
    console.error('Failed to connect to PostgreSQL database:', err.message);
    console.log('Will try to reconnect on next query');
    return false;
  }
};

// Initial connection test
testConnection();

// Create a keepalive function that runs periodically
setInterval(async () => {
  try {
    const result = await query('SELECT 1');
    // Successful ping, no action needed
  } catch (err) {
    console.error('Database keep-alive ping failed:', err.message);
  }
}, 60000); // Check every minute

// Export the query wrapper instead of the pool directly
module.exports = {
  query,
  pool,
  testConnection
};