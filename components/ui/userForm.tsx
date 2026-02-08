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

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
      <div style={{ marginBottom: 8 }}>
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%' }} />
      </div>
      <div style={{ marginBottom: 8 }}>
        <label>Plan</label>
        <select value={plan} onChange={(e) => setPlan(e.target.value)} style={{ width: '100%' }}>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
        </select>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Password {initial.email ? '(leave blank to keep)' : ''}</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%' }} />
      </div>
      <Button type="submit" disabled={loading}>{submitLabel}</Button>
    </form>
  );
};
