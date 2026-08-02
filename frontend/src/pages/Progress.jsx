import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import api from '../services/api';
import ProgressChart from '../components/ProgressChart';

export default function Progress() {
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const res = await api.get('/api/progress');
      setProgressData(res.data);
    } catch (err) {
      console.error('Failed to fetch progress data', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <Loader2 size={32} className="animate-pulse" color="var(--primary)" />
        <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>Loading progress report...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Study Progress & Performance Analytics
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Track your revision consistency, quiz score trends, and active study streaks
        </p>
      </div>

      <ProgressChart progressData={progressData} />
    </div>
  );
}
