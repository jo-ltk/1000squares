'use client';

import { useMemo } from 'react';
import { Button, HeroTitle, NavBar, TabBar } from '@/components/ui';
import SiteFooter from '@/components/SiteFooter';
import { useCart } from '@/components/CartProvider';
import { formatPrice, TEMPLATES } from '@/data/templates';

export default function CartClient() {
  const { cartIds, removeFromCart } = useCart();
  const items = useMemo(() => cartIds
    .map((id) => TEMPLATES.find((template) => template.id === id))
    .filter((template) => template !== undefined), [cartIds]);
  const subtotal = items.reduce((total, template) => total + template.price, 0);

  return (
    <>
      <main className="cart-page">
        <div className="container">
          <NavBar
            logoSrc="/images/logo.png"
            links={[{ label: 'Templates', href: '/templates/' }, { label: 'Studio', href: '/#how-it-works' }]}
            cta={{ label: 'Continue browsing', href: '/templates/' }}
          />
        </div>
        <section className="container cart-main">
          <div className="cart-heading">
            <HeroTitle size="l" lines={['Your cart']} />
            <p>{items.length} {items.length === 1 ? 'template' : 'templates'} ready for your next celebration.</p>
          </div>

          {items.length ? (
            <div className="cart-layout">
              <div className="cart-items" aria-label="Cart items">
                {items.map((template) => (
                  <article className="cart-item" key={template.id}>
                    <div className={`cart-preview${template.tone ? ` cart-preview--${template.tone}` : ''}`} style={{ backgroundColor: template.tint }}>
                      <span>{template.names}</span>
                      <small>{template.when}</small>
                    </div>
                    <div className="cart-item-info">
                      <h2>{template.title}</h2>
                      <p>{template.style} · {template.category}</p>
                      <strong>{formatPrice(template.price)}</strong>
                    </div>
                    <Button tone="frost" size="sm" aria-label={`Remove ${template.title} from cart`} onClick={() => removeFromCart(template.id)}>
                      Remove
                    </Button>
                  </article>
                ))}
              </div>
              <aside className="cart-summary" aria-label="Order summary">
                <h2>Summary</h2>
                <div><span>Templates</span><span>{items.length}</span></div>
                <div className="cart-summary-total"><strong>Subtotal</strong><strong>{formatPrice(subtotal)}</strong></div>
                <p>Your cart is saved in this browser.</p>
                <Button tone="rust" href="/templates/">Continue browsing</Button>
              </aside>
            </div>
          ) : (
            <div className="cart-empty">
              <span className="cart-empty-mark" aria-hidden="true">＋</span>
              <h2>Your cart is waiting</h2>
              <p>Slide on a template card to add a design you love.</p>
              <Button tone="rust" iconEnd="arrow-forward" href="/templates/">Browse templates</Button>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
      <TabBar current="Cart" />
    </>
  );
}
