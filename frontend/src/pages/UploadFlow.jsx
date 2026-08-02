import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import UploadZone from '../components/UploadZone';
import ProcessingIndicator from '../components/ProcessingIndicator';
import UpgradeModal from '../components/UpgradeModal';

export default function UploadFlow({ onRefreshUser }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const navigate = useNavigate();

  const handleUpload = async ({ file, text_content }) => {
    setError('');
    setIsProcessing(true);

    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }
    if (text_content) {
      formData.append('text_content', text_content);
    }

    try {
      const res = await api.post('/api/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      // Refresh user usage state
      if (onRefreshUser) onRefreshUser();

      // Navigate to created document detail
      setTimeout(() => {
        navigate(`/documents/${res.data.id}`);
      }, 1000);
    } catch (err) {
      setIsProcessing(false);
      if (err.response && err.response.status === 402) {
        setShowUpgradeModal(true);
      } else {
        setError(err.response?.data?.detail || 'Failed to process material. Please check file format and try again.');
      }
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Upload Study Material
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          PDF, photographed notes (image), or pasted text — StudyMate AI will analyze and format everything.
        </p>
      </div>

      {isProcessing ? (
        <ProcessingIndicator />
      ) : (
        <UploadZone onUpload={handleUpload} isUploading={isProcessing} error={error} />
      )}

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgradeSuccess={() => {
          if (onRefreshUser) onRefreshUser();
          alert('Upgraded to Pro! You can now upload unlimited study materials.');
        }}
      />
    </div>
  );
}
