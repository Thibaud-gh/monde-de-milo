import { useState } from 'react';
import type { FormEvent } from 'react';
import { Capacitor } from '@capacitor/core';
import { supabase } from '../lib/cloud';
export function ParentAuth() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('Éva');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const redirect = Capacitor.isNativePlatform()
    ? 'https://thibaud-gh.github.io/monde-de-milo/?auth=confirm#/parent'
    : `${location.origin}${location.pathname}?auth=confirm#/parent`;
  async function submit(event: FormEvent) {
    event.preventDefault(); if (!supabase) return;
    setBusy(true); setMessage('');
    try {
      if (mode === 'signup') {
        const name = firstName.trim().normalize('NFC');
        if (!name) throw new Error('Please enter your child’s first name.');
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: redirect, data: { child_name: name } } });
        if (error) throw error;
        setPassword('');
        if (!data.session) { setPendingEmail(email.trim()); setMessage('Check your email to confirm your account. Then sign in here with the same email and password.'); setMode('signin'); }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        setPassword('');
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not connect. Please try again.'); }
    finally { setBusy(false); }
  }
  async function resend() {
    if (!supabase || !pendingEmail) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email: pendingEmail, options: { emailRedirectTo: redirect } });
      if (error) throw error;
      setMessage('Confirmation email requested. Please check your inbox and spam folder.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not resend confirmation.'); }
    finally { setBusy(false); }
  }
  return <section className="dashboard-section sign-in"><p className="journal-date">Your family’s little café</p><h1>{pendingEmail ? 'Check your inbox.' : mode === 'signup' ? 'Start your family’s journal.' : 'Welcome back.'}</h1><p>{mode === 'signup' ? 'Create one parent account for the iPad and this dashboard. Your child doesn’t need a login.' : 'Sign in to see your family’s progress. Use the same account on the iPad and dashboard.'}</p>
    {message && <p role="status" className="auth-message">{message}</p>}
    <div className="auth-tabs" role="group" aria-label="Parent account"><button type="button" aria-pressed={mode === 'signin'} disabled={busy} onClick={() => { setMode('signin'); setMessage(''); }}>Sign in</button><button type="button" aria-pressed={mode === 'signup'} disabled={busy} onClick={() => { setMode('signup'); setMessage(''); }}>Create a parent account</button></div>
    <form className="connection-form" onSubmit={submit}>{mode === 'signup' && <label>Child’s first name<input name="childName" maxLength={80} required autoComplete="off" value={firstName} onChange={e => setFirstName(e.target.value)}/><small>Used in Milo’s greetings. One child per parent account for now.</small></label>}<label>Parent email<input name="email" type="email" required autoComplete="username" value={email} onChange={e => setEmail(e.target.value)}/></label><label>Password<input name="password" type="password" minLength={mode === 'signup' ? 8 : 6} required autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)}/>{mode === 'signup' && <small>At least 8 characters.</small>}</label><button className="primary" disabled={busy}>{busy ? 'Connecting…' : mode === 'signup' ? 'Create account' : 'Sign in'}</button>{pendingEmail && mode === 'signin' && <button className="text-button" type="button" disabled={busy} onClick={() => void resend()}>Resend confirmation email</button>}</form></section>;
}
