// config/config.js

require('dotenv').config(); // Load environment variables

const getHost = (envVar) => {
  if (!envVar) {
    throw new Error('Environment variable REACT_APP_SUPABASE_URL is not defined.');
  }
  return envVar.replace('https://', '').replace(/\/+$/, ''); // Remove protocol and trailing slashes
};

module.exports = {
  development: {
    username: 'postgres', // Supabase default username
    password: process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY,
    database: 'postgres', // Supabase default database name
    host: getHost(process.env.REACT_APP_SUPABASE_URL), // Remove the protocol and trailing slashes
    port: 5432,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true, // Ensure SSL is used
        rejectUnauthorized: false, // Allow self-signed certificates
      },
    },
  },
  test: {
    username: 'postgres',
    password: process.env.REACT_APP_SUPABASE_KEY,
    database: 'postgres_test',
    host: getHost(process.env.REACT_APP_SUPABASE_URL),
    port: 5432,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
  production: {
    username: 'postgres',
    password: process.env.REACT_APP_SUPABASE_KEY,
    database: 'postgres',
    host: getHost(process.env.REACT_APP_SUPABASE_URL),
    port: 5432,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};