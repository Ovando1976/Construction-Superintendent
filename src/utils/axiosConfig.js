// src/utils/axiosConfig.js

import axios from 'axios';

// Retrieve these from your Supabase dashboard (Settings > API)
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL; // e.g., https://xyzcompany.supabase.co
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: `${SUPABASE_URL}/rest/v1/`, // Supabase REST API base URL
  headers: {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation', // To get the inserted row back on POST
  },
});

export default axiosInstance;