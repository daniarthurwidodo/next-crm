"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { UserForm } from '@/components/ui/userForm';

export default function CreateUserPage() {
  const router = useRouter();

  const handleCreate = async (data: { email: string; plan?: string; password?: string }) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) router.push('/dashboard/users');
      else console.error('Create failed');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Create User</h2>
      <UserForm onSubmit={handleCreate} submitLabel="Create" />
    </div>
  );
}
