import { SignJWT, jwtVerify } from 'jose'
import Redis from 'ioredis'
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

export const config = { maxDuration: 30 }

// ── Redis client ──────────────────────────────────────────────────────────────
// REDIS_URL is the only env var needed from Redis Cloud
// Format: redis://default:PASSWORD@HOST:PORT
let _redis: Redis | null = null
function getRedis(): Redis {
  if (!_redis) {
    const url = process.env.REDIS_URL!
    // Enable TLS for Redis Cloud (rediss://) or any cloud.redislabs.com host
    const needsTLS = url.includes('rediss://') || url.includes('redislabs.com') || url.includes('upstash.io')
    _redis = new Redis(url, {
      maxRetriesPerRequest: 3,
      lazyConnect: false,
      tls: needsTLS ? { rejectUnauthorized: false } : undefined,
    })
    _redis.on('error', (e) => console.error('Redis error:', e?.message))
  }
  return _redis
}

// ── Store helpers ─────────────────────────────────────────────────────────────
// Keys stored as: storeName:key
async function dbGet(store: string, key: string): Promise<any> {
  try {
    const val = await getRedis().get(`${store}:${key}`)
    if (val === null) return null
    try { return JSON.parse(val) } catch { return val }
  } catch (e: any) { console.error('dbGet', store, key, e?.message); return null }
}

async function dbSet(store: string, key: string, value: any): Promise<void> {
  try {
    const data = typeof value === 'string' ? value : JSON.stringify(value)
    await getRedis().set(`${store}:${key}`, data)
  } catch (e: any) { console.error('dbSet', store, key, e?.message); throw e }
}

async function dbDel(store: string, key: string): Promise<void> {
  try { await getRedis().del(`${store}:${key}`) } catch {}
}

async function dbList(store: string, prefix?: string): Promise<string[]> {
  try {
    const pattern = prefix ? `${store}:${prefix}*` : `${store}:*`
    const keys: string[] = []
    let cursor = '0'
    do {
      const [next, found] = await getRedis().scan(cursor, 'MATCH', pattern, 'COUNT', '100')
      cursor = next
      keys.push(...found)
    } while (cursor !== '0')
    // Strip store prefix to return just the key part
    return keys.map(k => k.slice(store.length + 1))
  } catch (e: any) { console.error('dbList', store, e?.message); return [] }
}

// ── Path & query param helpers ────────────────────────────────────────────────
function getPath(reqUrl: string): string {
  const base = reqUrl.split('?')[0].replace(/\/$/, '') || '/'
  // Read _p param added by Vercel rewrite (/api/auth/signin -> /api/auth?_p=signin)
  const p = qp(reqUrl, '_p')
  if (p) return `${base}/${p}`
  return base
}

function qp(reqUrl: string, name: string): string | null {
  const idx = reqUrl.indexOf('?')
  if (idx === -1) return null
  const qs = reqUrl.slice(idx + 1)
  for (const part of qs.split('&')) {
    const eq = part.indexOf('=')
    if (eq === -1) continue
    try { if (decodeURIComponent(part.slice(0, eq)) === name) return decodeURIComponent(part.slice(eq + 1)) } catch {}
  }
  return null
}

// ── Rate limit ────────────────────────────────────────────────────────────────
async function rateLimit(key: string, max: number, wMs: number) {
  try {
    const now = Date.now()
    const rec: any = await dbGet('rate_limits', key) || { requests: [] }
    if (rec.blocked_until && rec.blocked_until > now) return { allowed: false, remaining: 0 }
    rec.requests = (rec.requests || []).filter((t: number) => t > now - wMs)
    rec.requests.push(now)
    const exceeded = rec.requests.length > max
    if (exceeded) rec.blocked_until = now + wMs * 2
    await dbSet('rate_limits', key, rec)
    return { allowed: !exceeded, remaining: Math.max(0, max - rec.requests.length) }
  } catch { return { allowed: true, remaining: max } }
}

// ── JWT ───────────────────────────────────────────────────────────────────────
const enc = new TextEncoder()
const jwtSecret = () => enc.encode(process.env.JWT_SECRET || 'dev-secret')
function getCookie(h: string | null, n: string) {
  if (!h) return undefined
  const p = n + '='
  const x = h.split(';').map(s => s.trim()).find(s => s.startsWith(p))
  return x ? x.substring(p.length) : undefined
}
const getSessionToken = (h: string | null) => getCookie(h, 'session')
const getAdminToken = (h: string | null) => getCookie(h, 'admin_session') || getCookie(h, 'session')
const requireAdmin = async (h: string | null) => {
  const t = getAdminToken(h); if (!t) return false
  return verifySession(t).then((p: any) => p.role === 'admin').catch(() => false)
}
async function createSession(u: { id: string; email: string; premium?: boolean; role?: string }) {
  return new SignJWT({ sub: u.id, email: u.email, premium: !!u.premium, role: u.role || 'user' })
    .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('7d').sign(jwtSecret())
}
async function verifySession(token: string) {
  const { payload } = await jwtVerify(token, jwtSecret()); return payload as any
}
const sessionCookie = (t: string) => `session=${t}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`
const clearSessionCookie = () => `session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
const adminSessionCookie = (t: string) => `admin_session=${t}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`

// ── Password ──────────────────────────────────────────────────────────────────
function hashPassword(pw: string) {
  const salt = randomBytes(16); const N = 16384, r = 8, p = 1, dkLen = 64
  const hash = scryptSync(pw, salt, dkLen, { N, r, p })
  return `scrypt$${N}$${r}$${p}$${salt.toString('base64')}$${hash.toString('base64')}`
}
function verifyPassword(pw: string, encoded: string) {
  const [sc, Ns, rs, ps, sB64, hB64] = encoded.split('$')
  if (sc !== 'scrypt') return false
  const N = parseInt(Ns, 10), r = parseInt(rs, 10), p2 = parseInt(ps, 10)
  const salt = Buffer.from(sB64, 'base64'); const expected = Buffer.from(hB64, 'base64')
  return timingSafeEqual(scryptSync(pw, salt, expected.length, { N, r, p: p2 }), expected)
}

// ── Security ──────────────────────────────────────────────────────────────────
const SH: Record<string, string> = { 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'strict-origin-when-cross-origin' }
function getIP(req: Request) { return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown' }
function cleanStr(s: unknown, max = 2000) { if (typeof s !== 'string') return ''; return s.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '').slice(0, max).trim() }
function cleanEmail(e: unknown) { if (typeof e !== 'string') return ''; return e.toLowerCase().replace(/[^a-z0-9._%+\-@]/g, '').slice(0, 254).trim() }
function getUA(req: Request) { return req.headers.get('user-agent') || '' }
async function subtleHash(s: string) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return Array.from(new Uint8Array(b), x => x.toString(16).padStart(2, '0')).join('') }

// ── Flutterwave ───────────────────────────────────────────────────────────────
async function verifyFlw(txId: string) {
  const secret = process.env.FLW_SECRET_KEY
  if (!secret) return { ok: false, flwId: 0, amount: 0, currency: '', txRef: '', errorMsg: 'Payment system not configured' }
  try {
    const resp = await fetch(`https://api.flutterwave.com/v3/transactions/${encodeURIComponent(txId)}/verify`, { headers: { Authorization: `Bearer ${secret}`, Accept: 'application/json' } })
    if (!resp.ok) return { ok: false, flwId: 0, amount: 0, currency: '', txRef: '', errorMsg: 'Could not reach payment provider' }
    const body: any = await resp.json().catch(() => ({})); const d = body?.data || {}
    return { ok: d.status === 'successful', flwId: Number(d.id || 0), amount: Number(d.amount || 0), currency: String(d.currency || '').toUpperCase(), txRef: String(d.tx_ref || ''), errorMsg: d.status !== 'successful' ? `Payment status: ${d.status}` : '' }
  } catch { return { ok: false, flwId: 0, amount: 0, currency: '', txRef: '', errorMsg: 'Network error' } }
}

import { nanoid } from 'nanoid/non-secure'

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

const map: Record<string,string> = {'current-affairs':'current-affairs.json','accounting':'cadre-accounting.json','administrative-officers':'cadre-administrative-officer.json','audit':'cadre-audit.json','culture-and-tourism':'cadre-culture-and-tourism.json','education':'cadre-education.json','electrical-engineering':'cadre-electrical-engineering.json','mechanical-engineering':'cadre-mechanical-engineering.json','engineering':'cadre-engineering.json','foreign-affairs':'cadre-foreign-affairs.json','health':'cadre-health.json','human-resources':'cadre-human-resources.json','legal':'cadre-legal.json','program-analyst':'cadre-program-analyst.json','solid-mineral-development':'cadre-solid-mineral-development.json','statistics':'cadre-statistics.json','town-planners':'cadre-town-planners.json','works-housing':'cadre-works-and-housing.json','financial-regulation':'financial-regulations-1.json','civil-service-rule-general':'cadre-general.json','procurement':'cadre-procurement.json'}

export default async (req: Request) => {
  const cadre = qp(req.url, 'cadre') || 'current-affairs'
  const cookie = req.headers.get('cookie') || ''; const token = getSessionToken(cookie)
  let userPayload: any = null; if (token) try { userPayload = await verifySession(token) } catch {}
  if (userPayload) { const user = await dbGet('users', userPayload.email.toLowerCase()); if (user?.blocked) return new Response(JSON.stringify({ error: 'account_blocked' }), { status: 403, headers: { 'Content-Type': 'application/json' } }) }
  if (cadre !== 'current-affairs' && (!userPayload || !userPayload.premium)) return new Response(JSON.stringify({ error: 'premium_required', cadres: Object.keys(map) }), { status: 402, headers: { 'Content-Type': 'application/json' } })
  const file = map[cadre]; if (!file) return new Response(JSON.stringify({ error: 'Unknown cadre' }), { status: 404 })
  const text = await readFile(join(process.cwd(), 'data', 'questions', file), 'utf-8')
  let data: any; try { data = JSON.parse(text) } catch { data = [] }
  if (data && !Array.isArray(data)) { const ks = Object.keys(data); if (ks.length === 1 && Array.isArray((data as any)[ks[0]])) data = (data as any)[ks[0]] }
  if (Array.isArray(data) && data.length) {
    const clean = (s: string) => String(s).replace(/^\s*[A-F][\)\.:]\s*/i, '')
    const norm = (arr: any[], cat: string): any[] => { if (!arr.length) return []; const f = arr[0]; if (Array.isArray(f.options)) return arr.map((q: any, i: number) => { const opts = (q.options || []).map((s: any) => clean(String(s))); let ai = Number.isFinite(q.answerIndex) ? q.answerIndex : -1; if (ai < 0 && typeof q.correct_answer === 'string') { const idx = opts.findIndex((o: string) => o.trim() === String(q.correct_answer).trim()); if (idx >= 0) ai = idx }; return { id: q.id ?? q.question_no ?? i + 1, category: q.category ?? cat, question: q.question ?? q.prompt ?? '', options: opts, answerIndex: ai, explanation: q.explanation || '' } }); if (f.option_a || f.option_b || f.option_c || f.option_d) { const li: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 }; return arr.map((q: any, i: number) => { const opts = [q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean).map((s: string) => clean(s)); const ans = String(q.correct_answer || q.answer || '').trim().toUpperCase(); return { id: q.id ?? q.question_no ?? i + 1, category: q.category ?? cat, question: q.question ?? q.prompt ?? '', options: opts, answerIndex: ans in li ? li[ans] : (Number.isFinite(q.answerIndex) ? q.answerIndex : -1), explanation: q.explanation || '' } }) }; if (f.options && typeof f.options === 'object') { const ord = ['A', 'B', 'C', 'D', 'E', 'F']; return arr.map((q: any, i: number) => { const opts = ord.map(k => q.options?.[k]).filter(Boolean).map((s: string) => clean(s)); const ans = String(q.correct_answer || q.answer || '').trim().toUpperCase(); const li2 = ord.indexOf(ans); return { id: q.id ?? q.question_no ?? i + 1, category: q.category ?? cat, question: q.question ?? q.prompt ?? '', options: opts, answerIndex: li2 >= 0 ? li2 : -1, explanation: q.explanation || '' } }) }; return arr }
    data = norm(data, cadre === 'current-affairs' ? 'Current Affairs' : 'General')
    if (cadre === 'civil-service-rule-general') {
      const keyOf = (q: any) => `${q.question}|${JSON.stringify(q.options || [])}`; const seen = new Set<string>(); const unique: any[] = []
      for (const q of data) { const k = keyOf(q); if (!seen.has(k)) { seen.add(k); unique.push(q) } }
      if (unique.length < 70) { try { for (const fname of ['core-questions.json', 'augment-summary.json']) { const t = await readFile(join(process.cwd(), 'data', 'questions', fname), 'utf-8'); let arr: any = JSON.parse(t); if (arr && !Array.isArray(arr)) { const ks = Object.keys(arr); if (ks.length === 1 && Array.isArray((arr as any)[ks[0]])) arr = (arr as any)[ks[0]] }; for (const q of norm(arr, 'Civil Service Rule (General)')) { const k = keyOf(q); if (!seen.has(k)) { seen.add(k); unique.push(q) }; if (unique.length >= 70) break }; if (unique.length >= 70) break }; data = unique } catch {} } else data = unique
    }
  }
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } })
}
