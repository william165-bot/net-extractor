import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/lib/api'
import { CADRES } from '@/types'
import {
  Lock, MessageCircle, Sparkles, Loader2, Key, CreditCard, CheckCircle,
  ChevronRight, BookOpen, Megaphone, Download, GraduationCap, FileText, MessageSquare,
  Monitor, AlertCircle, HelpCircle, X, Play, Star, Trophy, Clock
} from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'

const PREMIUM_PAYMENT_LINK  = 'https://flutterwave.com/pay/emellunf1blc'
const SOFTWARE_PAYMENT_LINK = 'https://flutterwave.com/pay/f6lonaopcfuo'
const PASTQ_PAYMENT_LINK    = 'https://flutterwave.com/pay/zjveyg6kjpfd'

const CADRE_ICONS: Record<string, string> = {
  'current-affairs': '📰', 'accounting': '📊', 'administrative-officers': '🏛️',
  'audit': '🔍', 'culture-and-tourism': '🎭', 'education': '🎓',
  'electrical-engineering': '⚡', 'mechanical-engineering': '⚙️', 'engineering': '🔧',
  'foreign-affairs': '🌍', 'health': '🏥', 'human-resources': '👥',
  'legal': '⚖️', 'program-analyst': '💻', 'solid-mineral-development': '🪨',
  'statistics': '📈', 'town-planners': '🗺️', 'works-housing': '🏗️',
  'financial-regulation': '💰', 'civil-service-rule-general': '📋', 'procurement': '📦',
}

function RequeryPanel({
  open, txId, loading, error, success,
  onToggle, onTxChange, onVerify, amount,
}: {
  open: boolean; txId: string; loading: boolean; error: string; success: string
  onToggle: () => void; onTxChange: (v: string) => void; onVerify: () => void; amount: string
}) {
  return (
    <>
      <Button
        variant="ghost"
        className="w-fit gap-1.5 text-xs text-amber-700 hover:bg-amber-50 px-2 py-1 h-auto"
        onClick={onToggle}
      >
        <AlertCircle className="h-3.5 w-3.5" />
        Already paid but not unlocked?
      </Button>

      {open && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/60 px-4 py-4 space-y-3">
          <div>
            <p className="text-sm font-semibold text-amber-900">Re-verify your Flutterwave payment</p>
            <p className="text-xs text-amber-700 mt-1 leading-relaxed">
              Enter your <strong>Transaction ID</strong> from your Flutterwave receipt email or SMS.
              It is a number like <code className="bg-amber-100 px-1 rounded">5234871</code>.
              We will verify your {amount} payment directly with Flutterwave and unlock instantly.
            </p>
          </div>
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />{error}
            </div>
          )}
          {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700 flex items-start gap-2">
              <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />{success}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              placeholder="Transaction ID (numbers only, e.g. 5234871)"
              value={txId}
              onChange={e => onTxChange(e.target.value.replace(/\D/g, ''))}
              className="flex-1 rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
              disabled={loading}
            />
            <Button
              size="sm"
              className="gap-1.5 bg-amber-700 hover:bg-amber-800 text-white shrink-0"
              onClick={onVerify}
              disabled={loading || !txId.trim()}
            >
              {loading
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Verifying…</>
                : <><CheckCircle className="h-3.5 w-3.5" />Verify</>}
            </Button>
          </div>
          <p className="text-[10px] text-amber-600">
            Still having issues? <a href="https://wa.me/2348138474528" target="_blank" rel="noopener noreferrer" className="font-semibold underline">WhatsApp: +234 813 847 4528</a>
          </p>
        </div>
      )}
    </>
  )
}

function WelcomeBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-5 relative overflow-hidden">
      <div className="absolute top-3 right-3">
        <button onClick={onDismiss} className="text-muted-foreground hover:text-foreground p-1 rounded">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex items-start gap-3">
        <div className="text-3xl flex-shrink-0">👋</div>
        <div>
          <h3 className="font-serif font-bold text-base mb-1">Welcome! Here's how to get started</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
            {[
              { icon: '🆓', title: 'Free right now', desc: 'Click "Current Affairs" below to start practising for free — no payment needed.' },
              { icon: '💳', title: 'Unlock all cadres', desc: 'Pay ₦5,000 once to access all 21 exam subjects + AI platform.' },
              { icon: '❓', title: 'Need help?', desc: 'Check our guide or WhatsApp us for support anytime.' },
            ].map(item => (
              <div key={item.title} className="bg-white/70 rounded-lg p-3 border border-primary/10">
                <div className="text-xl mb-1">{item.icon}</div>
                <div className="font-semibold text-xs mb-0.5">{item.title}</div>
                <div className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2 flex-wrap">
            <Link to="/how-it-works">
              <Button size="sm" variant="outline" className="gap-1.5 border-primary/30 text-primary hover:bg-primary/5 text-xs">
                <HelpCircle className="h-3.5 w-3.5" />Full Guide &amp; FAQ
              </Button>
            </Link>
            <a href="https://wa.me/2348138474528" target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="gap-1.5 bg-green-600 hover:bg-green-700 text-xs">
                <MessageCircle className="h-3.5 w-3.5" />WhatsApp Support
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusSummaryBar({ user, software, pastq }: { user: any; software: any; pastq: any }) {
  const items = [
    { label: 'Current Affairs', status: 'free', color: 'green' },
    { label: 'CBT Premium (21 Cadres)', status: user?.premium ? 'active' : 'locked', color: user?.premium ? 'green' : 'gray' },
    { label: 'Past Questions', status: pastq?.unlocked ? 'active' : 'locked', color: pastq?.unlocked ? 'purple' : 'gray' },
    { label: 'Windows Software', status: software?.unlocked ? 'active' : 'locked', color: software?.unlocked ? 'blue' : 'gray' },
  ]
  const colorMap: Record<string, string> = {
    green: 'bg-green-50 border-green-200 text-green-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-500',
  }
  return (
    <div className="rounded-xl border bg-white p-4">
      <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-1.5">
        <Star className="h-3.5 w-3.5" />Your Access Status
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {items.map(item => (
          <div key={item.label} className={`rounded-lg border px-3 py-2 text-center ${colorMap[item.color]}`}>
            <div className="text-[10px] font-bold uppercase tracking-wide mb-0.5">
              {item.status === 'active' ? '✅ Active' : item.status === 'free' ? '🆓 Free' : '🔒 Locked'}
            </div>
            <div className="text-[10px] leading-tight">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const nav = useNavigate()

  const [user, setUser] = useState<any>(null)
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [showWelcome, setShowWelcome] = useState(false)

  const [keyOpen, setKeyOpen] = useState(false)
  const [activationKey, setActivationKey] = useState('')
  const [keyError, setKeyError] = useState('')
  const [keyLoading, setKeyLoading] = useState(false)

  const [premReqOpen, setPremReqOpen] = useState(false)
  const [premReqTxId, setPremReqTxId] = useState('')
  const [premReqLoading, setPremReqLoading] = useState(false)
  const [premReqError, setPremReqError] = useState('')
  const [premReqSuccess, setPremReqSuccess] = useState('')

  const [software, setSoftware] = useState<{ unlocked: boolean; download_url?: string; price: number }>({ unlocked: false, price: 100000 })
  const [softwareError, setSoftwareError] = useState('')
  const [swReqOpen, setSwReqOpen] = useState(false)
  const [swReqTxId, setSwReqTxId] = useState('')
  const [swReqLoading, setSwReqLoading] = useState(false)
  const [swReqError, setSwReqError] = useState('')
  const [swReqSuccess, setSwReqSuccess] = useState('')

  const [pastq, setPastq] = useState<{ unlocked: boolean; download_url?: string; price: number }>({ unlocked: false, price: 7000 })
  const [pastqError, setPastqError] = useState('')
  const [pqReqOpen, setPqReqOpen] = useState(false)
  const [pqReqTxId, setPqReqTxId] = useState('')
  const [pqReqLoading, setPqReqLoading] = useState(false)
  const [pqReqError, setPqReqError] = useState('')
  const [pqReqSuccess, setPqReqSuccess] = useState('')

  const [consultOpen, setConsultOpen] = useState(false)
  const [consultTopic, setConsultTopic] = useState('')
  const [consultDetails, setConsultDetails] = useState('')
  const [consultLoading, setConsultLoading] = useState(false)
  const [consultSuccess, setConsultSuccess] = useState('')
  const [consultError, setConsultError] = useState('')
  const [myConsultations, setMyConsultations] = useState<any[]>([])

  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackSubject, setFeedbackSubject] = useState('')
  const [feedbackMsg, setFeedbackMsg] = useState('')
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [feedbackSuccess, setFeedbackSuccess] = useState('')
  const [feedbackError, setFeedbackError] = useState('')
  const [myFeedbacks, setMyFeedbacks] = useState<any[]>([])

  useEffect(() => {
    (async () => {
      const me = await fetch('/api/auth/me').then(r => r.json())
      if (!me.user) { nav('/auth?mode=signup', { replace: true }); return }
      if (me.user.blocked) { await fetch('/api/auth/logout'); nav('/auth?error=blocked', { replace: true }); return }
      setUser(me.user)

      // Show welcome banner for new/free users who haven't dismissed it
      try {
        const dismissed = localStorage.getItem('welcome_dismissed')
        if (!dismissed) setShowWelcome(true)
      } catch {}

      try {
        const a = await fetch('/api/admin/announcements').then(r => r.json())
        if (Array.isArray(a)) setAnnouncements(a.filter((x: any) => x.active))
      } catch {}

      try {
        const sw = await fetch('/api/software').then(r => r.json())
        setSoftware({ unlocked: sw.unlocked === true, download_url: sw.unlocked === true ? sw.download_url : undefined, price: sw.price || 100000 })
      } catch {}

      try {
        const pq = await fetch('/api/pastquestions').then(r => r.json())
        setPastq({ unlocked: pq.unlocked === true, download_url: pq.unlocked === true ? pq.download_url : undefined, price: pq.price || 7000 })
      } catch {}

      try {
        const c = await fetch('/api/consultation').then(r => r.json())
        if (Array.isArray(c)) setMyConsultations(c)
      } catch {}

      try {
        const fb = await fetch('/api/feedback/mine').then(r => r.json())
        if (Array.isArray(fb)) setMyFeedbacks(fb)
      } catch {}
    })()
  }, [nav])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const txId = (params.get('transaction_id') || params.get('transactionId') || params.get('tx_id') || '').trim()
    const status = params.get('status') || ''
    if (!txId) return
    let intent = ''
    try { intent = localStorage.getItem('flw_pay_intent') || '' } catch {}
    try { localStorage.removeItem('flw_pay_intent') } catch {}
    window.history.replaceState({}, '', '/dashboard')
    if (!intent || status === 'cancelled') return
    if (intent === 'premium') {
      fetch(`/api/pay/verify?transaction_id=${encodeURIComponent(txId)}`, { credentials: 'include' })
        .then(async r => { if (r.ok) { const me = await fetch('/api/auth/me').then(r2 => r2.json()); if (me.user) setUser(me.user) } })
        .catch(() => {})
    } else if (intent === 'software') {
      fetch('/api/software', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ action: 'unlock', transaction_id: txId }) })
        .then(r => r.json()).then(d => { if (d.ok) setSoftware({ unlocked: true, download_url: d.download_url, price: 100000 }); else setSoftwareError(d.error || 'Payment verification failed. Use the "Already paid?" option below.') })
        .catch(() => setSoftwareError('Network error during verification. Use the "Already paid?" panel below.'))
    } else if (intent === 'pastq') {
      fetch('/api/pastquestions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ action: 'unlock', transaction_id: txId }) })
        .then(r => r.json()).then(d => { if (d.ok) setPastq({ unlocked: true, download_url: d.download_url, price: 7000 }); else setPastqError(d.error || 'Payment verification failed. Use the "Already paid?" option below.') })
        .catch(() => setPastqError('Network error during verification. Use the "Already paid?" panel below.'))
    }
  }, [])

  function dismissWelcome() {
    setShowWelcome(false)
    try { localStorage.setItem('welcome_dismissed', '1') } catch {}
  }

  function goPayPremium() { try { localStorage.setItem('flw_pay_intent', 'premium') } catch {}; window.location.href = PREMIUM_PAYMENT_LINK }
  function goPaySoftware() { try { localStorage.setItem('flw_pay_intent', 'software') } catch {}; window.location.href = SOFTWARE_PAYMENT_LINK }
  function goPayPastq() { try { localStorage.setItem('flw_pay_intent', 'pastq') } catch {}; window.location.href = PASTQ_PAYMENT_LINK }

  async function redeemKey() {
    setKeyError('')
    if (!activationKey.trim()) { setKeyError('Please enter your activation key'); return }
    setKeyLoading(true)
    try {
      await api('/activate', { method: 'POST', body: JSON.stringify({ activationKey: activationKey.trim() }) })
      setKeyOpen(false); setActivationKey('')
      const me = await fetch('/api/auth/me').then(r => r.json())
      if (me.user) setUser(me.user)
    } catch (e: any) { setKeyError(e?.error || 'Invalid activation key. Please try again.') }
    finally { setKeyLoading(false) }
  }

  async function requeryPremium() {
    setPremReqError(''); setPremReqSuccess('')
    const txId = premReqTxId.trim()
    if (!txId) { setPremReqError('Please enter your Transaction ID'); return }
    if (!/^\d+$/.test(txId)) { setPremReqError('Transaction ID must be a number — check your Flutterwave receipt'); return }
    setPremReqLoading(true)
    try {
      const r = await fetch(`/api/pay/verify?transaction_id=${encodeURIComponent(txId)}`, { credentials: 'include' })
      const data = await r.json()
      if (!r.ok) { setPremReqError(data.error || 'Verification failed. Please check your Transaction ID.'); return }
      const me = await fetch('/api/auth/me').then(r2 => r2.json())
      if (me.user) setUser(me.user)
      setPremReqSuccess('✅ Payment verified! CBT Premium has been activated.'); setPremReqTxId('')
    } catch { setPremReqError('Network error. Please check your connection and try again.') }
    finally { setPremReqLoading(false) }
  }

  async function requerySoftware() {
    setSwReqError(''); setSwReqSuccess('')
    const txId = swReqTxId.trim()
    if (!txId) { setSwReqError('Please enter your Transaction ID'); return }
    if (!/^\d+$/.test(txId)) { setSwReqError('Transaction ID must be a number — check your Flutterwave receipt'); return }
    setSwReqLoading(true)
    try {
      const r = await fetch('/api/software', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ action: 'unlock', transaction_id: txId }) })
      const data = await r.json()
      if (!r.ok) { setSwReqError(data.error || 'Verification failed.'); return }
      setSoftware({ unlocked: true, download_url: data.download_url, price: 100000 }); setSwReqSuccess('✅ Payment verified! Windows Software is now unlocked.'); setSwReqTxId('')
    } catch { setSwReqError('Network error. Please try again.') }
    finally { setSwReqLoading(false) }
  }

  async function requeryPastq() {
    setPqReqError(''); setPqReqSuccess('')
    const txId = pqReqTxId.trim()
    if (!txId) { setPqReqError('Please enter your Transaction ID'); return }
    if (!/^\d+$/.test(txId)) { setPqReqError('Transaction ID must be a number — check your Flutterwave receipt'); return }
    setPqReqLoading(true)
    try {
      const r = await fetch('/api/pastquestions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ action: 'unlock', transaction_id: txId }) })
      const data = await r.json()
      if (!r.ok) { setPqReqError(data.error || 'Verification failed.'); return }
      setPastq({ unlocked: true, download_url: data.download_url, price: 7000 }); setPqReqSuccess('✅ Payment verified! Past Questions are now unlocked.'); setPqReqTxId('')
    } catch { setPqReqError('Network error. Please try again.') }
    finally { setPqReqLoading(false) }
  }

  function openCBTPlatform() { nav('/cbt-platform') }

  async function submitConsultation() {
    setConsultError(''); setConsultSuccess('')
    if (!consultTopic.trim() || !consultDetails.trim()) { setConsultError('Please fill in both topic and details'); return }
    setConsultLoading(true)
    try {
      const r = await fetch('/api/consultation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'submit', topic: consultTopic, details: consultDetails }) })
      if (!r.ok) throw new Error('Failed')
      setConsultSuccess('Request submitted! Admin will respond to you shortly.'); setConsultTopic(''); setConsultDetails('')
      const c = await fetch('/api/consultation').then(r2 => r2.json())
      if (Array.isArray(c)) setMyConsultations(c)
    } catch { setConsultError('Failed to submit. Please try again.') }
    finally { setConsultLoading(false) }
  }

  async function submitFeedback() {
    setFeedbackError(''); setFeedbackSuccess('')
    if (!feedbackMsg.trim()) { setFeedbackError('Please enter your feedback'); return }
    setFeedbackLoading(true)
    try {
      const r = await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subject: feedbackSubject, message: feedbackMsg }) })
      if (!r.ok) throw new Error('Failed')
      setFeedbackSuccess('Thank you for your feedback!'); setFeedbackMsg(''); setFeedbackSubject('')
      try { const fb = await fetch('/api/feedback/mine').then(r2 => r2.json()); if (Array.isArray(fb)) setMyFeedbacks(fb) } catch {}
    } catch { setFeedbackError('Failed to submit. Try again.') }
    finally { setFeedbackLoading(false) }
  }

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    replied: 'bg-blue-50 text-blue-700 border-blue-200',
    payment_sent: 'bg-green-50 text-green-700 border-green-200',
    closed: 'bg-gray-50 text-gray-500 border-gray-200',
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-muted/20">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide mb-0.5">Welcome back</p>
              <h1 className="font-serif text-2xl font-bold text-foreground">{user?.email || 'Loading…'}</h1>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {user?.premium ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-3 py-1.5">
                  <CheckCircle className="h-3.5 w-3.5" />CBT Premium Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-3 py-1.5">
                  <Lock className="h-3.5 w-3.5" />Free Plan
                </span>
              )}
              <Link to="/how-it-works">
                <Button size="sm" variant="ghost" className="gap-1.5 text-xs text-muted-foreground hover:text-primary">
                  <HelpCircle className="h-3.5 w-3.5" />Help Guide
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">

        {/* Welcome banner for new users */}
        {showWelcome && <WelcomeBanner onDismiss={dismissWelcome} />}

        {/* Access status bar */}
        <StatusSummaryBar user={user} software={software} pastq={pastq} />

        {/* Announcements */}
        {announcements.length > 0 && (
          <div className="space-y-3">
            {announcements.map(ann => (
              <div key={ann.id} className="rounded-xl border-2 border-primary/40 bg-primary/5 px-5 py-4 flex items-start gap-3 shadow-sm">
                <Megaphone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  {ann.title && <div className="font-bold text-primary text-sm mb-0.5">{ann.title}</div>}
                  <p className="text-sm font-bold text-foreground leading-relaxed">{ann.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{new Date(ann.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── CBT PREMIUM ACTIVATION ── */}
        {!user?.premium && (
          <div className="rounded-xl border border-primary/20 bg-white overflow-hidden shadow-sm">
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #1a5c35, #c8a84b)' }} />
            <div className="p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <h2 className="font-serif text-lg font-bold">Unlock CBT Premium Access</h2>
                    <span className="text-xs font-bold bg-primary/10 text-primary rounded-full px-2 py-0.5 border border-primary/20">₦5,000 — One Time</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                    Get full access to all 21 professional cadres + AI CBT platform. <strong>Current Affairs is already free.</strong>
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 mb-4">
                    {['All 21 cadre subjects', 'AI CBT platform', 'Timed practice sessions', 'Score & explanations'].map(f => (
                      <div key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />{f}
                      </div>
                    ))}
                  </div>
                  <ol className="space-y-2 text-sm">
                    {[
                      'Click "Pay ₦5,000" — you\'ll go to a secure Flutterwave payment page',
                      'Pay by card, bank transfer, or USSD (*payment code)',
                      'You\'ll be brought back automatically and your account unlocks',
                    ].map((step, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                        <span className="text-muted-foreground">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0 min-w-[200px]">
                  <Button onClick={goPayPremium} className="w-full gap-2">
                    <CreditCard className="h-4 w-4" />Pay ₦5,000 — Unlock All
                  </Button>
                  <a href="https://wa.me/2348138474528" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full gap-2 border-green-300 text-green-700 hover:bg-green-50">
                      <MessageCircle className="h-4 w-4" />WhatsApp Support
                    </Button>
                  </a>
                  <Button variant="ghost" className="w-full gap-2 text-primary" onClick={() => setKeyOpen(true)}>
                    <Key className="h-4 w-4" />Enter Activation Key
                  </Button>
                  <Link to="/how-it-works#how-to-pay">
                    <Button variant="ghost" className="w-full gap-2 text-muted-foreground text-xs">
                      <HelpCircle className="h-3.5 w-3.5" />Payment help guide
                    </Button>
                  </Link>
                </div>
              </div>
              <RequeryPanel
                open={premReqOpen} txId={premReqTxId} loading={premReqLoading} error={premReqError} success={premReqSuccess} amount="₦5,000"
                onToggle={() => { setPremReqOpen(o => !o); setPremReqError(''); setPremReqSuccess('') }}
                onTxChange={setPremReqTxId} onVerify={requeryPremium}
              />
            </div>
          </div>
        )}

        {/* ── PRACTICE CADRES ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-serif text-xl font-bold">Practice Cadres</h2>
              <p className="text-sm text-muted-foreground">
                {user?.premium
                  ? 'All cadres unlocked — pick a subject and start practising'
                  : 'Current Affairs is free. Pay ₦5,000 to unlock all 21 cadres.'}
              </p>
            </div>
            {!user?.premium && (
              <Button size="sm" variant="outline" onClick={() => setKeyOpen(true)} className="gap-1.5 hidden sm:flex border-primary/30 text-primary hover:bg-primary/5">
                <Key className="h-3.5 w-3.5" />Enter Key
              </Button>
            )}
          </div>

          {/* Free cadre highlight */}
          <div className="mb-3 rounded-lg border-2 border-green-200 bg-green-50 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📰</span>
              <div>
                <div className="font-semibold text-sm text-green-800">Current Affairs — Free for Everyone</div>
                <div className="text-xs text-green-600">No payment needed • 45 min • 70 questions</div>
              </div>
            </div>
            <Button size="sm" onClick={() => nav('/exam/current-affairs')} className="gap-1.5 bg-green-600 hover:bg-green-700 flex-shrink-0">
              <Play className="h-3.5 w-3.5" />Start Free
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {CADRES.filter(c => c.key !== 'current-affairs').map(c => {
              const locked = !user?.premium
              const icon = CADRE_ICONS[c.key] || '📚'
              return (
                <div key={c.key} className={`rounded-lg border bg-white p-4 cadre-card ${locked ? 'opacity-75' : 'cursor-pointer hover:border-primary/30'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{icon}</span>
                      <div className="font-semibold text-sm leading-tight">{c.label}</div>
                    </div>
                    {locked && <Lock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />}
                  </div>
                  <div className="flex gap-2">
                    {locked ? (
                      <>
                        <Button size="sm" variant="outline" onClick={() => setKeyOpen(true)} className="text-xs gap-1 flex-1 border-primary/20 text-primary hover:bg-primary/5">
                          <Key className="h-3 w-3" />Unlock — ₦5,000
                        </Button>
                        <a href="https://wa.me/2348138474528" target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="ghost" className="text-xs gap-1 text-green-700"><MessageCircle className="h-3 w-3" /></Button>
                        </a>
                      </>
                    ) : (
                      <Button size="sm" onClick={() => nav(`/exam/${c.key}`)} className="gap-1.5 flex-1 text-xs">
                        <BookOpen className="h-3 w-3" />Start Practice<ChevronRight className="h-3 w-3 ml-auto" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── AI CBT PLATFORM ── */}
        <div>
          <div className="mb-4">
            <h2 className="font-serif text-xl font-bold">AI-Powered CBT Platform</h2>
            <p className="text-sm text-muted-foreground">Advanced adaptive testing — included with CBT Premium (₦5,000)</p>
          </div>
          {user?.premium ? (
            <div className="rounded-xl border border-primary/20 bg-white overflow-hidden shadow-sm">
              <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #1a5c35, #2d8a52)' }} />
              <div className="p-8 flex flex-col items-center text-center">
                <div className="h-16 w-16 bg-primary/8 rounded-2xl flex items-center justify-center mb-4 border border-primary/15">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-2">AI CBT Platform Ready</h3>
                <p className="text-muted-foreground text-sm max-w-md mb-6">
                  Experience adaptive AI-powered testing with personalized question selection and immediate feedback.
                </p>
                <Button size="lg" className="gap-2 px-8" onClick={openCBTPlatform}>
                  <>Open AI CBT Platform<Sparkles className="h-4 w-4" /></>
                </Button>
                <p className="text-xs text-muted-foreground mt-3">Secured access — opens within this website</p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border bg-white p-6">
              <div className="flex items-center gap-3 text-muted-foreground mb-4">
                <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center"><Lock className="h-5 w-5" /></div>
                <div>
                  <p className="font-semibold text-sm text-foreground">CBT Premium Feature</p>
                  <p className="text-xs">Included with the ₦5,000 CBT Premium plan</p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button onClick={goPayPremium} className="gap-2"><CreditCard className="h-4 w-4" />Pay ₦5,000 to Unlock</Button>
                <Button variant="outline" onClick={() => setKeyOpen(true)} className="gap-2 border-primary/30 text-primary"><Key className="h-4 w-4" />Enter Key</Button>
              </div>
            </div>
          )}
        </div>

        {/* ── PAST QUESTIONS ── */}
        <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #7c3aed, #a855f7)' }} />
          <div className="p-6">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-5 w-5 text-purple-600" />
              <h2 className="font-serif text-lg font-bold">Past Exam Questions</h2>
              <span className="inline-block text-[10px] font-bold uppercase tracking-wide bg-purple-50 text-purple-700 rounded-full px-2 py-0.5 border border-purple-200 ml-1">₦7,000 — Separate Payment</span>
            </div>
            <p className="text-sm text-muted-foreground mb-1 leading-relaxed">
              Download official FCT CBT past questions. Covers all cadres, updated regularly. Pay once, download instantly.
            </p>
            <div className="text-xs bg-purple-50 border border-purple-100 rounded-lg px-3 py-2 mb-4 text-purple-800">
              ⚠️ <strong>Note:</strong> This is a separate ₦7,000 purchase. It is NOT included in CBT Premium.
            </div>

            {pastqError && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />{pastqError}
              </div>
            )}

            {pastq.unlocked ? (
              <div className="flex flex-col gap-3">
                <div className="inline-flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2 border border-green-200 font-semibold">
                  <CheckCircle className="h-4 w-4" />Payment Verified — Download Ready
                </div>
                {pastq.download_url ? (
                  <a href={pastq.download_url} target="_blank" rel="noopener noreferrer">
                    <Button className="gap-2 bg-purple-600 hover:bg-purple-700">
                      <Download className="h-4 w-4" />Download Past Questions
                    </Button>
                  </a>
                ) : (
                  <div className="text-sm text-muted-foreground p-3 bg-muted/40 rounded-lg border">
                    Download link being prepared. Contact admin via WhatsApp if urgent.
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={goPayPastq} className="gap-2 bg-purple-600 hover:bg-purple-700">
                    <CreditCard className="h-4 w-4" />Pay ₦7,000 to Download
                  </Button>
                  <a href="https://wa.me/2348138474528" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="gap-2 border-green-300 text-green-700 hover:bg-green-50">
                      <MessageCircle className="h-4 w-4" />WhatsApp Enquiry
                    </Button>
                  </a>
                </div>
                <RequeryPanel
                  open={pqReqOpen} txId={pqReqTxId} loading={pqReqLoading} error={pqReqError} success={pqReqSuccess} amount="₦7,000"
                  onToggle={() => { setPqReqOpen(o => !o); setPqReqError(''); setPqReqSuccess('') }}
                  onTxChange={setPqReqTxId} onVerify={requeryPastq}
                />
              </div>
            )}
          </div>
        </div>

        {/* ── WINDOWS SOFTWARE ── */}
        <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #1e40af, #3b82f6)' }} />
          <div className="p-6">
            <div className="flex items-center gap-2 mb-1">
              <Monitor className="h-5 w-5 text-blue-600" />
              <h2 className="font-serif text-lg font-bold">Windows Enterprise Software</h2>
              <span className="inline-block text-[10px] font-bold uppercase tracking-wide bg-blue-50 text-blue-700 rounded-full px-2 py-0.5 border border-blue-200 ml-1">₦100,000 — Separate Payment</span>
            </div>
            <p className="text-sm text-muted-foreground mb-1 leading-relaxed">
              Professional offline CBT software for Windows. For offices, training centres, and enterprise use.
            </p>
            <div className="text-xs bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mb-4 text-blue-800">
              ⚠️ <strong>Note:</strong> This is a separate ₦100,000 purchase for organisations. NOT included in CBT Premium.
            </div>

            {softwareError && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />{softwareError}
              </div>
            )}

            {software.unlocked ? (
              <div className="flex flex-col gap-3">
                <div className="inline-flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2 border border-green-200 font-semibold">
                  <CheckCircle className="h-4 w-4" />Payment Verified — Software Unlocked
                </div>
                {software.download_url ? (
                  <a href={software.download_url} target="_blank" rel="noopener noreferrer">
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                      <Download className="h-4 w-4" />Download Windows Software
                    </Button>
                  </a>
                ) : (
                  <div className="text-sm text-muted-foreground p-3 bg-muted/40 rounded-lg border">
                    Download link will be available shortly. Contact admin via WhatsApp if urgent.
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={goPaySoftware} className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <CreditCard className="h-4 w-4" />Pay ₦100,000 to Unlock
                  </Button>
                  <a href="https://wa.me/2348138474528" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="gap-2 border-green-300 text-green-700 hover:bg-green-50">
                      <MessageCircle className="h-4 w-4" />WhatsApp Enquiry
                    </Button>
                  </a>
                </div>
                <RequeryPanel
                  open={swReqOpen} txId={swReqTxId} loading={swReqLoading} error={swReqError} success={swReqSuccess} amount="₦100,000"
                  onToggle={() => { setSwReqOpen(o => !o); setSwReqError(''); setSwReqSuccess('') }}
                  onTxChange={setSwReqTxId} onVerify={requerySoftware}
                />
              </div>
            )}
          </div>
        </div>

        {/* ── 1-ON-1 CONSULTATION ── */}
        <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #059669, #10b981)' }} />
          <div className="p-6">
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="h-5 w-5 text-green-600" />
              <h2 className="font-serif text-lg font-bold">1-on-1 Expert Teaching</h2>
              <span className="inline-block text-[10px] font-bold uppercase tracking-wide bg-green-50 text-green-700 rounded-full px-2 py-0.5 border border-green-200 ml-1">On Request</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Get private coaching on exam strategies, topic-by-topic guidance. Request a session — admin will reply with details and payment info.
            </p>
            <Button onClick={() => setConsultOpen(true)} className="gap-2 bg-green-600 hover:bg-green-700 mb-4">
              <GraduationCap className="h-4 w-4" />Request a Session
            </Button>

            {myConsultations.length > 0 && (
              <div className="space-y-3 mt-2">
                <h3 className="text-sm font-semibold">Your Session Requests</h3>
                {myConsultations.map(c => (
                  <div key={c.id} className="rounded-lg border p-4 text-sm space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold">{c.topic}</div>
                      <span className={`inline-flex text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 border ${statusColor[c.status] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>{c.status}</span>
                    </div>
                    <p className="text-muted-foreground text-xs">{c.details}</p>
                    {c.admin_reply && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="text-[10px] font-bold text-green-700 uppercase mb-1">Admin Response</div>
                        <p className="text-sm">{c.admin_reply}</p>
                        {c.session_time && <p className="text-xs text-muted-foreground mt-1">📅 Session: <strong>{c.session_time}</strong></p>}
                        {c.payment_link && (
                          <a href={c.payment_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-primary hover:underline">
                            <CreditCard className="h-3 w-3" />Pay for Session
                          </a>
                        )}
                      </div>
                    )}
                    <p className="text-[10px] text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── FEEDBACK ── */}
        <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #e11d48, #f43f5e)' }} />
          <div className="p-6">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="h-5 w-5 text-rose-600" />
              <h2 className="font-serif text-lg font-bold">Feedback &amp; Support</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Send suggestions, complaints, or report an issue directly to admin.</p>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={() => setFeedbackOpen(true)} variant="outline" className="gap-2 border-rose-300 text-rose-700 hover:bg-rose-50">
                <MessageSquare className="h-4 w-4" />Submit Feedback
              </Button>
              <a href="https://wa.me/2348138474528" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="gap-2 border-green-300 text-green-700 hover:bg-green-50">
                  <MessageCircle className="h-4 w-4" />WhatsApp Direct
                </Button>
              </a>
            </div>

            {myFeedbacks.length > 0 && (
              <div className="space-y-3 mt-4">
                <h3 className="text-sm font-semibold">Your Feedback History</h3>
                {myFeedbacks.map(fb => (
                  <div key={fb.id} className="rounded-lg border p-4 text-sm space-y-2">
                    {fb.subject && <div className="font-semibold text-xs text-muted-foreground">Subject: {fb.subject}</div>}
                    <p className="text-sm">{fb.message}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(fb.created_at).toLocaleDateString()}</p>
                    {fb.admin_reply && (
                      <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                        <div className="text-[10px] font-bold text-rose-700 uppercase mb-1">Admin Reply</div>
                        <p className="text-sm">{fb.admin_reply}</p>
                        {fb.replied_at && <p className="text-[10px] text-muted-foreground mt-1">{new Date(fb.replied_at).toLocaleDateString()}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── DIALOGS ── */}

      <Dialog open={keyOpen} onOpenChange={o => { setKeyOpen(o); if (!o) { setActivationKey(''); setKeyError('') } }}>
        <DialogTrigger asChild><span /></DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif flex items-center gap-2"><Key className="h-4 w-4 text-primary" />Enter CBT Activation Key</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Activation keys unlock CBT practice access (all cadres + AI platform).
            Windows Software and Past Questions require separate payment.
          </p>
          <Input
            value={activationKey}
            onChange={e => setActivationKey(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && redeemKey()}
            placeholder="ACT-XXXXXXXX"
            className="font-mono"
          />
          {keyError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/8 px-3 py-2 text-xs text-destructive flex items-center gap-2">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />{keyError}
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setKeyOpen(false)}>Cancel</Button>
            <Button onClick={redeemKey} disabled={keyLoading} className="gap-2">
              {keyLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}Activate
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={consultOpen} onOpenChange={o => { setConsultOpen(o); if (!o) { setConsultSuccess(''); setConsultError('') } }}>
        <DialogTrigger asChild><span /></DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif flex items-center gap-2"><GraduationCap className="h-4 w-4 text-green-600" />Request 1-on-1 Teaching Session</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Describe what you need help with. Admin will reply with details and your payment link.</p>
          {consultSuccess ? (
            <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 font-semibold flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />{consultSuccess}
            </div>
          ) : (
            <>
              <Input value={consultTopic} onChange={e => setConsultTopic(e.target.value)} placeholder="Topic (e.g. English Comprehension strategy)" />
              <Textarea value={consultDetails} onChange={e => setConsultDetails(e.target.value)} placeholder="Describe what you want to learn, your level, and specific challenges…" rows={4} />
              {consultError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/8 px-3 py-2 text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />{consultError}
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setConsultOpen(false)}>Cancel</Button>
                <Button onClick={submitConsultation} disabled={consultLoading} className="gap-2 bg-green-600 hover:bg-green-700">
                  {consultLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GraduationCap className="h-4 w-4" />}Send Request
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={feedbackOpen} onOpenChange={o => { setFeedbackOpen(o); if (!o) { setFeedbackSuccess(''); setFeedbackError('') } }}>
        <DialogTrigger asChild><span /></DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif flex items-center gap-2"><MessageSquare className="h-4 w-4 text-rose-600" />Submit Feedback</DialogTitle>
          </DialogHeader>
          {feedbackSuccess ? (
            <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 font-semibold flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />{feedbackSuccess}
            </div>
          ) : (
            <>
              <Input value={feedbackSubject} onChange={e => setFeedbackSubject(e.target.value)} placeholder="Subject (optional)" />
              <Textarea value={feedbackMsg} onChange={e => setFeedbackMsg(e.target.value)} placeholder="Write your feedback, suggestion, or report here…" rows={4} />
              {feedbackError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/8 px-3 py-2 text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />{feedbackError}
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setFeedbackOpen(false)}>Cancel</Button>
                <Button onClick={submitFeedback} disabled={feedbackLoading} className="gap-2 bg-rose-600 hover:bg-rose-700">
                  {feedbackLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}Send Feedback
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  )
}
