import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button";
import { BrowserRouter, Link, Route, Routes, useNavigate, useLocation } from 'react-router-dom'
import AuthPage from './pages/Auth'
import Dashboard from './pages/Dashboard'
import ExamPage from './pages/Exam'
import AdminLogin from './pages/AdminLogin'
import AdminPanel from './pages/AdminPanel'
import CbtBrowser from './pages/CbtBrowser'
import HowItWorks from './pages/HowItWorks'
import { Shield, BookOpen, LogOut, HelpCircle, Menu, X } from 'lucide-react'

function FctaLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="20" cy="20" r="20" fill="url(#bgGrad)" />
      <path d="M23 4L10 22h9l-2 14 13-18h-9L23 4z" fill="url(#boltGrad)" stroke="#f0d070" strokeWidth="0.5" />
      <circle cx="20" cy="20" r="3" fill="#fff" opacity="0.3" />
      <defs>
        <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c8a84b" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#1a5c35" stopOpacity="0.9" />
        </radialGradient>
        <linearGradient id="boltGrad" x1="10" y1="4" x2="23" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fff5a0" />
          <stop offset="40%" stopColor="#f0d070" />
          <stop offset="100%" stopColor="#c8a84b" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function NavBar() {
  const nav = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const linkClass = (path: string) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
      location.pathname === path
        ? 'bg-primary/10 text-primary'
        : 'text-muted-foreground hover:text-primary hover:bg-secondary'
    }`

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-border shadow-sm">
      <div className="h-1 w-full" style={{background: 'linear-gradient(90deg, #1a5c35 0%, #1a5c35 65%, #c8a84b 65%, #c8a84b 100%)'}} />
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3 min-w-0">
          <FctaLogo className="h-10 w-10 rounded object-contain flex-shrink-0" />
          <div className="min-w-0">
            <div className="font-serif text-base font-bold leading-tight text-primary truncate">FCT CBT Practice</div>
            <div className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase hidden sm:block">Federal Capital Territory</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm">
          <Link className={linkClass('/dashboard')} to="/dashboard">
            <BookOpen className="h-3.5 w-3.5" />Dashboard
          </Link>
          <Link className={linkClass('/how-it-works')} to="/how-it-works">
            <HelpCircle className="h-3.5 w-3.5" />How It Works
          </Link>
          <Link className={linkClass('/admin/login')} to="/admin/login">
            <Shield className="h-3.5 w-3.5" />Admin
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="ml-2 gap-1.5 border-primary/30 text-primary hover:bg-primary hover:text-white transition-colors"
            onClick={async () => { await fetch('/api/auth/logout'); nav('/auth') }}
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </nav>

        <button
          className="md:hidden p-2 rounded text-muted-foreground hover:text-primary"
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t bg-white px-4 py-3 space-y-1 shadow-lg">
          <Link className={`${linkClass('/dashboard')} w-full`} to="/dashboard" onClick={() => setMobileOpen(false)}>
            <BookOpen className="h-4 w-4" />Dashboard
          </Link>
          <Link className={`${linkClass('/how-it-works')} w-full`} to="/how-it-works" onClick={() => setMobileOpen(false)}>
            <HelpCircle className="h-4 w-4" />How It Works
          </Link>
          <Link className={`${linkClass('/admin/login')} w-full`} to="/admin/login" onClick={() => setMobileOpen(false)}>
            <Shield className="h-4 w-4" />Admin
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-1.5 border-primary/30 text-primary hover:bg-primary hover:text-white mt-2"
            onClick={async () => { await fetch('/api/auth/logout'); nav('/auth'); setMobileOpen(false) }}
          >
            <LogOut className="h-3.5 w-3.5" />Logout
          </Button>
        </div>
      )}
    </header>
  )
}

export default function Home() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/cbt-platform" element={<CbtBrowser />} />
        <Route path="*" element={<AppShell />} />
      </Routes>
    </BrowserRouter>
  );
}

function AppShell() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/exam/:cadre" element={<ExamPage />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
      <footer className="border-t mt-auto py-8 bg-primary text-white">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FctaLogo className="h-8 w-8" />
                <span className="font-serif font-bold text-white">FCT CBT Practice Preparation</span>
              </div>
              <p className="text-xs text-white/60 max-w-xs leading-relaxed">
                Official preparation website for FCT Administration staff. Practice exam questions across all professional cadres.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-8">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-white/50 mb-2">Quick Links</div>
                <div className="space-y-1.5 text-sm text-white/80">
                  <Link to="/auth" className="block hover:text-white transition-colors">Register / Login</Link>
                  <Link to="/how-it-works" className="block hover:text-white transition-colors">How It Works</Link>
                  <Link to="/exam/current-affairs" className="block hover:text-white transition-colors">Free Practice</Link>
                </div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-white/50 mb-2">Support</div>
                <div className="space-y-1.5 text-sm text-white/80">
                  <a href="https://wa.me/2348138474528" target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors">WhatsApp: +234 813 847 4528</a>
                  <Link to="/how-it-works" className="block hover:text-white transition-colors">Payment Guide</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-white/40">
            <span>Federal Capital Territory Administration &copy; {new Date().getFullYear()}</span>
            <span>All payments secured by Flutterwave</span>
          </div>
        </div>
      </footer>
    </>
  );
}

function StatBadge({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center px-6 py-4">
      <div className="text-3xl font-serif font-bold text-primary">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5 font-medium uppercase tracking-wide">{label}</div>
    </div>
  )
}

function Landing() {
  const nav = useNavigate()
  const [announcements, setAnnouncements] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/admin/announcements')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setAnnouncements(data) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tx = params.get('transaction_id') || params.get('transactionId') || params.get('tx_id')
    if (!tx) return
    nav(`/dashboard${window.location.search}`, { replace: true })
  }, [nav])

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)',
          backgroundSize: '20px 20px'
        }} />
        <div className="relative mx-auto max-w-5xl px-4 py-16 md:py-24 text-center">
          <div className="flex justify-center mb-6 anim-up">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-3 border border-white/20">
              <FctaLogo className="h-16 w-16" />
            </div>
          </div>
          <div className="space-y-3 anim-up anim-delay-1">
            <div className="inline-block text-xs font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full border border-yellow-400/50 text-yellow-300 mb-2">
              Official Practice Preparation Website
            </div>
            <h1 className="font-serif text-4xl font-bold text-white sm:text-5xl md:text-6xl leading-tight">
              FCT CBT Practice<br />
              <span style={{
                background: 'linear-gradient(90deg, #f0d070, #c8a84b, #f0d070)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>Preparation Website</span>
            </h1>
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-base text-white/75 md:text-lg anim-up anim-delay-2">
            Practice authentic exam-style questions across all professional cadres of the Federal Capital Territory Administration. Current Affairs is <span className="text-yellow-300 font-semibold">completely free</span>.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row justify-center anim-up anim-delay-3">
            <Link to="/auth">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-bold px-8 shadow-lg">
                Sign In / Register — It's Free
              </Button>
            </Link>
            <Link to="/exam/current-affairs">
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 font-semibold px-8 backdrop-blur">
                Try Free — Current Affairs
              </Button>
            </Link>
          </div>
          <div className="mt-5 anim-up anim-delay-3">
            <Link to="/how-it-works" className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors underline underline-offset-2">
              <HelpCircle className="h-4 w-4" />
              See how it works &amp; payment guide
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-wrap divide-x divide-border">
            <StatBadge value="21+" label="Cadre Subjects" />
            <StatBadge value="1,000+" label="Practice Questions" />
            <StatBadge value="45 min" label="Timed Sessions" />
            <StatBadge value="FREE" label="Current Affairs" />
          </div>
        </div>
      </section>

      {/* Announcements */}
      {announcements.length > 0 && (
        <section className="bg-white border-b py-4">
          <div className="mx-auto max-w-4xl px-4 space-y-3">
            {announcements.map((ann: any) => (
              <div key={ann.id} className="rounded-xl border-2 border-primary/40 bg-primary/5 px-5 py-4 flex items-start gap-3 shadow-sm">
                <span className="text-primary flex-shrink-0 mt-0.5 text-lg">📢</span>
                <div className="flex-1 min-w-0">
                  {ann.title && <div className="font-bold text-primary text-sm mb-0.5">{ann.title}</div>}
                  <p className="text-sm font-semibold text-foreground leading-relaxed">{ann.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{new Date(ann.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3 Steps */}
      <section className="bg-muted/30 py-14">
        <div className="mx-auto max-w-4xl px-4">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl font-bold text-foreground">Get Started in 3 Easy Steps</h2>
            <p className="text-muted-foreground mt-2">No technical knowledge needed — works on any phone or computer</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '1', icon: '📝', title: 'Register Free', desc: 'Create a free account using your email. Current Affairs practice is immediately available — no payment needed.' },
              { step: '2', icon: '💳', title: 'Choose Your Plan', desc: 'Pay once via Flutterwave. ₦5,000 unlocks all 21 cadres + AI platform. Past Questions and Windows Software are separate purchases.' },
              { step: '3', icon: '🎯', title: 'Start Practising', desc: 'Take timed 45-minute exams, review your answers with explanations, and build confidence before your real CBT exam.' },
            ].map(item => (
              <div key={item.step} className="bg-white rounded-xl border shadow-sm p-6 text-center relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 h-7 w-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shadow">{item.step}</div>
                <div className="text-4xl mb-3 mt-2">{item.icon}</div>
                <h3 className="font-serif font-bold text-base mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/auth">
              <Button className="gap-2 px-6">Start Free Now</Button>
            </Link>
            <Link to="/how-it-works">
              <Button variant="outline" className="gap-2 px-6 border-primary/30 text-primary hover:bg-primary/5">
                <HelpCircle className="h-4 w-4" />Full Payment Guide
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Products overview */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-4xl px-4">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl font-bold">What We Offer</h2>
            <p className="text-muted-foreground mt-2">Three separate products — pay only for what you need</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                color: '#1a5c35', badge: '₦5,000', title: 'CBT Premium Access',
                desc: 'Unlock all 21 professional cadres + AI-powered CBT platform. One-time payment, lifetime access.',
                features: ['All 21 cadre subjects', 'AI CBT platform', 'Timed practice exams', 'Score & explanations'],
                cta: 'Get Premium Access', ctaLink: '/auth',
              },
              {
                color: '#7c3aed', badge: '₦7,000', title: 'Past Exam Questions',
                desc: 'Download official FCT CBT past exam questions. Comprehensive collection across all cadres.',
                features: ['Official past questions', 'All cadres covered', 'PDF download', 'Updated regularly'],
                cta: 'Buy Past Questions', ctaLink: '/auth',
              },
              {
                color: '#1e40af', badge: '₦100,000', title: 'Windows Software',
                desc: 'Professional CBT practice software for Windows. Full offline use with enterprise features.',
                features: ['Works offline', 'Windows compatible', 'Bulk management', 'Enterprise analytics'],
                cta: 'Buy Software', ctaLink: '/auth',
              },
            ].map(product => (
              <div key={product.title} className="rounded-xl border bg-white shadow-sm overflow-hidden flex flex-col">
                <div className="h-1.5 w-full" style={{ background: product.color }} />
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-serif font-bold text-sm">{product.title}</h3>
                    <span className="text-xs font-bold rounded-full px-2 py-0.5 text-white" style={{ background: product.color }}>{product.badge}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{product.desc}</p>
                  <ul className="space-y-1.5 mb-5 flex-1">
                    {product.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-xs">
                        <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: product.color }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link to={product.ctaLink}>
                    <Button size="sm" className="w-full text-white" style={{ background: product.color }}>
                      {product.cta}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA bottom */}
      <section className="bg-muted/30 py-12">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-serif text-2xl font-bold mb-2">Still Have Questions?</h2>
          <p className="text-muted-foreground mb-6 text-sm">Our full guide explains everything. Or reach us on WhatsApp.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/how-it-works">
              <Button variant="outline" className="gap-2 border-primary/30 text-primary hover:bg-primary/5 px-6">
                <HelpCircle className="h-4 w-4" />View Full Guide &amp; FAQ
              </Button>
            </Link>
            <a href="https://wa.me/2348138474528" target="_blank" rel="noopener noreferrer">
              <Button className="gap-2 px-6 bg-green-600 hover:bg-green-700">
                💬 WhatsApp Support
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
