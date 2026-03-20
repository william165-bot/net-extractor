import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { User, Mail, Lock, UserPlus, LogIn, AlertCircle, ChevronRight, HelpCircle, Eye, EyeOff } from 'lucide-react'

export default function AuthPage() {
  const [mode, setMode] = useState<'signin'|'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const nav = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const m = searchParams.get('mode')
    if (m === 'signup' || m === 'signin') setMode(m as any)
    const err = searchParams.get('error')
    if (err === 'blocked') setError('Your account has been blocked by an administrator. Contact WhatsApp support.')
  }, [searchParams])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password || (mode === 'signup' && !name)) {
      setError('Please fill in all required fields.')
      return
    }
    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }
    setLoading(true); setError('')
    try {
      if (mode === 'signup') await api('/auth/signup', { method: 'POST', body: JSON.stringify({ email, password, name }) })
      else await api('/auth/signin', { method: 'POST', body: JSON.stringify({ email, password }) })
      nav('/dashboard')
    } catch (e: any) {
      setError(e?.error || 'An error occurred. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-96 bg-primary p-10 text-white flex-shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 bg-white/10 rounded-xl p-1">
              <circle cx="20" cy="20" r="20" fill="url(#authBg)" />
              <path d="M23 4L10 22h9l-2 14 13-18h-9L23 4z" fill="url(#authBolt)" stroke="#f0d070" strokeWidth="0.5" />
              <defs>
                <radialGradient id="authBg" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#c8a84b" stopOpacity="0.3" /><stop offset="100%" stopColor="#1a5c35" stopOpacity="0.9" /></radialGradient>
                <linearGradient id="authBolt" x1="10" y1="4" x2="23" y2="36" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#fff5a0" /><stop offset="40%" stopColor="#f0d070" /><stop offset="100%" stopColor="#c8a84b" /></linearGradient>
              </defs>
            </svg>
            <div>
              <div className="font-serif font-bold text-lg leading-tight">FCT CBT Practice</div>
              <div className="text-[10px] tracking-widest text-white/60 uppercase">Federal Capital Territory</div>
            </div>
          </div>
          <h2 className="font-serif text-3xl font-bold leading-snug mb-4">
            Your gateway to exam success in the FCT
          </h2>
          <p className="text-white/70 leading-relaxed text-sm">
            Access hundreds of carefully curated questions across 21+ professional cadres. Build confidence before your CBT examination.
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-white/10 border border-white/20 p-4">
            <div className="text-xs font-bold uppercase tracking-wide text-white/50 mb-2">What you get free:</div>
            <div className="space-y-2">
              {['Create account — free forever', 'Current Affairs practice — free', 'Instant score & review — free'].map(item => (
                <div key={item} className="flex items-center gap-2 text-sm text-white/80">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-400 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-white/10 border border-white/20 p-4">
            <div className="text-xs font-bold uppercase tracking-wide text-white/50 mb-2">Unlock with ₦5,000:</div>
            <div className="space-y-2">
              {['All 21 professional cadres', 'AI-powered CBT platform', 'Timed exam practice'].map(item => (
                <div key={item} className="flex items-center gap-2 text-sm text-white/80">
                  <div className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{background: '#c8a84b'}} />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs text-white/40">
            Federal Capital Territory Administration © {new Date().getFullYear()}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-muted/20">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-6">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-10 w-10">
              <circle cx="20" cy="20" r="20" fill="url(#mobBg)" />
              <path d="M23 4L10 22h9l-2 14 13-18h-9L23 4z" fill="url(#mobBolt)" stroke="#f0d070" strokeWidth="0.5" />
              <defs>
                <radialGradient id="mobBg" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#c8a84b" stopOpacity="0.3" /><stop offset="100%" stopColor="#1a5c35" stopOpacity="0.9" /></radialGradient>
                <linearGradient id="mobBolt" x1="10" y1="4" x2="23" y2="36" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#fff5a0" /><stop offset="40%" stopColor="#f0d070" /><stop offset="100%" stopColor="#c8a84b" /></linearGradient>
              </defs>
            </svg>
            <div className="font-serif font-bold text-primary text-lg">FCT CBT Practice Preparation</div>
          </div>

          {/* Free info banner on mobile */}
          <div className="lg:hidden bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-5 text-sm text-green-800">
            🆓 <strong>Registration is free.</strong> Current Affairs practice is also free — no payment needed to start.
          </div>

          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            {/* Tab switcher */}
            <div className="flex border-b">
              {(['signin', 'signup'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError('') }}
                  className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                    mode === m
                      ? 'text-primary border-b-2 border-primary bg-primary/4'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {m === 'signin' ? '🔑 Sign In' : '📝 Create Account'}
                </button>
              ))}
            </div>

            <div className="p-7">
              <h1 className="font-serif text-xl font-bold text-foreground mb-1">
                {mode === 'signin' ? 'Welcome back' : 'Create your free account'}
              </h1>
              <p className="text-sm text-muted-foreground mb-6">
                {mode === 'signin'
                  ? 'Enter your email and password to continue'
                  : 'Register in seconds — just your name, email, and a password'}
              </p>

              <form onSubmit={submit} className="space-y-4">
                {mode === 'signup' && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-primary" /> Your Full Name
                    </label>
                    <Input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Amaka Okonkwo"
                      className="h-11"
                      autoComplete="name"
                    />
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-primary" /> Email Address
                  </label>
                  <Input
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    type="email"
                    className="h-11"
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-primary" /> Password
                    {mode === 'signup' && <span className="text-[10px] text-muted-foreground font-normal ml-1">(min. 6 characters)</span>}
                  </label>
                  <div className="relative">
                    <Input
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      type={showPassword ? 'text' : 'password'}
                      className="h-11 pr-10"
                      autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/8 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <Button type="submit" disabled={loading} className="w-full h-11 font-bold text-sm gap-2 mt-1">
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Processing…
                    </>
                  ) : mode === 'signin' ? (
                    <><LogIn className="h-4 w-4" /> Sign In <ChevronRight className="h-4 w-4 ml-auto" /></>
                  ) : (
                    <><UserPlus className="h-4 w-4" /> Create Free Account <ChevronRight className="h-4 w-4 ml-auto" /></>
                  )}
                </Button>
              </form>

              {mode === 'signup' && (
                <p className="text-[11px] text-muted-foreground text-center mt-3 leading-relaxed">
                  By registering you agree to use this platform for FCTA exam preparation purposes only.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">← Back to Home</Link>
            </p>
            <Link to="/how-it-works" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
              <HelpCircle className="h-3.5 w-3.5" />How it works
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
