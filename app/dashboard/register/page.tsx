"use client";
import { useState } from 'react';
import { registerUser } from '@/lib/utils/auth';
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
    const res = await registerUser(username, password);
    if (res.success && res.token) {
      document.cookie = `token=${res.token}; path=/;`;
      router.push('/dashboard');
    } else {
      setError(res.message || 'Registration failed');
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
