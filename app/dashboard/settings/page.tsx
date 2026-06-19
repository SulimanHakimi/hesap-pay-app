'use client';

import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [form, setForm] = useState({ store_name: '', store_url: '', hesabpay_api_key: '' });
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(s => {
      setForm(f => ({
        ...f,
        store_name: s.store_name || '',
        store_url: s.store_url || '',
      }));
      setHasKey(!!s.hesabpay_api_key);
    });
  }, []);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const body: any = { store_name: form.store_name, store_url: form.store_url };
    if (form.hesabpay_api_key) body.hesabpay_api_key = form.hesabpay_api_key;
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setSaved(true);
    if (form.hesabpay_api_key) setHasKey(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure your store and payment provider</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-xl">

        {/* Store */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Store Info</h2>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Store Name</label>
            <input type="text" value={form.store_name} onChange={e => set('store_name', e.target.value)} placeholder="My Shop" className="field" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Store URL</label>
            <input type="url" value={form.store_url} onChange={e => set('store_url', e.target.value)} placeholder="https://myshop.com" className="field" />
            <p className="text-xs text-gray-400 mt-1">Used for HesabPay redirect URLs after payment</p>
          </div>
        </section>

        {/* HesabPay */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-xs">HP</span>
            </div>
            <div>
              <h2 className="font-bold text-gray-900">HesabPay</h2>
              <p className="text-xs text-gray-400">api.hesab.com/api/v1</p>
            </div>
            {hasKey && (
              <span className="ml-auto text-xs font-semibold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">✓ Configured</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">API Key</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={form.hesabpay_api_key}
                onChange={e => set('hesabpay_api_key', e.target.value)}
                placeholder={hasKey ? 'Enter new key to update…' : 'Paste your HesabPay API key'}
                className="field pr-16 font-mono text-xs"
              />
              <button type="button" onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-700 transition-colors"
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              HesabPay uses one API host; the key itself determines sandbox vs production.
              Generate keys in the{' '}
              <a href="https://developers-sandbox.hesab.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">sandbox</a>
              {' / '}
              <a href="https://developers.hesab.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">production</a>
              {' '}developer portals.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 leading-relaxed">
            <p className="font-bold mb-2">Sandbox test credentials</p>
            <ul className="space-y-1 font-mono">
              <li>Integration account: <span className="font-bold">777518119</span> &nbsp; PIN: <span className="font-bold">4245</span></li>
              <li>Payment account: <span className="font-bold">792999752</span> &nbsp; PIN: <span className="font-bold">4245</span> &nbsp; (500 AFN balance)</li>
            </ul>
            <p className="mt-2 text-amber-800">
              Log into the sandbox portal with <span className="font-mono font-bold">777518119</span> to manage the sandbox API key.
            </p>
          </div>

          <div className="bg-gray-900 rounded-xl p-4 text-xs font-mono text-gray-300 leading-relaxed overflow-x-auto">
            <p className="text-gray-500 mb-2">// Register this URL in the HesabPay dashboard for both</p>
            <p className="text-gray-500 mb-2">// payment_success and payment_failure events:</p>
            <p className="text-emerald-400">{form.store_url || 'https://yourdomain.com'}/api/hesabpay/webhook</p>
            <p className="text-gray-500 mt-3">// Legacy alias (also accepted):</p>
            <p className="text-gray-400">{form.store_url || 'https://yourdomain.com'}/api/webhook/hesabpay</p>
          </div>
        </section>

        <div className="flex items-center gap-3">
          <button type="submit" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
            Save Settings
          </button>
          {saved && <span className="text-sm text-emerald-600 font-semibold">✓ Saved!</span>}
        </div>
      </form>
    </div>
  );
}
