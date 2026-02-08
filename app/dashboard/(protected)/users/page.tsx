"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table } from '../../../../components/ui/table';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  plan?: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) await load();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Users</h2>
        <Button onClick={() => router.push('/dashboard/users/create')}>Create User</Button>
      </div>
      {loading ? <div>Loading...</div> : (
        <Table
          columns={[
            { header: 'Email', accessor: 'email' },
            { header: 'Plan', accessor: 'plan' },
            {
              header: 'Actions',
              accessor: 'actions',
              render: (user: User) => (
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button size="sm" onClick={() => router.push(`/dashboard/users/${user.id}/edit`)}>Edit</Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(user.id)}>Delete</Button>
                </div>
              ),
            },
          ]}
          data={users}
        />
      )}
    </div>
  );
}
