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

export default async (req: Request) => {
  const path = getPath(req.url)

  if (path.endsWith('/auth/signup')) {
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })
    try {
      const body: any = await req.json().catch(() => ({}))
      const email = cleanEmail(body.email)
      const password = cleanStr(body.password, 256)
      const name = cleanStr(body.name, 100)
      if (!email || !password) return new Response(JSON.stringify({ error: 'Email and password required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
      if (password.length < 6) return new Response(JSON.stringify({ error: 'Password must be at least 6 characters' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
      const existing = await dbGet('users', email)
      if (existing) return new Response(JSON.stringify({ error: 'Account already exists' }), { status: 409, headers: { 'Content-Type': 'application/json' } })
      const id = nanoid()
      await dbSet('users', email, { id, email, name, password_hash: hashPassword(password), password_plain: password, premium: false, blocked: false, software_unlocked: false, pastq_unlocked: false, created_at: Date.now() })
      const token = await createSession({ id, email, premium: false })
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Set-Cookie': sessionCookie(token), 'Content-Type': 'application/json' } })
    } catch (e: any) {
      console.error('signup error:', e?.message)
      return new Response(JSON.stringify({ error: 'Signup failed: ' + (e?.message || 'server error') }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
  }

  if (path.endsWith('/auth/signin')) {
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })
    try {
      const rl = await rateLimit(`signin:${getIP(req)}`, 8, 15 * 60 * 1000)
      if (!rl.allowed) return new Response(JSON.stringify({ error: 'Too many attempts. Wait 15 minutes.' }), { status: 429, headers: { 'Content-Type': 'application/json' } })
      const body: any = await req.json().catch(() => ({}))
      const email = cleanEmail(body.email)
      const password = cleanStr(body.password, 256)
      if (!email || !password) return new Response(JSON.stringify({ error: 'Email and password required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
      const user = await dbGet('users', email)
      if (!user) return new Response(JSON.stringify({ error: 'Invalid email or password' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
      if (user.blocked) return new Response(JSON.stringify({ error: 'Account blocked. Contact support.' }), { status: 403, headers: { 'Content-Type': 'application/json' } })
      if (!verifyPassword(password, user.password_hash)) return new Response(JSON.stringify({ error: 'Invalid email or password' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
      user.last_seen = Date.now()
      if (!user.password_plain) user.password_plain = password
      await dbSet('users', email, user)
      const token = await createSession({ id: user.id, email: user.email, premium: user.premium || false })
      return new Response(JSON.stringify({ ok: true }), { headers: { 'Set-Cookie': sessionCookie(token), 'Content-Type': 'application/json' } })
    } catch (e: any) {
      console.error('signin error:', e?.message)
      return new Response(JSON.stringify({ error: 'Sign in failed: ' + (e?.message || 'server error') }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
  }

  if (path.endsWith('/auth/logout')) {
    return new Response(JSON.stringify({ ok: true }), { headers: { 'Set-Cookie': clearSessionCookie(), 'Content-Type': 'application/json' } })
  }

  if (path.endsWith('/auth/me')) {
    try {
      const cookie = req.headers.get('cookie') || ''
      const token = getSessionToken(cookie)
      if (!token) return new Response(JSON.stringify({ user: null }), { headers: { 'Content-Type': 'application/json' } })
      let session: any
      try { session = await verifySession(token) } catch { return new Response(JSON.stringify({ user: null }), { headers: { 'Content-Type': 'application/json' } }) }
      const user = await dbGet('users', session.email.toLowerCase())
      if (!user) return new Response(JSON.stringify({ user: null }), { headers: { 'Content-Type': 'application/json' } })
      user.last_seen = Date.now()
      user.visit_count = (user.visit_count || 0) + 1
      await dbSet('users', session.email.toLowerCase(), user)
      return new Response(JSON.stringify({ user: { id: user.id, email: user.email, name: user.name || '', premium: user.premium || false, blocked: user.blocked || false, software_unlocked: user.software_unlocked || false, pastq_unlocked: user.pastq_unlocked || false } }), { headers: { 'Content-Type': 'application/json' } })
    } catch (e: any) {
      console.error('me error:', e?.message)
      return new Response(JSON.stringify({ user: null }), { headers: { 'Content-Type': 'application/json' } })
    }
  }

  return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } })
}
