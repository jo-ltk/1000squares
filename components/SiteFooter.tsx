'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Button } from './ui';

export default function SiteFooter() {
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    setSubscribed(true);
  };

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-top">
          <div className="footer-news">
            <span className="footer-eyebrow">• Newsletter</span>
            <h2>New designs, every week</h2>
          </div>
          <form className="news-form" onSubmit={handleSubscribe}>
            <label htmlFor="news-email" className="sr-only">Email address</label>
            <input id="news-email" className="field" type="email" placeholder="you@example.com" required disabled={subscribed} />
            <Button tone="rust" iconEnd="arrow-forward" type="submit" disabled={subscribed}>
              {subscribed ? 'Subscribed' : 'Subscribe'}
            </Button>
            <span className="newsletter-status" role="status" aria-live="polite">
              {subscribed ? 'Thanks for your interest. Connect a mailing service to receive updates.' : ''}
            </span>
          </form>
        </div>
        <div className="footer-links">
          <nav aria-label="Shop">
            <span className="footer-eyebrow">Shop</span>
            <Link href="/templates/">Wedding invitations</Link><Link href="/templates/">Save the dates</Link>
            <Link href="/templates/">Engagement</Link><Link href="/templates/">Haldi &amp; mehendi</Link>
          </nav>
          <nav aria-label="Company">
            <span className="footer-eyebrow">Company</span>
            <Link href="/#about-us">About us</Link><Link href="/#how-it-works">Become a designer</Link><Link href="/account/">Help centre</Link><Link href="/account/">Contact</Link>
          </nav>
          <nav aria-label="Legal">
            <span className="footer-eyebrow">Legal</span>
            <Link href="/account/">Licence terms</Link><Link href="/account/">Privacy</Link><Link href="/account/">Refunds</Link>
          </nav>
        </div>
        <div className="footer-word">1000<span>SQUARES</span></div>
        <div className="footer-base"><span>© 2026 1000SQUARES</span><span>Made with care in India</span></div>
      </div>
    </footer>
  );
}
