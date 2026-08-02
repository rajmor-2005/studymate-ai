import React, { useState } from 'react';
import { UploadCloud, FileText, File, AlertCircle } from 'lucide-react';

export default function UploadZone({ onUpload, isUploading, error }) {
  const [activeTab, setActiveTab] = useState('file'); // 'file' | 'text'
  const [selectedFile, setSelectedFile] = useState(null);
  const [pastedText, setPastedText] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeTab === 'file' && selectedFile) {
      onUpload({ file: selectedFile });
    } else if (activeTab === 'text' && pastedText.trim()) {
      onUpload({ text_content: pastedText.trim() });
    }
  };

  return (
    <div className="card" style={{ maxWidth: '700px', margin: '0 auto' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <button
          onClick={() => setActiveTab('file')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            backgroundColor: activeTab === 'file' ? 'var(--primary-light)' : 'transparent',
            color: activeTab === 'file' ? 'var(--primary)' : 'var(--text-secondary)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UploadCloud size={18} />
            <span>Upload PDF or Image</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('text')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            backgroundColor: activeTab === 'text' ? 'var(--primary-light)' : 'transparent',
            color: activeTab === 'text' ? 'var(--primary)' : 'var(--text-secondary)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} />
            <span>Paste Text Notes</span>
          </div>
        </button>
      </div>

      {error && (
        <div style={{
          backgroundColor: 'var(--danger-light)',
          color: 'var(--danger)',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.9rem'
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {activeTab === 'file' ? (
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            style={{
              border: '2px dashed var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '3rem 1.5rem',
              textAlign: 'center',
              backgroundColor: 'var(--bg-surface-subtle)',
              cursor: 'pointer',
              marginBottom: '1.5rem'
            }}
            onClick={() => document.getElementById('fileInput').click()}
          >
            <input
              id="fileInput"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <UploadCloud size={30} />
            </div>

            {selectedFile ? (
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  Selected: {selectedFile.name}
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  Drag & drop your study material here, or browse
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Supports PDF, PNG, JPG (Photographed notes up to 10MB)
                </p>
              </div>
            )}
          </div>
        ) : (
          <div style={{ marginBottom: '1.5rem' }}>
            <textarea
              rows={8}
              placeholder="Apne study material ka content yahan paste karo..."
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                resize: 'vertical'
              }}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isUploading || (activeTab === 'file' ? !selectedFile : !pastedText.trim())}
          className="btn btn-primary"
          style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
        >
          {isUploading ? 'Processing Material...' : 'Generate Summary & Study Tools ✨'}
        </button>
      </form>
    </div>
  );
}
