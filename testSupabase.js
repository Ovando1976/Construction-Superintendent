require('dotenv').config();
const supabase = require('./src/utils/supabaseClient');

(async () => {
  const { data, error } = await supabase.from('projects').select('*');
  if (error) {
    console.error('Error connecting to Supabase:', error.message);
  } else {
    console.log('Projects:', data);
  }
})();