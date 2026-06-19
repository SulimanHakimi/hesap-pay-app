'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get('from') || '/dashboard';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed'); return; }
      router.push(from);
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#1e3a8a 0%,#3730a3 50%,#4f46e5 100%)', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 900, margin: '0 0 6px', letterSpacing: '-0.5px' }}>Sheen Store</h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, margin: 0 }}>Admin Dashboard</p>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 24, padding: 36, boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>Welcome back</h2>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 28px' }}>Sign in to manage your store</p>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 16 }}>⚠️</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#dc2626' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoComplete="username"
                placeholder="admin"
                style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: 12, fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box', transition: 'border 0.15s' }}
                onFocus={e => (e.target.style.borderColor = '#3b82f6')}
                onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '11px 44px 11px 14px', border: '1.5px solid #e5e7eb', borderRadius: 12, fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box', transition: 'border 0.15s' }}
                  onFocus={e => (e.target.style.borderColor = '#3b82f6')}
                  onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 13, fontWeight: 600, padding: 0 }}
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !username || !password}
              style={{
                marginTop: 4, padding: '13px', borderRadius: 12, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                background: loading ? '#93c5fd' : 'linear-gradient(135deg,#2563eb,#4f46e5)',
                color: '#fff', fontWeight: 800, fontSize: 15, transition: 'opacity 0.15s',
                opacity: (!username || !password) ? 0.6 : 1,
                boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
              }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>Protected · Sessions expire in 12h</span>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
          <a href="/store" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>← Back to store</a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense fallback={null}><LoginForm /></Suspense>;
}
