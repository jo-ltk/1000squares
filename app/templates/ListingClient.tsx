'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Button, HeroTitle, NavBar, TemplateCard, TintSwatch, TabBar } from '@/components/ui';
import JellyRadio from '@/components/JellyRadio';
import StaggeredText from '@/components/StaggeredText';
import TextReveal from '@/components/TextReveal';
import SiteFooter from '@/components/SiteFooter';
import { OCCASIONS, STYLES, TEMPLATES, TINTS, type Occasion, type Template, type TemplateFormat } from '@/data/templates';

type SortOption = 'popular' | 'new' | 'az';
type FormatKey = 'digital' | 'print';
type FormatSelection = Record<FormatKey, boolean>;
const PAGE_SIZE = 8;
const TOTAL = TEMPLATES.length;

export default function ListingClient() {
  const [occasion, setOccasion] = useState<Occasion>('Wedding invitations');
  const [styles, setStyles] = useState<string[]>([]);
  const [tint, setTint] = useState(-1);
  const [sort, setSort] = useState<SortOption>('popular');
  const [formats, setFormats] = useState<FormatSelection>({ digital: true, print: true });
  const [visibleLimit, setVisibleLimit] = useState(PAGE_SIZE);
  const [sheetOpen, setSheetOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const inOccasion = useMemo(
    () => TEMPLATES.filter((template) => occasion === 'All' || template.category === occasion),
    [occasion]
  );

  const shown = useMemo(() => {
    const selectedFormats = Object.entries(formats).filter(([, selected]) => selected).map(([format]) => format);
    const matches = inOccasion.filter((template) => {
      const matchesStyle = styles.length === 0 || styles.includes(template.style);
      const matchesTint = tint < 0 || template.tintKey === tint;
      const supportedFormats: TemplateFormat[] = template.formats ?? ['digital', 'print'];
      const matchesFormat = selectedFormats.some((format) => supportedFormats.includes(format as TemplateFormat));
      return matchesStyle && matchesTint && matchesFormat;
    });
    const comparators: Record<SortOption, (a: Template, b: Template) => number> = {
      popular: (a, b) => a.rank - b.rank,
      new: (a, b) => a.age - b.age,
      az: (a, b) => a.title.localeCompare(b.title)
    };
    return [...matches].sort(comparators[sort]);
  }, [formats, inOccasion, sort, styles, tint]);

  const visibleTemplates = shown.slice(0, visibleLimit);
  const activeCount = styles.length + (tint >= 0 ? 1 : 0) + (formats.digital && formats.print ? 0 : 1);

  const toggleStyle = (style: string) => {
    setStyles((current) => current.includes(style) ? current.filter((item) => item !== style) : [...current, style]);
    setVisibleLimit(PAGE_SIZE);
  };

  const toggleFormat = (format: FormatKey) => {
    setFormats((current) => ({ ...current, [format]: !current[format] }));
    setVisibleLimit(PAGE_SIZE);
  };

  const chooseOccasion = (value: string) => {
    setOccasion(value as Occasion);
    setVisibleLimit(PAGE_SIZE);
  };

  const chooseTint = (index: number) => {
    setTint((current) => current === index ? -1 : index);
    setVisibleLimit(PAGE_SIZE);
  };

  const clearAll = () => {
    setOccasion('All');
    setStyles([]);
    setTint(-1);
    setFormats({ digital: true, print: true });
    setVisibleLimit(PAGE_SIZE);
  };

  // Keep focus inside the filter sheet, close it with Escape, and restore focus on close.
  useEffect(() => {
    if (!sheetOpen) return undefined;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSheetOpen(false);
    };
    dialogRef.current?.focus();
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [sheetOpen]);

  const filters = (
    <>
      <fieldset className="fset">
        <legend>• Style</legend>
        {STYLES.map((style) => (
          <label key={style} className="check">
            <input type="checkbox" checked={styles.includes(style)} onChange={() => toggleStyle(style)} />
            <span className="grow">{style}</span>
            <span className="count">{inOccasion.filter((template) => template.style === style).length}</span>
          </label>
        ))}
      </fieldset>
      <fieldset className="fset">
        <legend>• Colour · {tint < 0 ? 'All' : TINTS[tint]?.label}</legend>
        <TintSwatch options={TINTS} value={tint} onChange={(index) => chooseTint(index)} label="Colour" />
      </fieldset>
      <fieldset className="fset">
        <legend>• Format</legend>
        <label className="check"><input type="checkbox" checked={formats.digital} onChange={() => toggleFormat('digital')} /><span>Digital invite link</span></label>
        <label className="check"><input type="checkbox" checked={formats.print} onChange={() => toggleFormat('print')} /><span>Print-ready PDF</span></label>
      </fieldset>
    </>
  );

  return (
    <>
      <main className="page-listing">
        <div className="container">
          <NavBar logoSrc="/images/logo.png"
            links={[{ label: 'Templates', href: '/templates/', current: true }, { label: 'Studio', href: '/#how-it-works' }]}
            cta={{ label: 'Start designing', href: '/templates/' }} />
        </div>

        <section className="l-hero">
          <div className="container l-hero-inner">
            <nav className="crumbs" aria-label="Breadcrumb">
              <Link href="/">Home</Link><span aria-hidden="true">/</span>
              <span aria-current="page">Templates</span>
            </nav>
            <div className="l-hero-row">
              <HeroTitle size="l" lines={[occasion === 'All' ? 'All templates' : occasion]} />
              <p><TextReveal delay={100}>Invitations designed by working designers. Change every word and colour, then print or send digitally.</TextReveal></p>
            </div>
            <div className="pills">
              <JellyRadio
                items={OCCASIONS.map((item) => item)}
                value={occasion}
                onChange={chooseOccasion}
                ariaLabel="Occasion"
                className="occasion-jelly-radio"
                chipColor="rgba(255,255,255,.62)"
                activeColor="var(--peach-100)"
                textColor="var(--ink)"
                activeTextColor="var(--on-rust-soft)"
                gap={8}
                swell={0.13}
                barge={3}
                shrink={0.025}
                jelly={1}
                bounce={0.22}
                stagger={18}
                stiffness={560}
              />
            </div>
          </div>
        </section>

        <div className="m-toolbar">
          <Button id="listing-filters-button" tone="frost" size="sm" aria-expanded={sheetOpen} aria-controls="listing-filters-sheet"
            onClick={() => setSheetOpen(true)}>Filters{activeCount ? ` · ${activeCount}` : ''}</Button>
          <SortSelect sort={sort} setSort={setSort} onChange={() => setVisibleLimit(PAGE_SIZE)} />
        </div>

        <section className="container l-body">
          <aside className="filters" aria-label="Filters">
            {filters}
            <div className="hr" />
            <Button tone="frost" size="sm" onClick={clearAll}>Clear filters</Button>
          </aside>

          <div className="results">
            <div className="results-bar">
              <span><strong>{shown.length}</strong> templates</span>
              <label className="sort-label">Sort by <SortSelect sort={sort} setSort={setSort} onChange={() => setVisibleLimit(PAGE_SIZE)} /></label>
            </div>

            {visibleTemplates.length > 0 ? (
              <>
                <div className="lgrid">
                  {visibleTemplates.map((template) => <TemplateCard key={template.id} t={template} />)}
                </div>
                <div className="load-more">
                  {visibleTemplates.length < shown.length && (
                    <Button tone="soft" size="lg" onClick={() => setVisibleLimit((limit) => limit + PAGE_SIZE)}>Load more</Button>
                  )}
                  <span>Showing {visibleTemplates.length} of {TOTAL}</span>
                </div>
              </>
            ) : (
              <div className="empty">
                <StaggeredText as="h2" text="No templates match" />
                <p><TextReveal>Try another occasion or clear a filter.</TextReveal></p>
                <Button tone="soft" onClick={clearAll}>Clear filters</Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />

      {sheetOpen && (
        <div className="sheet-wrap">
          <button type="button" className="sheet-backdrop" aria-label="Close filters" onClick={() => setSheetOpen(false)} />
          <div className="sheet" id="listing-filters-sheet" role="dialog" aria-modal="true" aria-label="Filters" tabIndex={-1} ref={dialogRef}>
            <div className="sheet-handle" />
            <div className="sheet-head">
              <h2>Filters</h2>
              <button type="button" className="text-btn" onClick={clearAll}>Clear all</button>
            </div>
            {filters}
            <Button tone="rust" size="lg" className="w-full" onClick={() => setSheetOpen(false)}>Show {shown.length} templates</Button>
          </div>
        </div>
      )}
      {!sheetOpen && <TabBar current="Templates" />}
    </>
  );
}

function SortSelect({ sort, setSort, onChange }: {
  sort: SortOption;
  setSort: (sort: SortOption) => void;
  onChange?: () => void;
}) {
  const change = (value: string) => {
    setSort(value as SortOption);
    onChange?.();
  };
  return (
    <select className="sel" value={sort} onChange={(event) => change(event.target.value)} aria-label="Sort by">
      <option value="popular">Most popular</option>
      <option value="new">Newest</option>
      <option value="az">Name A–Z</option>
    </select>
  );
}

