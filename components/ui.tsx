'use client';

import { useEffect, useState, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ElementType, type ReactNode } from 'react';
import Link from 'next/link';
import FlipCard from './FlipCard';
import StaggeredText from './StaggeredText';
import { useScrollReveal } from './useScrollReveal';
import { ICONS, type IconName } from './icons';
import { formatPrice, type Template, type Tint } from '@/data/templates';
import { useSavedTemplates } from './SavedTemplatesProvider';
import { useCart } from './CartProvider';

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');
type ButtonTone = 'rust' | 'soft' | 'ink' | 'frost';
type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonBaseProps = {
  tone?: ButtonTone;
  size?: ButtonSize;
  icon?: IconName;
  iconEnd?: IconName;
  className?: string;
  children: ReactNode;
};
type ButtonProps = ButtonBaseProps & (
  | ({ href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps | 'href'>)
  | ({ href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>)
);

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg className={cx('sq-icon', className)} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={ICONS[name]} />
    </svg>
  );
}

/** Shared glass button. Pass href to render a link, or button attributes for an action. */
export function Button(props: ButtonProps) {
  const { tone = 'rust', size = 'md', icon, iconEnd, href, className, children, ...rest } = props;
  const classes = cx('sq-btn sq-glass sq-press sq-focus', `sq-btn-${size}`, `sq-tone-${tone}`, className);
  const inner = (
    <>
      {icon && <Icon name={icon} />}
      <span>{children}</span>
      {iconEnd && <Icon name={iconEnd} />}
    </>
  );

  if (href) {
    const anchorProps = rest as Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps | 'href'>;
    return <Link href={href} className={classes} {...anchorProps}>{inner}</Link>;
  }

  const buttonProps = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return <button type="button" className={classes} {...buttonProps}>{inner}</button>;
}

export function CtaButton({ tone = 'frost', href = '#', className, children }: {
  tone?: ButtonTone;
  href?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={cx('sq-cta sq-glass sq-press sq-focus', `sq-tone-${tone}`, className)}>
      <span>{children}</span>
      <span className="sq-cta-box"><Icon name="arrow-forward" /></span>
    </Link>
  );
}

export function IconButton({ icon, label, tone = 'soft', size = 'md', className, ...rest }: {
  icon: IconName;
  label: string;
  tone?: ButtonTone;
  size?: ButtonSize;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" aria-label={label} title={label}
      className={cx('sq-ib sq-glass sq-press sq-focus', `sq-ib-${size}`, `sq-tone-${tone}`, className)} {...rest}>
      <Icon name={icon} />
    </button>
  );
}

type ToolbarItem = { icon: IconName; label: string; onClick?: () => void };
export function Toolbar({ items = [], tone = 'soft', label = 'Actions' }: {
  items?: ToolbarItem[];
  tone?: ButtonTone;
  label?: string;
}) {
  return (
    <div role="toolbar" aria-label={label} className={cx('sq-tb sq-glass', `sq-tone-${tone}`)}>
      {items.map((item) => (
        <button key={item.label} type="button" className="sq-tb-item sq-focus" aria-label={item.label} title={item.label} onClick={item.onClick}>
          <Icon name={item.icon} />
        </button>
      ))}
    </div>
  );
}

export function TintSwatch({ options, value, defaultValue = 0, onChange, label = 'Colour' }: {
  options: Tint[];
  value?: number;
  defaultValue?: number;
  onChange?: (index: number, tint: Tint) => void;
  label?: string;
}) {
  const [inner, setInner] = useState(defaultValue);
  const current = value ?? inner;
  return (
    <div role="radiogroup" aria-label={label} className="sq-tints">
      {options.map((option, index) => (
        <button key={option.label} type="button" role="radio" aria-checked={index === current} aria-label={option.label} title={option.label}
          className="sq-tint sq-glass sq-press"
          style={{ background: `radial-gradient(80% 80% at 50% 25%, rgba(255,255,255,.75), rgba(255,255,255,0) 70%), ${option.color}` }}
          onClick={() => { setInner(index); onChange?.(index, option); }} />
      ))}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="sq-eyebrow">{children}</span>;
}

export function SectionHeader({ eyebrow, title, action }: {
  eyebrow: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <header className="sq-sh">
      <Eyebrow>{eyebrow}</Eyebrow>
      <StaggeredText as="h2" text={title} />
      {action || <span />}
    </header>
  );
}

type HeroLine = string | { image?: string; alt?: string; color?: string };
export function HeroTitle({ lines, size = 'xl', as: Tag = 'h1', className }: {
  lines: HeroLine[];
  size?: 'xl' | 'l';
  as?: ElementType;
  className?: string;
}) {
  const { ref: revealRef, ready, visible } = useScrollReveal<HTMLSpanElement>();

  return (
    <Tag
      className={cx('sq-hero', `sq-hero-${size}`, className)}
      data-text-reveal-ready={ready}
      data-text-reveal-visible={visible}
    >
      {lines.map((line, index) => typeof line === 'string'
        ? <span key={index} ref={index === 0 ? revealRef : undefined}>{line}</span>
        : <span key={index} ref={index === 0 ? revealRef : undefined} className="sq-hero-chip" role={line.alt ? 'img' : undefined} aria-label={line.alt || undefined}
            style={line.image ? { backgroundImage: `url(${line.image})` } : { background: line.color }} />)}
    </Tag>
  );
}

type IndexItem = { label: string; href?: string };
export function IndexList({ title, items }: { title?: string; items: IndexItem[] }) {
  return (
    <nav aria-label={title || 'Index'}>
      {title && <p className="sq-il-title">{title}</p>}
      <ul className="sq-il">
        {items.map((item, index) => (
          <li key={item.label}>
            {item.href ? <Link href={item.href} className="sq-focus">{item.label}</Link> : <span>{item.label}</span>}
            <span className="sq-num">{String(index + 1).padStart(2, '0')}</span>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export type NavLinkItem = { label: string; href: string; current?: boolean };
export function NavBar({ logoSrc, links = [], cta, className }: {
  logoSrc?: string;
  links?: NavLinkItem[];
  cta?: { label: string; href: string };
  className?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartIds } = useCart();
  const half = Math.ceil(links.length / 2);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const renderLink = (link: NavLinkItem) => (
    <Link key={link.label} href={link.href} className="sq-focus" aria-current={link.current ? 'page' : undefined} onClick={() => setMenuOpen(false)}>
      {link.label}
    </Link>
  );

  return (
    <header className={cx('sq-nav', className)}>
      <Link href="/" aria-label="1000SQUARES home" onClick={() => setMenuOpen(false)}>
        {logoSrc ? <img className="sq-nav-logo" src={logoSrc} alt="1000SQUARES" /> : <span className="sq-nav-word">1000SQUARES</span>}
      </Link>
      <nav className="sq-nav-links" aria-label="Primary navigation">
        {links.slice(0, half).map(renderLink)}
        <span className="sq-nav-mark" aria-hidden="true"><i /></span>
        {links.slice(half).map(renderLink)}
      </nav>
      <div className="sq-nav-end">
        <Link href="/cart/" className="sq-nav-cart sq-focus" aria-label={`Cart, ${cartIds.length} ${cartIds.length === 1 ? 'template' : 'templates'}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 2-1.6L22 8H6" />
            <circle cx="10" cy="21" r="1" /><circle cx="18" cy="21" r="1" />
          </svg>
          <span>Cart</span>
          <span className="sq-nav-cart-count" aria-hidden="true">{cartIds.length}</span>
        </Link>
        {cta && <CtaButton tone="frost" href={cta.href}>{cta.label}</CtaButton>}
        <button type="button" className={cx('sq-burger sq-focus', menuOpen && 'is-open')} aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen} aria-controls="mobile-primary-navigation" onClick={() => setMenuOpen((open) => !open)}>
          <i /><i /><i />
        </button>
      </div>
      {menuOpen && (
        <nav className="sq-nav-mobile-menu" id="mobile-primary-navigation" aria-label="Menu">
          {links.map(renderLink)}
          {cta && <CtaButton tone="frost" href={cta.href}>{cta.label}</CtaButton>}
        </nav>
      )}
    </header>
  );
}

export function LogoStrip({ items, label = 'Partners' }: { items: string[]; label?: string }) {
  const renderItems = (copy = false) => items.map((name, index) => (
    <div key={`${copy ? 'copy-' : ''}${name}-${index}`} className="sq-ls-tile" role="listitem">
      <span className="sq-ls-name">{name}</span>
    </div>
  ));

  return (
    <div className="sq-ls" role="region" aria-label={label}>
      <div className="sq-ls-track">
        <div className="sq-ls-group" role="list" aria-label={label}>{renderItems()}</div>
        {[0, 1, 2].map((copy) => (
          <div className="sq-ls-group" aria-hidden="true" key={`copy-${copy}`}>{renderItems(true)}</div>
        ))}
      </div>
    </div>
  );
}

const TAB_ICONS = {
  Home: <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />,
  Templates: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>,
  Cart: <><path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 2-1.6L22 8H6" /><circle cx="10" cy="21" r="1" /><circle cx="18" cy="21" r="1" /></>,
  Saved: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
  Account: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>
} satisfies Record<'Home' | 'Templates' | 'Cart' | 'Saved' | 'Account', ReactNode>;
type TabName = keyof typeof TAB_ICONS;
const TABS: Array<{ name: TabName; href: string }> = [
  { name: 'Home', href: '/' }, { name: 'Templates', href: '/templates/' }, { name: 'Cart', href: '/cart/' },
  { name: 'Saved', href: '/saved/' }, { name: 'Account', href: '/account/' }
];

export function TabBar({ current, hideUntilHeroPassed = false }: { current: TabName; hideUntilHeroPassed?: boolean }) {
  const [heroVisible, setHeroVisible] = useState(hideUntilHeroPassed);

  useEffect(() => {
    if (!hideUntilHeroPassed) return;
    const hero = document.querySelector('.page-home .hero');
    if (!hero || !('IntersectionObserver' in window)) {
      setHeroVisible(false);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setHeroVisible(entry.isIntersecting), { threshold: 0 });
    observer.observe(hero);
    return () => observer.disconnect();
  }, [hideUntilHeroPassed]);

  return (
    <nav aria-label="App" className={cx('tabbar sq-glass sq-tone-frost', hideUntilHeroPassed && heroVisible && 'is-hero-hidden')}>
      {TABS.map(({ name, href }) => (
        <Link key={name} className="tab" href={href} aria-current={current === name ? 'page' : undefined}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{TAB_ICONS[name]}</svg>
          <span>{name}</span>
        </Link>
      ))}
    </nav>
  );
}

/** Product tile with an invitation preview drawn in type, matching the supplied mockups. */
export function TemplateCard({ t, compact = false }: { t: Template; compact?: boolean }) {
  const { savedIds, toggleSaved } = useSavedTemplates();
  const { cartIds, addToCart } = useCart();
  const [detailsShown, setDetailsShown] = useState(false);
  const saved = savedIds.includes(t.id);
  const inCart = cartIds.includes(t.id);
  const discovery = t.age <= 2
    ? { kind: 'new', label: 'New arrival' }
    : t.rank <= 3
      ? { kind: 'popular', label: 'Popular pick' }
      : { kind: 'customise', label: 'Ready to customise' };
  return (
    <article className={cx('sq-card', compact && 'is-compact')}>
      <div className="sq-card-art" style={{ background: t.tint }}>
        <FlipCard
          className="template-flip-card"
          flipped={detailsShown}
          onFlipChange={setDetailsShown}
          ariaLabel={`Flip ${t.title} preview for details`}
          axis="y"
          flipOnClick
          draggable
          dragDistance={0}
          tilt
          tiltMax={8}
          glare
          glareOpacity={0.14}
          hoverScale={1.02}
          perspective={1000}
          width={300}
          height={400}
          radius={0}
          background={t.tint}
          color={t.tone === 'dark' ? '#f4f1ee' : t.tone === 'rust' ? '#ffffff' : '#121212'}
          shadow={false}
          front={(
            <div className={cx('inv', t.tone && `inv-${t.tone}`)}>
              <span className="inv-kicker">{t.kicker}</span>
              <span className="inv-names">{t.names}</span>
              <span className="inv-when">{t.when}</span>
            </div>
          )}
          back={(
            <div className={cx('template-card-back', t.tone && `template-card-back--${t.tone}`)}>
              <p className="template-card-back__eyebrow">Design details</p>
              <h3>{t.title}</h3>
              <p className="template-card-back__meta">{t.category} · {t.style}</p>
              <div className="template-card-back__rule" />
              <p className="template-card-back__names">{t.names}</p>
              <p className="template-card-back__date">{t.when}</p>
              <p className="template-card-back__price">{formatPrice(t.price)}</p>
              <p className="template-card-back__hint">Tap or drag to turn back</p>
            </div>
          )}
        />
        <div className="sq-card-discovery" data-kind={discovery.kind}>
          <span className="sq-card-discovery__mark" aria-hidden="true">
            {discovery.kind === 'new' ? '✦' : discovery.kind === 'popular' ? '↗' : <Icon name="edit" />}
          </span>
          <span className="sq-card-discovery__label">{discovery.label}</span>
        </div>
        <button type="button" aria-pressed={saved} aria-label={saved ? 'Remove from saved' : 'Save template'}
          className={cx('sq-card-fav sq-ib sq-glass sq-press sq-focus', saved ? 'sq-tone-rust' : 'sq-tone-frost')}
          onClick={() => toggleSaved(t.id)}>
          <Icon name="favorite" />
        </button>
      </div>
      <div className="sq-card-body">
        <h3 className="sq-card-title">{t.title}</h3>
        <div className="sq-card-meta">
          <span>{t.meta ?? `${t.style} · ${t.category.replace(/s$/, '')}`}</span>
          <span className="sq-card-price">{formatPrice(t.price)}</span>
        </div>
        <div className="sq-card-actions">
          <button
            type="button"
            className="sq-card-add"
            aria-label={inCart ? `${t.title} added to cart` : `Add ${t.title} to cart`}
            disabled={inCart}
            onClick={() => addToCart(t.id)}
          >
            <span className="sq-card-add__icon" aria-hidden="true">
              {inCart ? (
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="m5 12 4.5 4.5L19 7" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M3 3h2l2.2 11.1a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 1.9-1.4L22 8H6" />
                  <circle cx="10" cy="20" r="1.4" />
                  <circle cx="18" cy="20" r="1.4" />
                </svg>
              )}
            </span>
            <span className="sq-card-add__label" data-added={inCart || undefined}>{inCart ? 'Added to cart' : 'Add to cart'}</span>
          </button>
          <button
            type="button"
            className="sq-card-more"
            aria-label={detailsShown ? `Show ${t.title} preview` : `View ${t.title} details`}
            aria-pressed={detailsShown}
            onClick={() => setDetailsShown(value => !value)}
          >
            <Icon name="arrow-forward" />
          </button>
        </div>
      </div>
    </article>
  );
}
