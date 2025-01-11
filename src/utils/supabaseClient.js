const { createClient } = require('@supabase/supabase-js');

// Use REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('SUPABASE_URL:', supabaseUrl);
console.log('SUPABASE_KEY:', supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  throw new Error('REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY must be set in the environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;