"use client";

import React, { useState } from 'react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { UserForm } from '@/components/ui/userForm';

export default function CreateUserPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<string[] | null>(null);

  const createUserSchema = z.object({
    email: z.string().email('Invalid email'),
    plan: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  });

  type CreateUser = z.infer<typeof createUserSchema>;

  const handleCreate = async (data: CreateUser) => {
    const parsed = createUserSchema.safeParse(data);
    if (!parsed.success) {
      setErrors(parsed.error.errors.map(e => `${e.message}${e.path && e.path.length ? ` (${e.path.join('.')})` : ''}`));
      return;
    }

    setErrors(null);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      if (res.ok) router.push('/dashboard/users');
      else {
        const json = await res.json().catch(() => null);
        console.error('Create failed', json || res.statusText);
        setErrors([json?.message || 'Create failed']);
      }
    } catch (err) {
      console.error(err);
      setErrors([String(err)]);
    }
  };

  return (
    <div>
      <h2>Create User</h2>
      {errors && (
        <div style={{ color: 'var(--red, #c00)', marginBottom: 12 }}>
          <ul>
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}
      <UserForm onSubmit={handleCreate} submitLabel="Create" />
    </div>
  );
}
