import { useState } from 'react';
import { ArrowRight, LogOut, PackageCheck, X } from 'lucide-react';
import { api } from './api.js';

export default function AccountPanel({ user, onClose, onSignOut, onOrders, onUpdate }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const form = Object.fromEntries(new FormData(event.currentTarget));
      const result = await api('/auth/me', { method: 'PATCH', body: JSON.stringify(form) });
      onUpdate(result.user);
      setSaved(true);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  return <div className="auth-backdrop" onClick={onClose}><section className="auth-modal account-panel" onClick={(event) => event.stopPropagation()}>
    <button className="detail-close header-icon" onClick={onClose} aria-label="Close account"><X size={19} /></button>
    <span className="eyebrow">SHOPSPHERE / ACCOUNT</span>
    <h2>Your details.</h2>
    <p>Keep your account information up to date.</p>
    <form onSubmit={submit} key={user.email}>
      <label>Full name<input name="name" defaultValue={user.name} autoComplete="name" required /></label>
      <label>Email address<input name="email" type="email" defaultValue={user.email} autoComplete="email" required /></label>
      {error && <span className="auth-error" role="alert">{error}</span>}
      {saved && <span className="account-saved">Details saved.</span>}
      <button className="dark-button" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save details'} <ArrowRight size={15} /></button>
    </form>
    <div className="account-panel-actions"><button onClick={onOrders}><PackageCheck size={15} /> Order history</button><button onClick={onSignOut}><LogOut size={15} /> Sign out</button></div>
  </section></div>;
}
