import {
  Button, CtaButton, IconButton, Toolbar, TintSwatch, SectionHeader, HeroTitle,
  IndexList, NavBar, LogoStrip, TemplateCard, TabBar
} from '@/components/ui';
import { TEMPLATES, TINTS, PRESS, type Template } from '@/data/templates';
import SiteFooter from '@/components/SiteFooter';

const OCCASION_LINKS = [
  { label: 'Wedding invitations', href: '/templates/' },
  { label: 'Save the dates', href: '/templates/' },
  { label: 'Engagement', href: '/templates/' },
  { label: 'Haldi & mehendi', href: '/templates/' }
];
const TRENDING = ['rose-garden-suite', 'midnight-vows', 'terracotta-sun', 'quiet-linen', 'marigold-arch']
  .map((id) => TEMPLATES.find((template) => template.id === id))
  .filter((template): template is Template => Boolean(template));
const STEPS = [
  { n: '01', title: 'Discover', body: 'Browse invitations by occasion, style and colour. Save the ones you love.' },
  { n: '02', title: 'Customise', body: 'Change names, dates, wording and colours right in the browser. No design skills needed.' },
  { n: '03', title: 'Send or print', body: 'Download print-ready files or share a digital invite link with your guests.' }
];
const TOOLBAR = [
  { icon: 'share', label: 'Share' }, { icon: 'comment', label: 'Comment' },
  { icon: 'download', label: 'Download' }, { icon: 'edit', label: 'Edit' }, { icon: 'more', label: 'More' }
] as const;

export default function Home() {
  return (
    <>
      <main className="page-home">
        <section className="hero" data-theme-section="home">
          <div className="container hero-inner">
            <NavBar logoSrc="/images/logo-reverse.png"
              links={[{ label: 'Templates', href: '/templates/' }, { label: 'Studio', href: '/#how-it-works' }]}
              cta={{ label: 'Start designing', href: '/templates/' }} />
            <div className="rule" />
            <div className="hero-top">
              <div className="hero-copy">
                <span className="hero-eyebrow">• Wedding invitations</span>
                <h1>Wedding invites,<br />made to matter</h1>
                <p>1000SQUARES is a marketplace of beautifully designed templates. Pick a design, make it yours, and send it the same day.</p>
                <div className="hero-ctas">
                  <Button tone="rust" size="lg" iconEnd="arrow-forward" href="/templates/">Browse templates</Button>
                  <Button tone="frost" size="lg" icon="edit" href="/templates/"><span className="hide-sm">Start customising</span><span className="show-sm">Customise</span></Button>
                </div>
              </div>
              <div className="hero-index">
                <IndexList title="What we make" items={OCCASION_LINKS} />
              </div>
            </div>
            <div className="hero-spacer" />
            <div className="rule" />
            <div className="hero-title">
              <HeroTitle as="p" size="xl" lines={['Designed', { image: '/images/handshake.jpg', alt: 'Two hands clasped' }, 'to say I do']} />
            </div>
          </div>
        </section>

        <section className="container section" data-theme-section="catalog">
          <SectionHeader eyebrow="Trending now" title="Templates couples love" />
          <div className="tgrid" role="list" aria-label="Trending templates">
            {TRENDING.map((template) => (
              <div className="tcell" role="listitem" key={template.id}><TemplateCard t={template} /></div>
            ))}
          </div>
          <div className="center">
            <Button tone="soft" iconEnd="arrow-forward" href="/templates/">View all templates</Button>
          </div>
        </section>

        <section className="section section-press" data-theme-section="editorial">
          <div className="container">
            <SectionHeader eyebrow="Featured in" title="Loved by planners and press" />
          </div>
          <LogoStrip items={PRESS} label="Featured in" />
        </section>

        <section className="container section" id="how-it-works" data-theme-section="studio">
          <SectionHeader eyebrow="How it works" title="Make it yours in minutes" />
          <div className="how">
            <ol className="steps">
              {STEPS.map((step) => (
                <li key={step.n}>
                  <span className="step-n">{step.n}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="studio">
              <div className="float-card" style={{ background: '#ffe9d4' }}>
                <div className="inv">
                  <span className="inv-kicker">Save the date</span>
                  <span className="inv-names inv-names-lg">Meera<br />&amp; Kabir</span>
                  <span className="inv-when">14 Feb 2027 · Jaipur</span>
                </div>
              </div>
              <TintSwatch options={TINTS.slice(0, 3)} label="Card colour" />
              <div className="studio-tools">
                <Toolbar items={[...TOOLBAR]} label="Design actions" />
                <IconButton icon="add" label="New design" tone="rust" size="lg" />
              </div>
            </div>
          </div>
        </section>

        <section className="container section section-last" id="about-us" data-theme-section="story">
          <SectionHeader eyebrow="About us" title="We design moments that matter" />
          <div className="about">
            <img src="/images/handshake.jpg" alt="Two people clasping hands under a clear sky" />
            <div className="about-copy">
              <p className="lead">At 1000SQUARES we pair studio-grade design with tools anyone can use. Every template is made by working designers, then handed to you to change the words, the colours and the details until it feels like yours.</p>
              <p className="muted">Wedding invitations are where we start. Birthdays, events and more digital products are on the way.</p>
              <div><CtaButton tone="rust" href="#about-us">Our story</CtaButton></div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <TabBar current="Home" />
    </>
  );
}
