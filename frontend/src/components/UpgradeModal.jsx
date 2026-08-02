import React, { useState } from 'react';
import { Sparkles, Check, X, ShieldCheck } from 'lucide-react';
import api from '../services/api';

export default function UpgradeModal({ isOpen, onClose, onUpgradeSuccess }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleRazorpayUpgrade = async () => {
    setLoading(true);
    try {
      // 1. Create order from backend
      const res = await api.post('/api/payments/create-order');
      const { order_id, amount, currency, key_id } = res.data;

      // 2. Configure Razorpay checkout options
      const options = {
        key: key_id,
        amount: amount,
        currency: currency,
        name: 'StudyMate AI',
        description: 'Pro Plan — Unlimited Uploads & Features',
        order_id: order_id,
        handler: async function (response) {
          // 3. Send webhook/captured callback simulation to backend
          await api.post('/api/payments/webhook', {
            event: 'payment.captured',
            payload: {
              payment: {
                entity: {
                  id: response.razorpay_payment_id || `pay_sim_${Date.now()}`,
                  order_id: response.razorpay_order_id || order_id,
                  notes: { user_id: JSON.parse(localStorage.getItem('studymate_user') || '{}').id }
                }
              }
            }
          });

          onUpgradeSuccess();
          onClose();
        },
        prefill: {
          name: JSON.parse(localStorage.getItem('studymate_user') || '{}').name || 'Student',
          email: JSON.parse(localStorage.getItem('studymate_user') || '{}').email || ''
        },
        theme: {
          color: '#3730A3'
        }
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Fallback for direct test mode upgrade in dev
        await api.post('/api/payments/webhook', {
          event: 'payment.captured',
          payload: {
            payment: {
              entity: {
                id: `pay_test_${Date.now()}`,
                order_id: order_id,
                notes: { user_id: JSON.parse(localStorage.getItem('studymate_user') || '{}').id }
              }
            }
          }
        });
        onUpgradeSuccess();
        onClose();
      }
    } catch (err) {
      alert('Payment initialization failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1rem'
    }}>
      <div className="card animate-fade-in" style={{ maxWidth: '500px', width: '100%', position: 'relative' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--text-muted)' }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-light)',
            color: 'var(--accent)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.75rem'
          }}>
            <Sparkles size={32} />
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Upgrade to StudyMate Pro
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Daily limit reached! Unlock unlimited study uploads for ₹199/month.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
          {[
            'Unlimited document uploads every day',
            'Priority fast AI summary & quiz processing',
            'Bilingual English & Hinglish summaries',
            'Unlimited grounded document chat',
            'Export summary & flashcards'
          ].map((feature, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
              <Check size={18} color="var(--success)" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>₹199</span>
          <span style={{ color: 'var(--text-muted)' }}> / month</span>
        </div>

        <button
          onClick={handleRazorpayUpgrade}
          disabled={loading}
          className="btn btn-accent"
          style={{ width: '100%', padding: '1rem', fontSize: '1.05rem' }}
        >
          <ShieldCheck size={20} />
          <span>{loading ? 'Opening Razorpay...' : 'Upgrade Now via Razorpay'}</span>
        </button>
      </div>
    </div>
  );
}
