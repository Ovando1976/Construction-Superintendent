// backend/controllers/userController.js

const supabaseAdmin = require('../src/utils/supabaseAdminClient');

/**
 * GET all users
 */
exports.getAllUsers = async (req, res) => {
  try {
    // Example: if you have a 'users' table
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json(data);
  } catch (err) {
    console.error('Error getting all users:', err.message);
    return res.status(500).json({ error: 'Failed to fetch users.' });
  }
};

/**
 * GET a single user by ID
 */
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('uuid_id', id) // or eq('id', id) if your PK is 'id'
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json(data);
  } catch (err) {
    console.error('Error fetching user by ID:', err.message);
    return res.status(500).json({ error: 'Failed to fetch user.' });
  }
};

/**
 * POST create a user
 */
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Example insert, if you store hashed passwords or handle them in supabase function, do it here
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([{ name, email, password, role }])
      .select();

    if (error) throw error;
    return res.status(201).json(data[0]);
  } catch (err) {
    console.error('Error creating user:', err.message);
    return res.status(500).json({ error: 'Failed to create user.' });
  }
};

/**
 * PUT update a user
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ name, email, password, role })
      .eq('uuid_id', id)  // or eq('id', id)
      .select();

    if (error) throw error;
    if (!data.length) {
      return res.status(404).json({ error: 'User not found to update.' });
    }
    return res.json(data[0]);
  } catch (err) {
    console.error('Error updating user:', err.message);
    return res.status(500).json({ error: 'Failed to update user.' });
  }
};

/**
 * DELETE remove a user
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('uuid_id', id)
      .select();

    if (error) throw error;
    if (!data.length) {
      return res.status(404).json({ error: 'User not found to delete.' });
    }
    return res.json({ message: 'User deleted.', user: data[0] });
  } catch (err) {
    console.error('Error deleting user:', err.message);
    return res.status(500).json({ error: 'Failed to delete user.' });
  }
};