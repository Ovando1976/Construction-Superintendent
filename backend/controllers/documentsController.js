// backend/controllers/documentsController.js

const supabaseAdmin = require('../src/utils/supabaseAdminClient');

/**
 * GET all documents
 * Example: If you have a 'documents' table or store them in a 'projects' field, adjust accordingly.
 */
const getAllDocuments = async (req, res) => {
  try {
    // For demonstration, assume you have a 'documents' table:
    const { data, error } = await supabaseAdmin
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching documents:', err.message);
    res.status(500).json({ error: 'Failed to fetch documents.' });
  }
};

/**
 * GET a single document by ID
 */
const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    // If you store docs in 'documents' table with a uuid_id field:
    const { data, error } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('uuid_id', id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Document not found.' });
    }
    res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching document by ID:', err.message);
    res.status(500).json({ error: 'Failed to fetch document.' });
  }
};

/**
 * POST upload a new Document
 * - Expects either a file or a 'documentName' in req.body, etc.
 * - If linking to a project, might use req.body.projectId or req.params.projectId
 */
const uploadDocument = async (req, res) => {
  try {
    // In your original code, you used `req.params.projectId` + `req.file` for the file upload
    // For a simpler approach (no file?), just store docName in a table:
    const { documentName } = req.body;
    if (!documentName) {
      return res.status(400).json({ error: 'documentName is required.' });
    }

    // Insert into "documents" table. If storing file in supabase storage, handle that here.
    const { data, error } = await supabaseAdmin
      .from('documents')
      .insert([{ document_name: documentName }])
      .select();

    if (error) throw error;
    res.status(201).json({
      message: 'Document uploaded successfully.',
      document: data[0],
    });
  } catch (err) {
    console.error('Error uploading document:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * PUT update a document (rename, re-upload, etc.)
 */
const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { documentName } = req.body;

    // Possibly handle file re-upload if needed; here we'll just rename
    const { data, error } = await supabaseAdmin
      .from('documents')
      .update({ document_name: documentName })
      .eq('uuid_id', id)
      .select();

    if (error) throw error;
    if (!data.length) {
      return res.status(404).json({ error: 'Document not found to update.' });
    }

    res.status(200).json({ message: 'Document updated.', document: data[0] });
  } catch (err) {
    console.error('Error updating document:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * DELETE a document
 * - Expects doc ID in req.params.id
 * - If you also store doc references in a 'projects' array, you'd call a procedure or array_remove
 */
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    // Optionally remove from supabase storage if you store a file path
    // For now, just remove from "documents" table
    const { data, error } = await supabaseAdmin
      .from('documents')
      .delete()
      .eq('uuid_id', id)
      .select();

    if (error) throw error;
    if (!data.length) {
      return res.status(404).json({ error: 'Document not found to delete.' });
    }

    res.status(200).json({ message: 'Document deleted.', document: data[0] });
  } catch (err) {
    console.error('Error deleting document:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllDocuments,
  getDocumentById,
  uploadDocument,
  updateDocument,
  deleteDocument,
};