// src/components/projects/ProjectDocuments.jsx

import React, { useState } from 'react';
import { Button, ListGroup, ProgressBar, Alert } from 'react-bootstrap';
import supabase from '../../utils/supabaseClient'; // Adjust the path based on your project structure

const ProjectDocuments = ({ projectId, documents = [] }) => {
  const [uploading, setUploading] = useState(false);
  // Removed uploadProgress since Supabase doesn't provide real-time upload progress
  const [fileList, setFileList] = useState(documents);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);
      setSuccessMessage(null);

      // Upload the file to the 'relevant-documents' bucket
      const filePath = `${Date.now()}_${file.name}`;
      const { data, error: uploadError } = await supabase.storage
        .from('relevant-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL of the uploaded file
      const { publicURL, error: publicUrlError } = supabase.storage
        .from('relevant-documents')
        .getPublicUrl(data.path);

      if (publicUrlError) {
        throw publicUrlError;
      }

      const newDocURL = publicURL;

      // Update the 'relevant_documents' array using array_append
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          relevant_documents: supabase
            .rpc('array_append', { target_array: 'relevant_documents', element: newDocURL }),
        })
        .eq('uuid_id', projectId);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setFileList([...fileList, newDocURL]);
      setSuccessMessage('Document uploaded successfully.');
    } catch (err) {
      console.error('Upload failed:', err.message);
      setError(err.message || 'Failed to upload document.');
    } finally {
      setUploading(false);
      // Reset the file input
      e.target.value = null;
    }
  };

  // Handle document deletion
  const handleDelete = async (docURL) => {
    try {
      setError(null);
      setSuccessMessage(null);

      // Remove the document URL from the 'relevant_documents' array using array_remove
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          relevant_documents: supabase
            .rpc('array_remove', { target_array: 'relevant_documents', element: docURL }),
        })
        .eq('uuid_id', projectId);

      if (updateError) {
        throw updateError;
      }

      // Optionally, delete the file from Supabase Storage
      // Extract the file path from the URL
      const filePath = decodeURIComponent(new URL(docURL).pathname.substring(1)); // Remove the leading '/'
      const { error: deleteError } = await supabase.storage
        .from('relevant-documents')
        .remove([filePath]);

      if (deleteError) {
        throw deleteError;
      }

      // Update local state
      setFileList(fileList.filter((url) => url !== docURL));
      setSuccessMessage('Document deleted successfully.');
    } catch (err) {
      console.error('Deletion failed:', err.message);
      setError(err.message || 'Failed to delete document.');
    }
  };

  return (
    <div>
      <h5 className="mb-3">Project Documents</h5>

      {/* Display Success Message */}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      {/* Display Error Messages */}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* File Upload Input */}
      <div className="mb-3">
        <input
          type="file"
          onChange={handleFileUpload}
          disabled={uploading}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        />
      </div>

      {/* Uploading Indicator */}
      {uploading && (
        <div className="mb-3">
          <ProgressBar animated now={100} label={`Uploading...`} />
        </div>
      )}

      {/* Document List */}
      {fileList.length ? (
        <ListGroup>
          {fileList.map((docURL, index) => (
            <ListGroup.Item
              key={index}
              className="d-flex justify-content-between align-items-center"
            >
              <a href={docURL} target="_blank" rel="noopener noreferrer">
                Document {index + 1}
              </a>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(docURL)}
              >
                Delete
              </Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      ) : (
        <p>No documents uploaded yet.</p>
      )}
    </div>
  );
};

export default ProjectDocuments;