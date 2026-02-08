"use client";

import React, { useState } from 'react';
import { Button } from './button';

interface UserFormProps {
  initial?: { email?: string; plan?: string };
  onSubmit: (data: { email: string; plan?: string; password?: string }) => Promise<void>;
  submitLabel?: string;
}

export const UserForm: React.FC<UserFormProps> = ({ initial = {}, onSubmit, submitLabel = 'Save' }) => {
  const [email, setEmail] = useState(initial.email || '');
  const [plan, setPlan] = useState(initial.plan || 'free');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ email, plan, password: password || undefined });
    } finally {
      setLoading(false);
    }
  };
  const inputStyle: React.CSSProperties = {
    width: '100%',
    border: '1px solid #d1d5db',
    padding: '8px 10px',
    borderRadius: 6,
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = { display: 'block', marginBottom: 6, fontSize: 14 };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Plan</label>
          <select value={plan} onChange={(e) => setPlan(e.target.value)} style={inputStyle}>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
          </select>
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Password {initial.email ? '(leave blank to keep)' : ''}</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
        </div>
      </div>

      <Button type="submit" disabled={loading}>{submitLabel}</Button>
    </form>
  );
};
