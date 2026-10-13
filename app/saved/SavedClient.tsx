'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button, HeroTitle, IconButton, TabBar, TemplateCard } from '@/components/ui';
import StaggeredText from '@/components/StaggeredText';
import TextReveal from '@/components/TextReveal';
import { useSavedTemplates } from '@/components/SavedTemplatesProvider';
import { TEMPLATES } from '@/data/templates';

const DRAFTS = [
  { title: 'Marigold arch', names: 'Priya & Sameer', tint: '#ffd0b4', edited: '2 hours ago', steps: '4 of 5 steps', progress: 80, status: 'Draft', tone: 'rust' as const, action: 'Continue' },
  { title: 'Quiet linen', names: 'Nora & Vikram', tint: '#f2f1ef', edited: '3 days ago', steps: 'Ready to send', progress: 100, status: 'Paid', tone: 'soft' as const, action: 'Edit' }
];

export default function SavedClient() {
  const [activeTab, setActiveTab] = useState<'templates' | 'drafts'>('templates');
  const [shareMessage, setShareMessage] = useState('');
  const { savedIds } = useSavedTemplates();
  const savedTemplates = useMemo(() => TEMPLATES.filter((template) => savedIds.includes(template.id)), [savedIds]);
  const recommendations = TEMPLATES.filter((template) => !savedIds.includes(template.id)).slice(0, 3);

  const shareList = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'My saved 1000SQUARES templates', url: window.location.href });
        setShareMessage('Your saved list is ready to share.');
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setShareMessage('Link copied. Share it with your partner.');
      } else {
        setShareMessage('Copy this page link to share your collection.');
      }
    } catch {
      setShareMessage('Sharing was cancelled.');
    }
  };

  return (
    <>
      <main className="mobile-page saved-page">
        <header className="mobile-page-header">
          <Link href="/" aria-label="1000SQUARES home"><img src="/images/logo.png" alt="1000SQUARES" /></Link>
          <IconButton icon="share" label="Share saved list" onClick={shareList} />
        </header>

        <section className="saved-hero">
          <span className="mobile-eyebrow">• Your collection</span>
          <HeroTitle size="l" lines={['Saved']} />
          <p><TextReveal delay={100}>Templates you love and designs you started. Pick up where you left off.</TextReveal></p>
          <div className="saved-segment" role="tablist" aria-label="Saved items">
            <button type="button" role="tab" aria-selected={activeTab === 'templates'} onClick={() => setActiveTab('templates')}>
              Templates · {savedTemplates.length}
            </button>
            <button type="button" role="tab" aria-selected={activeTab === 'drafts'} onClick={() => setActiveTab('drafts')}>
              My designs · {DRAFTS.length}
            </button>
          </div>
        </section>

        {activeTab === 'templates' ? (
          <section className="saved-panel" role="tabpanel" aria-label="Saved templates">
            <div className="saved-summary">
              <span><strong>{savedTemplates.length}</strong> saved templates</span>
              <Link href="/templates/">Browse templates</Link>
            </div>
            {savedTemplates.length > 0 ? (
              <div className="saved-grid">
                {savedTemplates.map((template) => <TemplateCard key={template.id} t={template} />)}
              </div>
            ) : (
              <div className="mobile-empty">
                <StaggeredText as="h2" text="Your collection is ready" />
                <p><TextReveal>Tap the heart on a template to save it here.</TextReveal></p>
                <Button tone="rust" href="/templates/">Explore templates</Button>
              </div>
            )}
            <div className="saved-actions">
              <Button tone="rust" iconEnd="arrow-forward" href="/templates/">Browse designs</Button>
              <Button tone="frost" icon="share" onClick={shareList}>Share list with partner</Button>
              <span role="status" aria-live="polite">{shareMessage}</span>
            </div>
          </section>
        ) : (
          <section className="saved-panel draft-panel" role="tabpanel" aria-label="My designs">
            {DRAFTS.map((draft) => (
              <article className="saved-draft" key={draft.title}>
                <div className="saved-draft-thumb" style={{ background: draft.tint }}>
                  <div className="inv"><span className="inv-names">{draft.names}</span></div>
                </div>
                <div className="saved-draft-content">
                  <div className="saved-draft-title">
                    <h2>{draft.title}</h2>
                    <span className={`draft-pill ${draft.status === 'Paid' ? 'is-paid' : ''}`}>{draft.status}</span>
                  </div>
                  <p>Edited {draft.edited} · {draft.steps}</p>
                  <div className="draft-progress" role="progressbar" aria-label={`${draft.title} completion`} aria-valuenow={draft.progress} aria-valuemin={0} aria-valuemax={100}>
                    <span style={{ width: `${draft.progress}%` }} />
                  </div>
                  <Button tone={draft.tone} size="sm" icon="edit" href="/templates/">{draft.action}</Button>
                </div>
              </article>
            ))}
            <Button tone="soft" icon="add" href="/templates/">Start a new design</Button>
          </section>
        )}

        <section className="saved-recommendations">
          <div className="saved-recommendations-title"><StaggeredText as="h2" text="You might also like" /><Link href="/templates/">See all</Link></div>
          <div className="rail" role="list" aria-label="Recommended templates">
            {recommendations.map((template) => (
              <div key={template.id} role="listitem"><TemplateCard t={template} /></div>
            ))}
          </div>
        </section>
      </main>
      <TabBar current="Saved" />
    </>
  );
}
