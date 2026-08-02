import React, { useState } from 'react';
import { Check, Sparkles, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import UpgradeModal from '../components/UpgradeModal';

export default function Billing({ user, onRefreshUser }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="container" style={{ padding: '3rem 0', maxWidth: '900px' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Subscription & Billing Plans
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
          Choose the plan that fits your study pace. Zero hidden fees.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        {/* Free Tier */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Free Tier</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Great for casual revision</p>
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>₹0</span>
              <span style={{ color: 'var(--text-muted)' }}> / forever</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                <Check size={18} color="var(--success)" />
                <span>3 material uploads / day</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                <Check size={18} color="var(--success)" />
                <span>Bilingual summaries (EN/HI)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                <Check size={18} color="var(--success)" />
                <span>10-MCQ Practice Quizzes</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                <Check size={18} color="var(--success)" />
                <span>Flashcard Decks</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                <Check size={18} color="var(--success)" />
                <span>Document-Grounded Chat</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            {user?.subscription_tier === 'free' ? (
              <span className="badge badge-primary" style={{ display: 'block', textAlign: 'center', padding: '0.6rem' }}>
                Current Active Plan
              </span>
            ) : (
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block', textAlign: 'center' }}>
                Basic Plan
              </span>
            )}
          </div>
        </div>

        {/* Pro Tier */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '2px solid var(--primary)', position: 'relative' }}>
          <div className="badge badge-accent" style={{ position: 'absolute', top: '-0.8rem', right: '1.5rem' }}>
            <Sparkles size={12} style={{ marginRight: '0.2rem' }} /> Recommended
          </div>

          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Pro Plan</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>For serious exam aspirants & teachers</p>
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary)' }}>₹199</span>
              <span style={{ color: 'var(--text-muted)' }}> / month</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', fontWeight: 600 }}>
                <Check size={18} color="var(--success)" />
                <span>UNLIMITED uploads every day</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                <Check size={18} color="var(--success)" />
                <span>Priority fast AI processing</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                <Check size={18} color="var(--success)" />
                <span>Bilingual summaries (EN/HI)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                <Check size={18} color="var(--success)" />
                <span>10-MCQ Practice Quizzes</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                <Check size={18} color="var(--success)" />
                <span>Flashcard Decks</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                <Check size={18} color="var(--success)" />
                <span>Unlimited Grounded Chat</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            {user?.subscription_tier === 'pro' ? (
              <span className="badge badge-success" style={{ display: 'block', textAlign: 'center', padding: '0.6rem', fontSize: '0.95rem' }}>
                <ShieldCheck size={16} style={{ marginRight: '0.3rem' }} /> Pro Member Active
              </span>
            ) : (
              <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
                Upgrade Now via Razorpay
              </button>
            )}
          </div>
        </div>
      </div>

      <UpgradeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onUpgradeSuccess={() => {
          if (onRefreshUser) onRefreshUser();
          alert('Account upgraded to Pro!');
        }}
      />
    </div>
  );
}
