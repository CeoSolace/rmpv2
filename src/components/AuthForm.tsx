"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { z } from 'zod';

export default function AuthForm() {
  const { login, register, loading } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (mode === 'login') {
        // Validate login input
        const loginSchema = z.object({
          email: z.string().email('Invalid email'),
          password: z.string().min(6, 'Password must be at least 6 characters'),
        });
        loginSchema.parse({ email, password });
        await login(email, password);
      } else {
        // Validate registration input
        const registerSchema = z.object({
          email: z.string().email('Invalid email'),
          password: z.string().min(6, 'Password must be at least 6 characters'),
          username: z
            .string()
            .min(3, 'Username must be at least 3 characters')
            .max(20, 'Username must be at most 20 characters')
            .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'),
          displayName: z.string().max(50, 'Display name is too long').optional(),
        });
        registerSchema.parse({ email, password, username, displayName });
        await register(email, password, username, displayName);
      }
    } catch (err: any) {
      if (err?.errors) {
        // zod validation error
        setError(err.errors[0]?.message);
      } else {
        setError(err?.message || 'Something went wrong');
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        {mode === 'login' ? 'Login to RampChat' : 'Create your RampChat account'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-200">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-1 w-full rounded-md bg-gray-700 text-gray-100 border border-gray-600 p-2"
              />
            </div>
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-200">
                Display Name (optional)
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 w-full rounded-md bg-gray-700 text-gray-100 border border-gray-600 p-2"
              />
            </div>
          </>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-200">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full rounded-md bg-gray-700 text-gray-100 border border-gray-600 p-2"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-200">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 w-full rounded-md bg-gray-700 text-gray-100 border border-gray-600 p-2"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-md"
        >
          {loading ? 'Loading…' : mode === 'login' ? 'Login' : 'Register'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-300">
        {mode === 'login' ? (
          <>
            Don't have an account?{' '}
            <button
              className="underline text-blue-400"
              onClick={() => setMode('register')}
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button
              className="underline text-blue-400"
              onClick={() => setMode('login')}
            >
              Log in
            </button>
          </>
        )}
      </p>
    </div>
  );
}