import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, RotateCcw, Shield, Loader2, AlertCircle,
  Download, History, X, Clock, Trash2, ExternalLink,
  Home, Maximize2, Minimize2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// ─── Types ────────────────────────────────────────────────────────────────────
type HistoryEntry = {
  id: string
  title: string
  visitedAt: number
  duration?: number
}

type DownloadEntry = {
  id: string
  filename: string
  initiatedAt: number
  status: 'pending' | 'complete' | 'failed'
  note?: string
}

type Panel = 'none' | 'history' | 'downloads'

// ─── localStorage helpers ─────────────────────────────────────────────────────
const HK = 'cbt_browser_history'
const DK = 'cbt_browser_downloads'

function loadHistory(): HistoryEntry[] {
  try { return JSON.parse(localStorage.getItem(HK) || '[]') } catch { return [] }
}
function saveHistory(h: HistoryEntry[]) {
  try { localStorage.setItem(HK, JSON.stringify(h.slice(0, 100))) } catch {}
}
function loadDownloads(): DownloadEntry[] {
  try { return JSON.parse(localStorage.getItem(DK) || '[]') } catch { return [] }
}
function saveDownloads(d: DownloadEntry[]) {
  try { localStorage.setItem(DK, JSON.stringify(d.slice(0, 50))) } catch {}
}
function fmtTime(ms: number) {
  return new Date(ms).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function fmtDur(s: number) {
  if (s < 60) return `${s}s`
  if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CbtBrowser() {
  const nav = useNavigate()

  const [cbtUrl, setCbtUrl]       = useState<string | null>(null)
  const [phase, setPhase]         = useState<'fetching' | 'loading' | 'live' | 'error'>('fetching')
  const [errorMsg, setErrorMsg]   = useState('')
  const [iframeKey, setIframeKey] = useState(0)   // increment to force iframe remount
  const [fullscreen, setFullscreen] = useState(false)
  const [panel, setPanel]         = useState<Panel>('none')

  const [history, setHistory]     = useState<HistoryEntry[]>(loadHistory)
  const [downloads, setDownloads] = useState<DownloadEntry[]>(loadDownloads)

  const sessionStart  = useRef(0)
  const sessionCount  = useRef(0)
  const iframeRef     = useRef<HTMLIFrameElement>(null)

  // ── Fetch the real URL from backend ─────────────────────────────────────────
  const fetchUrl = useCallback(async () => {
    setPhase('fetching')
    setErrorMsg('')
    try {
      const r = await fetch('/api/cbt/url', { credentials: 'include' })
      if (!r.ok) {
        const e = await r.json().catch(() => ({ error: 'Access denied' }))
        throw new Error(e.error || 'Failed to load platform')
      }
      const { url } = await r.json()
      setCbtUrl(url)
      setPhase('loading')
      setIframeKey(k => k + 1)

      // Track session
      sessionStart.current = Date.now()
      sessionCount.current += 1
      const entry: HistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: `CBT Session${sessionCount.current > 1 ? ` #${sessionCount.current}` : ''}`,
        visitedAt: Date.now(),
      }
      const updated = [entry, ...history]
      setHistory(updated)
      saveHistory(updated)
    } catch (e: any) {
      setErrorMsg(e.message || 'Unknown error')
      setPhase('error')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { fetchUrl() }, [fetchUrl])

  // Back-button from bfcache → send back to dashboard
  useEffect(() => {
    const h = (e: PageTransitionEvent) => { if (e.persisted) nav('/dashboard', { replace: true }) }
    window.addEventListener('pageshow', h)
    return () => window.removeEventListener('pageshow', h)
  }, [nav])

  // postMessage download tracking
  useEffect(() => {
    const h = (e: MessageEvent) => {
      if (e.data?.type === 'cbt_download') addDownload(e.data.filename || 'CBT File', e.data.note)
    }
    window.addEventListener('message', h)
    return () => window.removeEventListener('message', h)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function reload() {
    // Stamp duration on last history entry
    if (sessionStart.current && history.length > 0) {
      const secs = Math.round((Date.now() - sessionStart.current) / 1000)
      const updated = history.map((h, i) => i === 0 ? { ...h, duration: secs } : h)
      setHistory(updated); saveHistory(updated)
    }
    fetchUrl()
  }

  function addDownload(filename: string, note?: string) {
    const entry: DownloadEntry = { id: `dl-${Date.now()}`, filename, initiatedAt: Date.now(), status: 'pending', note }
    const updated = [entry, ...downloads]
    setDownloads(updated); saveDownloads(updated)
  }

  function markDone(id: string) {
    const u = downloads.map(d => d.id === id ? { ...d, status: 'complete' as const } : d)
    setDownloads(u); saveDownloads(u)
  }

  function removeDownload(id: string) { const u = downloads.filter(d => d.id !== id); setDownloads(u); saveDownloads(u) }
  function removeHistoryItem(id: string) { const u = history.filter(h => h.id !== id); setHistory(u); saveHistory(u) }
  function clearDl() { setDownloads([]); saveDownloads([]) }
  function clearHist() { setHistory([]); saveHistory([]) }
  const togglePanel = (p: Panel) => setPanel(prev => prev === p ? 'none' : p)

  const pendingDl = downloads.filter(d => d.status === 'pending').length

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-[#1e1e2e]">

      {/* ── Chrome bar ───────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 border-b border-white/10 bg-[#12121e]">

        {/* Traffic lights */}
        <div className="flex items-center gap-1.5 mr-1 flex-shrink-0">
          <button onClick={() => nav('/dashboard')} title="Back to Dashboard"
            className="h-3 w-3 rounded-full bg-[#ff5f56] hover:brightness-125 transition-all flex-shrink-0" />
          <div className="h-3 w-3 rounded-full bg-[#ffbd2e] flex-shrink-0" />
          <button onClick={() => { setFullscreen(f => !f); setPanel('none') }} title="Toggle fullscreen"
            className="h-3 w-3 rounded-full bg-[#27c93f] hover:brightness-125 transition-all flex-shrink-0" />
        </div>

        {/* Nav buttons */}
        <button onClick={() => nav('/dashboard')} title="Back to Dashboard"
          className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button onClick={reload} title="Reload"
          disabled={phase === 'fetching' || phase === 'loading'}
          className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed">
          <RotateCcw className={`h-4 w-4 ${phase === 'fetching' || phase === 'loading' ? 'animate-spin' : ''}`} />
        </button>

        {/* Address bar */}
        <div className="flex-1 flex items-center gap-2 rounded-lg bg-white/8 border border-white/10 px-3 py-1.5 min-w-0">
          <Shield className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
          <span className="text-white/55 text-xs font-mono truncate flex-1">
            FCT AI CBT Platform — Secured Session
          </span>
          {(phase === 'fetching' || phase === 'loading') && (
            <Loader2 className="h-3.5 w-3.5 text-white/40 animate-spin flex-shrink-0" />
          )}
          {phase === 'live' && (
            <span className="text-[10px] text-green-400 font-semibold flex-shrink-0 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 inline-block" />Live
            </span>
          )}
        </div>

        {/* Right toolbar */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => togglePanel('downloads')} title="Downloads"
            className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              panel === 'downloads' ? 'bg-white/15 text-white' : 'text-white/45 hover:text-white hover:bg-white/10'
            }`}>
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Downloads</span>
            {pendingDl > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-500 text-[9px] text-white flex items-center justify-center font-bold">
                {pendingDl}
              </span>
            )}
          </button>

          <button onClick={() => togglePanel('history')} title="History"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              panel === 'history' ? 'bg-white/15 text-white' : 'text-white/45 hover:text-white hover:bg-white/10'
            }`}>
            <History className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">History</span>
            {history.length > 0 && <span className="text-[10px] text-white/25 hidden sm:inline">({history.length})</span>}
          </button>

          <button onClick={() => { setFullscreen(f => !f); setPanel('none') }} title="Toggle fullscreen"
            className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors">
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* ── Body: iframe + side panels ───────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Iframe area ─────────────────────────────────────────────── */}
        <div className="relative flex-1 min-w-0 bg-[#1a1a2e]">

          {/* Fetching / loading overlay */}
          {(phase === 'fetching' || phase === 'loading') && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 bg-[#1a1a2e]">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <svg viewBox="0 0 40 40" fill="none" className="h-10 w-10">
                  <circle cx="20" cy="20" r="20" fill="url(#ol-bg)" />
                  <path d="M23 4L10 22h9l-2 14 13-18h-9L23 4z" fill="url(#ol-bolt)" stroke="#f0d070" strokeWidth="0.5" />
                  <defs>
                    <radialGradient id="ol-bg" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#c8a84b" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#1a5c35" stopOpacity="0.9" />
                    </radialGradient>
                    <linearGradient id="ol-bolt" x1="10" y1="4" x2="23" y2="36" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#fff5a0" />
                      <stop offset="40%" stopColor="#f0d070" />
                      <stop offset="100%" stopColor="#c8a84b" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="text-center">
                <p className="text-white font-semibold text-base mb-1">
                  {phase === 'fetching' ? 'Loading CBT Platform…' : 'Opening your session…'}
                </p>
                <p className="text-white/35 text-xs">
                  {phase === 'fetching' ? 'Verifying your premium access' : 'Almost ready'}
                </p>
              </div>
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            </div>
          )}

          {/* Error state */}
          {phase === 'error' && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 px-6 bg-[#1a1a2e]">
              <div className="h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-400" />
              </div>
              <div className="text-center max-w-sm">
                <h2 className="text-white font-bold text-lg mb-2">Could Not Load Platform</h2>
                <p className="text-white/50 text-sm leading-relaxed bg-red-900/20 border border-red-500/20 rounded-lg px-4 py-3">
                  {errorMsg}
                </p>
              </div>
              <div className="flex gap-3">
                <Button onClick={reload} className="gap-2 bg-primary hover:bg-primary/90">
                  <RotateCcw className="h-4 w-4" /> Try Again
                </Button>
                <Button variant="outline" onClick={() => nav('/dashboard')}
                  className="gap-2 border-white/20 text-white hover:bg-white/10 bg-transparent">
                  <ArrowLeft className="h-4 w-4" /> Dashboard
                </Button>
              </div>
            </div>
          )}

          {/* The iframe — direct URL, no redirect */}
          {cbtUrl && (
            <iframe
              key={iframeKey}
              ref={iframeRef}
              src={cbtUrl}
              title="FCT AI CBT Platform"
              onLoad={() => setPhase('live')}
              onError={() => { setPhase('error'); setErrorMsg('The platform failed to load. Check your connection and try again.') }}
              style={{ display: phase === 'error' ? 'none' : 'block' }}
              className="w-full h-full border-0"
              sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-downloads allow-modals"
              referrerPolicy="no-referrer"
              allow="clipboard-write"
            />
          )}
        </div>

        {/* ── History panel ────────────────────────────────────────────── */}
        {panel === 'history' && (
          <div className="w-72 flex-shrink-0 border-l border-white/10 bg-[#12121e] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-white/50" />
                <span className="text-sm font-semibold text-white">History</span>
              </div>
              <div className="flex items-center gap-1">
                {history.length > 0 && (
                  <button onClick={clearHist}
                    className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-white/35 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    <Trash2 className="h-3 w-3" /> Clear
                  </button>
                )}
                <button onClick={() => setPanel('none')}
                  className="p-1 rounded text-white/35 hover:text-white hover:bg-white/10 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 py-16 text-center px-4">
                  <Clock className="h-10 w-10 text-white/15" />
                  <p className="text-white/35 text-sm">No sessions yet</p>
                  <p className="text-white/20 text-xs leading-relaxed">Your CBT sessions will appear here</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {history.map(entry => (
                    <div key={entry.id} className="group px-4 py-3 hover:bg-white/5 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <div className="h-4 w-4 rounded bg-primary/20 border border-primary/25 flex items-center justify-center flex-shrink-0">
                              <svg viewBox="0 0 16 16" fill="none" className="h-2.5 w-2.5">
                                <path d="M9 2L4 9h3.5L6 14 11 7H7.5L9 2z" fill="#c8a84b" />
                              </svg>
                            </div>
                            <span className="text-xs font-medium text-white/75 truncate">{entry.title}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-white/30">
                            <Clock className="h-2.5 w-2.5 flex-shrink-0" />
                            <span>{fmtTime(entry.visitedAt)}</span>
                            {entry.duration !== undefined && (
                              <><span>·</span><span>{fmtDur(entry.duration)}</span></>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={reload} title="Reopen" className="p-1 rounded text-white/35 hover:text-green-400 hover:bg-green-500/10 transition-colors">
                            <ExternalLink className="h-3 w-3" />
                          </button>
                          <button onClick={() => removeHistoryItem(entry.id)} title="Remove" className="p-1 rounded text-white/35 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {history.length > 0 && (
              <div className="px-4 py-2.5 border-t border-white/8 flex-shrink-0">
                <p className="text-[10px] text-white/25 text-center">{history.length} session{history.length !== 1 ? 's' : ''} stored locally</p>
              </div>
            )}
          </div>
        )}

        {/* ── Downloads panel ──────────────────────────────────────────── */}
        {panel === 'downloads' && (
          <div className="w-72 flex-shrink-0 border-l border-white/10 bg-[#12121e] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-white/50" />
                <span className="text-sm font-semibold text-white">Downloads</span>
              </div>
              <div className="flex items-center gap-1">
                {downloads.length > 0 && (
                  <button onClick={clearDl}
                    className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-white/35 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    <Trash2 className="h-3 w-3" /> Clear
                  </button>
                )}
                <button onClick={() => setPanel('none')}
                  className="p-1 rounded text-white/35 hover:text-white hover:bg-white/10 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Info + manual log */}
            <div className="px-4 py-3 border-b border-white/8 space-y-2 flex-shrink-0">
              <p className="text-[11px] text-blue-300/70 leading-relaxed bg-blue-500/8 border border-blue-500/12 rounded-lg px-3 py-2">
                Downloads from the CBT platform appear here automatically, or log one manually.
              </p>
              <button
                onClick={() => {
                  const name = prompt('Enter filename or description:')
                  if (name?.trim()) addDownload(name.trim(), 'Manually logged')
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-white/45 hover:text-white hover:border-white/20 hover:bg-white/5 transition-colors text-xs font-medium">
                <Download className="h-3.5 w-3.5" /> Log a download manually
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {downloads.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 py-12 text-center px-4">
                  <Download className="h-10 w-10 text-white/15" />
                  <p className="text-white/35 text-sm">No downloads yet</p>
                  <p className="text-white/20 text-xs leading-relaxed">Downloads from the platform will appear here</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {downloads.map(dl => (
                    <div key={dl.id} className="group px-4 py-3 hover:bg-white/5 transition-colors">
                      <div className="flex items-start gap-2.5">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          dl.status === 'complete' ? 'bg-green-500/12 border border-green-500/20' :
                          dl.status === 'failed'   ? 'bg-red-500/12 border border-red-500/20' :
                                                     'bg-blue-500/12 border border-blue-500/20'
                        }`}>
                          <Download className={`h-4 w-4 ${
                            dl.status === 'complete' ? 'text-green-400' :
                            dl.status === 'failed'   ? 'text-red-400' : 'text-blue-400'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-white/75 truncate">{dl.filename}</p>
                          {dl.note && <p className="text-[10px] text-white/30 mt-0.5">{dl.note}</p>}
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${
                              dl.status === 'complete' ? 'bg-green-500/12 text-green-400' :
                              dl.status === 'failed'   ? 'bg-red-500/12 text-red-400' :
                                                         'bg-blue-500/12 text-blue-400'
                            }`}>{dl.status}</span>
                            <span className="text-[10px] text-white/25">{fmtTime(dl.initiatedAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          {dl.status === 'pending' && (
                            <button onClick={() => markDone(dl.id)} title="Mark complete"
                              className="p-1 rounded text-white/35 hover:text-green-400 hover:bg-green-500/10 transition-colors">
                              <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3">
                                <path d="M1.5 6l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                          )}
                          <button onClick={() => removeDownload(dl.id)} title="Remove"
                            className="p-1 rounded text-white/35 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {downloads.length > 0 && (
              <div className="px-4 py-2.5 border-t border-white/8 flex-shrink-0">
                <p className="text-[10px] text-white/25 text-center">
                  {downloads.filter(d => d.status === 'complete').length} done · {pendingDl} pending
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Status bar ───────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-1.5 border-t border-white/8 bg-[#0e0e1a]">
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-white/20 font-mono">FCT CBT Practice Preparation</span>
          {phase === 'live' && (
            <span className="flex items-center gap-1 text-[10px] text-green-400/55">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />Connected
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-white/20">
            {history.length} session{history.length !== 1 ? 's' : ''} · {downloads.length} download{downloads.length !== 1 ? 's' : ''}
          </span>
          <button onClick={() => nav('/dashboard')}
            className="flex items-center gap-1 text-[10px] text-white/25 hover:text-white/55 transition-colors">
            <Home className="h-3 w-3" /> Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
