'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { Button, CtaButton, TabBar } from '@/components/ui';

const ORDERS = [
  { title: 'Quiet linen', id: '#SQ-1042', date: '08 Oct 2026', price: '₹349', tint: '#f2f1ef', status: 'Downloaded', statusClass: '' },
  { title: 'Sunset ticket', id: '#SQ-1027', date: '21 Sep 2026', price: '₹349', tint: '#bc4324', status: 'Sent to 120 guests', statusClass: 'is-soft' },
  { title: 'Ring ceremony', id: '#SQ-0998', date: '30 Aug 2026', price: '₹449', tint: '#ffe1cc', status: 'Printed', statusClass: 'is-dark' }
];

function SettingIcon({ kind }: { kind: 'person' | 'card' | 'bell' | 'mail' | 'globe' | 'help' | 'shield' }) {
  const paths: Record<typeof kind, ReactNode> = {
    person: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>,
    card: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></>,
    bell: <><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></>,
    mail: <><path d="M4 4h16v16H4z" /><path d="m4 8 8 5 8-5" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
    help: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17h.01" /></>,
    shield: <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z" />
  };
  return <svg className="account-row-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[kind]}</svg>;
}

function SettingLink({ kind, label, href, value }: { kind: 'person' | 'card' | 'globe' | 'help' | 'shield'; label: string; href: string; value?: string }) {
  return (
    <Link className="account-row" href={href}>
      <SettingIcon kind={kind} /><span>{label}</span>
      {value && <span className="account-row-value">{value}</span>}
      <svg className="account-row-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
    </Link>
  );
}

export default function AccountClient() {
  const [name, setName] = useState('Ananya Sharma');
  const [email, setEmail] = useState('ananya.sharma@example.com');
  const [editing, setEditing] = useState(false);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [designEmails, setDesignEmails] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('1000squares:profile');
      if (!stored) return;
      const profile: unknown = JSON.parse(stored);
      if (profile && typeof profile === 'object' && 'name' in profile && typeof profile.name === 'string' && 'email' in profile && typeof profile.email === 'string') {
        setName(profile.name);
        setEmail(profile.email);
      }
    } catch {
      // Continue with the supplied demo profile if local storage is unavailable.
    }
  }, []);

  const saveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      window.localStorage.setItem('1000squares:profile', JSON.stringify({ name, email }));
      setStatusMessage('Profile saved in this browser.');
    } catch {
      setStatusMessage('Profile updated for this session.');
    }
    setEditing(false);
  };

  const togglePreference = (preference: 'orders' | 'news') => {
    if (preference === 'orders') setOrderUpdates((enabled) => !enabled);
    else setDesignEmails((enabled) => !enabled);
  };

  return (
    <>
      <main className="mobile-page account-page">
        <header className="mobile-page-header">
          <Link href="/" aria-label="1000SQUARES home"><img src="/images/logo.png" alt="1000SQUARES" /></Link>
          <Link className="account-settings-link" href="#settings">Settings</Link>
        </header>

        <div className="account-cover"><span>• Your account</span></div>
        <section className="account-profile" id="profile">
          <div className="account-person">
            <div className="account-avatar" aria-hidden="true">AS</div>
            <div className="account-person-copy">
              {editing ? (
                <form className="account-edit-form" onSubmit={saveProfile}>
                  <label>Name<input value={name} onChange={(event) => setName(event.target.value)} required /></label>
                  <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
                  <Button type="submit" size="sm">Save profile</Button>
                </form>
              ) : (
                <>
                  <h1>{name}</h1>
                  <span>{email}</span>
                  <span className="account-member-pill">Member since Aug 2026</span>
                </>
              )}
            </div>
          </div>
          {!editing && (
            <div className="account-stats">
              <Link href="/saved/"><strong>4</strong><span>Saved</span></Link>
              <Link href="/saved/"><strong>2</strong><span>Designs</span></Link>
              <a href="#orders"><strong>3</strong><span>Orders</span></a>
            </div>
          )}
          {!editing && <Button tone="frost" icon="edit" onClick={() => { setStatusMessage(''); setEditing(true); }}>Edit profile</Button>}
          <span className="account-status" role="status" aria-live="polite">{statusMessage}</span>
        </section>

        <section className="account-promo sq-glass sq-tone-ink">
          <span className="account-promo-eyebrow">• 1000SQUARES Pro</span>
          <h2>Unlimited templates for your whole wedding</h2>
          <p>Every invite, save-the-date and menu card for ₹1,999. One-time payment.</p>
          <div><CtaButton tone="rust" href="/templates/">Explore templates</CtaButton></div>
        </section>

        <section className="account-section" id="orders">
          <div className="account-section-heading"><span className="account-eyebrow">• Recent orders</span><Link href="/templates/">View all</Link></div>
          <div>
            {ORDERS.map((order) => (
              <article className="account-order" key={order.id}>
                <div className="account-order-thumb" style={{ background: order.tint }} aria-hidden="true" />
                <div className="account-order-copy">
                  <strong>{order.title}</strong><span>{order.id} · {order.date}</span>
                  <span className={`account-order-status ${order.statusClass}`}>{order.status}</span>
                </div>
                <span className="account-order-price">{order.price}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="account-section account-preferences" id="settings">
          <span className="account-eyebrow">• Settings</span>
          <div>
            <SettingLink kind="person" label="Personal details" href="#profile" />
            <SettingLink kind="card" label="Payment methods" href="/account/#settings" value="UPI · Visa 4242" />
            <div className="account-row">
              <SettingIcon kind="bell" /><span id="lbl-order-updates">Order updates</span>
              <button type="button" className="switch" role="switch" aria-labelledby="lbl-order-updates" aria-checked={orderUpdates} onClick={() => togglePreference('orders')}><i /></button>
            </div>
            <div className="account-row">
              <SettingIcon kind="mail" /><span id="lbl-design-emails">New design emails</span>
              <button type="button" className="switch" role="switch" aria-labelledby="lbl-design-emails" aria-checked={designEmails} onClick={() => togglePreference('news')}><i /></button>
            </div>
            <SettingLink kind="globe" label="Language" href="/account/#settings" value="English" />
            <SettingLink kind="help" label="Help centre" href="/#about-us" />
            <SettingLink kind="shield" label="Privacy & licence terms" href="/#about-us" />
          </div>
          <Link className="account-log-out" href="/">Log out</Link>
          <span className="account-version">1000SQUARES · version 1.0</span>
        </section>
      </main>
      <TabBar current="Account" />
    </>
  );
}

