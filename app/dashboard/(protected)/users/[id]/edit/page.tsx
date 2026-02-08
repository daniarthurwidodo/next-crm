"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { UserForm } from '@/components/ui/userForm';

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const id = (params as any)?.id;

  const [initial, setInitial] = useState<{ email?: string; plan?: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const res = await fetch(`/api/users/${id}`);
        if (res.ok) {
          const data = await res.json();
          setInitial({ email: data.email, plan: data.plan });
        }
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [id]);

  const handleUpdate = async (data: { email: string; plan?: string; password?: string }) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) router.push('/dashboard/users');
      else console.error('Update failed');
    } catch (err) {
      console.error(err);
    }
  };

  if (!initial) return <div>Loading...</div>;

  return (
    <div>
      <h2>Edit User</h2>
      <UserForm initial={initial} onSubmit={handleUpdate} submitLabel="Update" />
    </div>
  );
}
