"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const resp = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await resp.json()
      if (resp.ok && data.token) {
        document.cookie = `token=${data.token}; path=/;`;
        router.push('/dashboard');
      } else {
        setError(data.error || 'Registration failed')
      }
    } catch (err: any) {
      setError(err?.message || 'Registration failed')
    }
  }

  return (
    <main className="max-w-sm mx-auto mt-20">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <form onSubmit={handleRegister} className="space-y-4">
        <input
          className="w-full border px-3 py-2 rounded"
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          className="w-full border px-3 py-2 rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {error && <div className="text-red-500">{error}</div>}
        <Button type="submit" className="w-full">Register</Button>
      </form>
      <p className="mt-4 text-center text-sm">
        Already have an account? <a href="/dashboard/login" className="underline">Login</a>
      </p>
    </main>
  );
}
