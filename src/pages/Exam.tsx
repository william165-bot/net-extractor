import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Question } from '@/types'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, Clock, ChevronLeft, ChevronRight, Send, RotateCcw, CheckCircle, XCircle, BookOpen, SkipForward, Grid, List } from 'lucide-react'

const EXAM_SECONDS = 45 * 60
const MAX_QUESTIONS = 70

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function ExamPage() {
  const { cadre } = useParams()
  const nav = useNavigate()
  const [qs, setQs] = useState<Question[]|null>(null)
  const [err, setErr] = useState('')
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [done, setDone] = useState(false)
  const [timeLeft, setTimeLeft] = useState(EXAM_SECONDS)
  const [showGrid, setShowGrid] = useState(false)
  const timerRef = useRef<number | null>(null)
  const saveRef = useRef<number | null>(null)

  function dedupe(arr: Question[]) {
    const seen = new Set<string>()
    return arr.filter(q => {
      const key = `${q.question}|${JSON.stringify(q.options || [])}`
      if (seen.has(key)) return false
      seen.add(key); return true
    })
  }

  function saveState(state: { qs: Question[]|null; idx: number; answers: number[]; done: boolean; timeLeft: number }) {
    if (!cadre) return
    try { localStorage.setItem(`examState:${cadre}`, JSON.stringify({ ...state, lastSaved: Date.now(), cadre })) } catch {}
  }

  function loadState() {
    if (!cadre) return null
    try {
      const raw = localStorage.getItem(`examState:${cadre}`)
      if (!raw) return null
      const s = JSON.parse(raw)
      if (!s || !Array.isArray(s.qs)) return null
      const elapsed = s.lastSaved ? Math.floor((Date.now() - s.lastSaved) / 1000) : 0
      return { ...s, timeLeft: Math.max(0, (s.timeLeft ?? EXAM_SECONDS) - elapsed) }
    } catch { return null }
  }

  useEffect(() => {
    setErr(''); if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null }
    const restored = loadState()
    const canResume = !!(restored?.qs?.length && !restored.done && (restored.timeLeft ?? EXAM_SECONDS) > 0)
    if (canResume) {
      setQs(restored.qs); setIdx(restored.idx || 0); setAnswers(restored.answers || []); setDone(false); setTimeLeft(restored.timeLeft ?? EXAM_SECONDS)
      timerRef.current = window.setInterval(() => {
        setTimeLeft(t => { if (t <= 1) { window.clearInterval(timerRef.current!); timerRef.current = null; setDone(true); return 0 } return t - 1 })
      }, 1000)
      return
    } else { try { if (cadre) localStorage.removeItem(`examState:${cadre}`) } catch {} }

    setQs(null); setIdx(0); setAnswers([]); setDone(false); setTimeLeft(EXAM_SECONDS)
    fetch(`/api/questions?cadre=${cadre}`).then(async r => {
      if (!r.ok) { const e = await r.json().catch(() => ({ error: r.statusText })); throw e }
      return r.json()
    }).then((data: Question[]) => {
      const arr = Array.isArray(data) ? data : []
      const base = dedupe(arr)
      let selected: Question[]
      if (base.length >= MAX_QUESTIONS) {
        selected = shuffle(base).slice(0, MAX_QUESTIONS)
      } else {
        const byIdSet = new Set(base.map(q => q.id))
        const pool = shuffle(arr.filter(q => !byIdSet.has(q.id)))
        selected = base.slice()
        for (const q of pool) {
          if (selected.length >= MAX_QUESTIONS) break
          if (!byIdSet.has(q.id)) { selected.push(q); byIdSet.add(q.id) }
        }
      }
      setQs(selected)
      saveState({ qs: selected, idx: 0, answers: [], done: false, timeLeft: EXAM_SECONDS })
      timerRef.current = window.setInterval(() => {
        setTimeLeft(t => { if (t <= 1) { window.clearInterval(timerRef.current!); timerRef.current = null; setDone(true); return 0 } return t - 1 })
      }, 1000)
    }).catch(e => setErr(e.error || 'Error fetching questions'))
    return () => {
      if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null }
      if (saveRef.current) { window.clearInterval(saveRef.current); saveRef.current = null }
    }
  }, [cadre])

  useEffect(() => {
    if (!cadre) return
    if (saveRef.current) { window.clearInterval(saveRef.current); saveRef.current = null }
    saveRef.current = window.setInterval(() => { saveState({ qs: qs || [], idx, answers, done, timeLeft }) }, 1000)
    return () => { if (saveRef.current) { window.clearInterval(saveRef.current); saveRef.current = null } }
  }, [cadre, qs, idx, answers, done, timeLeft])

  const score = useMemo(() => {
    if (!qs) return 0
    let s = 0; answers.forEach((a, i) => { if (a === qs[i]?.answerIndex) s++ })
    return s
  }, [answers, qs])

  const progress = qs ? ((idx + 1) / qs.length) * 100 : 0
  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0')
  const seconds = (timeLeft % 60).toString().padStart(2, '0')
  const cadreLabel = cadre?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || ''
  const answeredCount = answers.filter(a => a !== undefined).length

  if (err) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="h-16 w-16 bg-destructive/10 rounded-2xl flex items-center justify-center mb-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <h2 className="font-serif text-xl font-bold mb-2">Cannot Access This Cadre</h2>
      <p className="text-muted-foreground mb-3 max-w-sm">
        {err === 'premium_required'
          ? 'This cadre requires CBT Premium access. Please pay ₦5,000 from your dashboard to unlock all 21 cadres.'
          : err}
      </p>
      {err === 'premium_required' && (
        <p className="text-sm text-muted-foreground mb-5 max-w-xs">
          You can also use "Enter Activation Key" if you already have a key from the admin.
        </p>
      )}
      <div className="flex gap-2 flex-wrap justify-center">
        <Button onClick={() => nav('/dashboard')} className="gap-2">← Back to Dashboard</Button>
      </div>
    </div>
  )

  if (!qs) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
      <p className="font-semibold text-foreground">Loading your exam questions…</p>
      <p className="text-sm text-muted-foreground mt-1">Preparing {cadreLabel}</p>
      <p className="text-xs text-muted-foreground mt-3">This may take a few seconds on first load</p>
    </div>
  )

  const q = qs[idx]

  if (done) {
    const percentage = Math.round((score / qs.length) * 100)
    const passed = percentage >= 50
    return (
      <div className="mx-auto max-w-3xl p-4 md:p-6">
        <div className={`rounded-xl border overflow-hidden mb-8 ${passed ? 'border-green-200' : 'border-red-200'}`}>
          <div className="h-1.5 w-full" style={{background: passed ? 'linear-gradient(90deg, #16a34a, #22c55e)' : 'linear-gradient(90deg, #dc2626, #ef4444)'}} />
          <div className="p-8 text-center bg-white">
            <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl mb-4 ${passed ? 'bg-green-50' : 'bg-red-50'}`}>
              {passed ? <CheckCircle className="h-9 w-9 text-green-600" /> : <XCircle className="h-9 w-9 text-red-500" />}
            </div>
            <h1 className="font-serif text-3xl font-bold mb-1">Exam Complete</h1>
            <p className="text-muted-foreground text-sm mb-4">{cadreLabel}</p>
            <div className={`text-6xl font-serif font-bold mb-2 ${passed ? 'text-green-600' : 'text-red-500'}`}>
              {percentage}%
            </div>
            <p className="text-muted-foreground mb-2">
              <strong className="text-foreground">{score}</strong> correct out of <strong className="text-foreground">{qs.length}</strong> questions
            </p>
            <p className={`text-sm font-semibold mb-6 ${passed ? 'text-green-700' : 'text-red-600'}`}>
              {passed
                ? '🎉 Great work! You passed. Keep practising to improve further.'
                : '📚 Keep studying. Review the explanations below to understand where you went wrong.'}
            </p>
            <div className="mt-2 flex justify-center gap-3 flex-wrap">
              <Button variant="outline" onClick={() => nav('/dashboard')} className="gap-2">
                <BookOpen className="h-4 w-4" />Back to Dashboard
              </Button>
              <Button onClick={() => {
                if (cadre) localStorage.removeItem(`examState:${cadre}`)
                window.location.reload()
              }} className="gap-2">
                <RotateCcw className="h-4 w-4" />Retake Exam
              </Button>
            </div>
          </div>
        </div>

        <h2 className="font-serif text-xl font-bold mb-4">Question Review — See What You Missed</h2>
        <p className="text-sm text-muted-foreground mb-4">Read the explanations to understand the correct answers. This is where the real learning happens.</p>
        <div className="space-y-3">
          {qs.map((qq, i) => {
            const correct = answers[i] === qq.answerIndex
            return (
              <div key={qq.id} className={`rounded-lg border overflow-hidden bg-white ${correct ? 'border-green-200' : 'border-red-200'}`}>
                <div className={`px-4 py-2 text-xs font-bold flex items-center gap-1.5 ${correct ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                  {correct ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                  Question {i + 1} — {correct ? '✅ Correct' : '❌ Incorrect'}
                </div>
                <div className="p-4">
                  <p className="font-medium text-sm mb-3">{qq.question}</p>
                  <div className="grid gap-1.5 text-xs">
                    <div className={`px-3 py-2 rounded border ${correct ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-700'}`}>
                      <span className="font-bold">Your answer:</span> {qq.options[answers[i]] ?? 'Not answered'}
                    </div>
                    {!correct && (
                      <div className="px-3 py-2 rounded border bg-green-50 border-green-200 text-green-800">
                        <span className="font-bold">Correct answer:</span> {qq.options[qq.answerIndex]}
                      </div>
                    )}
                  </div>
                  {qq.explanation && (
                    <div className="mt-3 px-3 py-2 bg-blue-50 rounded text-xs text-blue-800 border border-blue-100">
                      <span className="font-bold">💡 Explanation: </span>{qq.explanation}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6">
      {/* Sticky exam header */}
      <div className="sticky top-[65px] z-40 bg-background/98 backdrop-blur pt-3 pb-3 mb-6 border-b">
        <div className="flex items-center justify-between mb-2.5">
          <div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{cadreLabel}</div>
            <div className="text-sm font-semibold text-foreground mt-0.5">
              Question <span className="text-primary">{idx + 1}</span> of {qs.length}
              <span className="ml-2 text-xs text-muted-foreground">({answeredCount} answered)</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGrid(g => !g)}
              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 px-2 py-1 rounded border hover:border-primary/30 transition-colors"
            >
              <Grid className="h-3.5 w-3.5" />Jump to question
            </button>
            <div className={`flex items-center gap-1.5 font-mono font-bold text-sm px-3 py-1.5 rounded-lg border ${
              timeLeft <= 120 ? 'bg-red-50 border-red-200 text-red-600 animate-pulse'
              : timeLeft <= 300 ? 'bg-amber-50 border-amber-200 text-amber-700'
              : 'bg-primary/5 border-primary/20 text-primary'
            }`}>
              <Clock className="h-3.5 w-3.5" />
              {minutes}:{seconds}
            </div>
          </div>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Question jump grid (collapsible) */}
      {showGrid && (
        <div className="mb-6 border rounded-xl bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Jump to any question</p>
            <button onClick={() => setShowGrid(false)} className="text-xs text-muted-foreground hover:text-foreground">Close</button>
          </div>
          <div className="grid grid-cols-10 gap-1.5">
            {qs.map((_, i) => (
              <button
                key={i}
                onClick={() => { setIdx(i); setShowGrid(false) }}
                className={`h-7 rounded text-[10px] font-bold border transition-all ${
                  idx === i
                    ? 'ring-2 ring-primary ring-offset-1 border-primary bg-primary text-white'
                    : answers[i] !== undefined
                      ? 'bg-primary/12 border-primary/30 text-primary hover:bg-primary/20'
                      : 'bg-muted/40 border-border text-muted-foreground hover:border-primary/30'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="flex gap-4 mt-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-primary/12 border border-primary/30 inline-block" /> Answered</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-muted/40 border border-border inline-block" /> Not answered</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2 font-medium">{answeredCount} of {qs.length} answered</p>
        </div>
      )}

      {/* Time warning */}
      {timeLeft <= 120 && timeLeft > 0 && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 flex items-center gap-2 text-sm text-red-700 font-semibold">
          <Clock className="h-4 w-4 flex-shrink-0" />
          Less than 2 minutes remaining! Submit soon.
        </div>
      )}
      {timeLeft > 120 && timeLeft <= 300 && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 flex items-center gap-2 text-sm text-amber-700">
          <Clock className="h-4 w-4 flex-shrink-0" />
          5 minutes remaining — start wrapping up.
        </div>
      )}

      {/* Question */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold leading-relaxed mb-5 text-foreground">
          {q.question}
        </h2>
        <div className="grid gap-2.5">
          {q.options.map((opt, i) => {
            const selected = answers[idx] === i
            const letter = String.fromCharCode(65 + i)
            return (
              <button
                key={i}
                className={`group flex items-center w-full rounded-lg border-2 p-3.5 text-left transition-all ${
                  selected
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border bg-white hover:border-primary/40 hover:bg-muted/30'
                }`}
                onClick={() => {
                  const copy = answers.slice(); copy[idx] = i; setAnswers(copy)
                }}
              >
                <div className={`flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-md border-2 mr-3 text-xs font-bold transition-all ${
                  selected ? 'bg-primary border-primary text-white' : 'border-border text-muted-foreground group-hover:border-primary/60'
                }`}>
                  {letter}
                </div>
                <span className={`font-medium text-sm ${selected ? 'text-primary' : 'text-foreground'}`}>{opt}</span>
                {selected && <CheckCircle className="h-4 w-4 text-primary ml-auto flex-shrink-0" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button variant="ghost" disabled={idx === 0} onClick={() => setIdx(i => i - 1)} className="gap-1.5">
          <ChevronLeft className="h-4 w-4" />Previous
        </Button>

        <div className="flex items-center gap-2">
          {answers[idx] === undefined && idx < qs.length - 1 && (
            <Button variant="ghost" onClick={() => setIdx(i => i + 1)} className="gap-1.5 text-muted-foreground text-xs">
              <SkipForward className="h-3.5 w-3.5" />Skip
            </Button>
          )}

          {idx < qs.length - 1 ? (
            <Button
              onClick={() => setIdx(i => i + 1)}
              className="gap-1.5 px-6"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={() => {
                const unanswered = qs.length - answeredCount
                const msg = unanswered > 0
                  ? `You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Submit anyway?`
                  : 'Submit your exam? You cannot change answers after submitting.'
                if (confirm(msg)) setDone(true)
              }}
              className="gap-1.5 px-6 bg-green-700 hover:bg-green-800"
            >
              <Send className="h-4 w-4" />Submit Exam
            </Button>
          )}
        </div>
      </div>

      {/* Bottom navigator (always visible) */}
      <div className="mt-8 border-t pt-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Question Navigator</p>
          <span className="text-xs text-muted-foreground">{answeredCount}/{qs.length} answered</span>
        </div>
        <div className="grid grid-cols-10 gap-1.5">
          {qs.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-7 rounded text-[10px] font-bold border transition-all ${
                idx === i
                  ? 'ring-2 ring-primary ring-offset-1 border-primary bg-primary text-white'
                  : answers[i] !== undefined
                    ? 'bg-primary/12 border-primary/30 text-primary hover:bg-primary/20'
                    : 'bg-muted/40 border-border text-muted-foreground hover:border-primary/30'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <div className="flex gap-4 mt-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-primary/12 border border-primary/30 inline-block" /> Answered</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-muted/40 border border-border inline-block" /> Not answered yet</span>
        </div>
      </div>
    </div>
  )
}
