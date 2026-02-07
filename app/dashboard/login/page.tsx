"use client";
import { useState } from 'react';
import { loginUser } from '@/lib/utils/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await loginUser(username, password);
    if (res.success && res.token) {
      document.cookie = `token=${res.token}; path=/;`;
      router.push('/dashboard');
    } else {
      setError(res.message || 'Login failed');
    }
  }

  return (
    <main className="max-w-sm mx-auto mt-20">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={handleLogin} className="space-y-4">
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
        <Button type="submit" className="w-full">Login</Button>
      </form>
      <p className="mt-4 text-center text-sm">
        Don&apos;t have an account? <a href="/dashboard/register" className="underline">Register</a>
      </p>
    </main>
  );
}
