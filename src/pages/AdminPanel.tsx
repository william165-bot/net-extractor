import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Search, UserPlus, ShieldAlert, Key, Settings, Users,
  Megaphone, MessageSquare, GraduationCap, Download, FileText, Monitor,
  Trash2, Eye, EyeOff, CheckCircle, AlertCircle, RefreshCw
} from 'lucide-react'

export default function AdminPanel() {
  // Keys — CBT premium only, no type selector
  const [keyEmail, setKeyEmail] = useState('')
  const [keys, setKeys] = useState<any[]>([])

  // Users
  const [users, setUsers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})

  // Settings
  const [aiCbtUrl, setAiCbtUrl] = useState('')
  const [softwareUrl, setSoftwareUrl] = useState('')
  const [pastqUrl, setPastqUrl] = useState('')

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Announcements
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [annTitle, setAnnTitle] = useState('')
  const [annMessage, setAnnMessage] = useState('')

  // Feedback — admin sees ALL users' feedback
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [feedbackReplyMap, setFeedbackReplyMap] = useState<Record<string, string>>({})

  // Consultations — admin sees ALL users' session requests
  const [consultations, setConsultations] = useState<any[]>([])
  const [replyMap, setReplyMap] = useState<Record<string, { reply: string; payment_link: string; session_time: string }>>({})

  // ── Loaders ──────────────────────────────────────────────────────────────────

  async function loadKeys() {
    const r = await fetch('/api/admin/keys')
    if (!r.ok) { setError('Unauthorized — please log in as admin'); return }
    setKeys(await r.json() || [])
  }

  async function loadUsers() {
    const r = await fetch('/api/admin/users')
    if (!r.ok) return
    setUsers(await r.json() || [])
  }

  async function loadSettings() {
    const r = await fetch('/api/admin/settings')
    if (!r.ok) return
    const d = await r.json()
    setAiCbtUrl(d.ai_cbt_url || '')
    setSoftwareUrl(d.software_download_url || '')
    setPastqUrl(d.pastq_download_url || '')
  }

  async function loadAnnouncements() {
    const r = await fetch('/api/admin/announcements')
    if (!r.ok) return
    setAnnouncements(await r.json() || [])
  }

  async function loadFeedbacks() {
    // GET /api/feedback returns ALL feedback to admin
    const r = await fetch('/api/feedback')
    if (!r.ok) return
    setFeedbacks(await r.json() || [])
  }

  async function loadConsultations() {
    // GET /api/consultation returns ALL requests to admin
    const r = await fetch('/api/consultation')
    if (!r.ok) return
    setConsultations(await r.json() || [])
  }

  useEffect(() => {
    loadKeys()
    loadUsers()
    loadSettings()
    loadAnnouncements()
    loadFeedbacks()
    loadConsultations()
  }, [])

  // ── Key generation — CBT premium only ────────────────────────────────────────

  async function generateKey() {
    setLoading(true); setError(''); setSuccess('')
    try {
      const r = await fetch('/api/admin/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: keyEmail.trim() || null }),
      })
      if (!r.ok) throw new Error('Failed to generate key')
      await loadKeys()
      setKeyEmail('')
      setSuccess('CBT Premium key generated successfully')
    } catch (e: any) { setError(e.message) } finally { setLoading(false) }
  }

  // ── User management ───────────────────────────────────────────────────────────

  async function toggleBlock(userEmail: string, isBlocked: boolean) {
    if (!confirm(`${isBlocked ? 'Unblock' : 'Block'} ${userEmail}?`)) return
    setLoading(true); setError(''); setSuccess('')
    try {
      const action = isBlocked ? 'unblock' : 'block'
      const r = await fetch('/api/admin/user-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, action }),
      })
      if (!r.ok) throw new Error(`Failed to ${action} user`)
      await loadUsers()
      setSuccess(`User ${action}ed`)
    } catch (e: any) { setError(e.message) } finally { setLoading(false) }
  }

  async function revoke(targetEmail: string, revokeType: 'premium' | 'software' | 'pastq' | 'all') {
    const labels = { premium: 'CBT Premium', software: 'Software', pastq: 'Past Questions', all: 'ALL access' }
    if (!confirm(`Revoke ${labels[revokeType]} for ${targetEmail}?`)) return
    setLoading(true); setError(''); setSuccess('')
    try {
      const r = await fetch('/api/admin/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, revoke_type: revokeType }),
      })
      if (!r.ok) throw new Error('Failed to revoke')
      await loadUsers()
      setSuccess('Access revoked')
    } catch (e: any) { setError(e.message) } finally { setLoading(false) }
  }

  async function grantAccess(targetEmail: string, grantType: 'software' | 'pastq') {
    const labels = { software: 'Windows Enterprise Software', pastq: 'Past Questions (₦7,000)' }
    if (!confirm(`Grant ${labels[grantType]} access to ${targetEmail}?`)) return
    setLoading(true); setError(''); setSuccess('')
    try {
      const r = await fetch('/api/admin/user-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, action: `grant_${grantType}` }),
      })
      if (!r.ok) throw new Error('Failed to grant access')
      await loadUsers()
      setSuccess(`${labels[grantType]} access granted to ${targetEmail}`)
    } catch (e: any) { setError(e.message) } finally { setLoading(false) }
  }

  // ── Announcements ─────────────────────────────────────────────────────────────

  async function createAnnouncement() {
    if (!annMessage.trim()) { setError('Message is required'); return }
    setLoading(true); setError(''); setSuccess('')
    try {
      const r = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', title: annTitle, message: annMessage }),
      })
      if (!r.ok) throw new Error('Failed')
      await loadAnnouncements()
      setAnnTitle(''); setAnnMessage('')
      setSuccess('Announcement posted')
    } catch (e: any) { setError(e.message) } finally { setLoading(false) }
  }

  async function deleteAnnouncement(id: string) {
    if (!confirm('Delete this announcement?')) return
    await fetch('/api/admin/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    })
    await loadAnnouncements()
  }

  async function toggleAnnouncement(id: string) {
    await fetch('/api/admin/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle', id }),
    })
    await loadAnnouncements()
  }

  // ── Feedback — admin replies to individual users ──────────────────────────────

  async function sendFeedbackReply(id: string) {
    const reply = feedbackReplyMap[id] || ''
    if (!reply.trim()) { setError('Reply message cannot be empty'); return }
    setLoading(true); setError(''); setSuccess('')
    try {
      const r = await fetch('/api/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, admin_reply: reply }),
      })
      if (!r.ok) throw new Error('Failed to send reply')
      await loadFeedbacks()
      setFeedbackReplyMap(prev => ({ ...prev, [id]: '' }))
      setSuccess('Reply sent')
    } catch (e: any) { setError(e.message) } finally { setLoading(false) }
  }

  async function markFeedbackRead(id: string) {
    await fetch('/api/feedback', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await loadFeedbacks()
  }

  // ── Consultations — admin replies to each user's personal request ─────────────

  function updateReplyField(id: string, field: string, value: string) {
    setReplyMap(prev => ({
      ...prev,
      [id]: { ...(prev[id] || { reply: '', payment_link: '', session_time: '' }), [field]: value },
    }))
  }

  async function sendConsultReply(id: string) {
    const data = replyMap[id] || { reply: '', payment_link: '', session_time: '' }
    if (!data.reply.trim()) { setError('Reply message cannot be empty'); return }
    setLoading(true); setError(''); setSuccess('')
    try {
      const r = await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reply', id, reply: data.reply, payment_link: data.payment_link, session_time: data.session_time }),
      })
      if (!r.ok) throw new Error('Failed')
      await loadConsultations()
      setReplyMap(prev => ({ ...prev, [id]: { reply: '', payment_link: '', session_time: '' } }))
      setSuccess('Reply sent to user')
    } catch (e: any) { setError(e.message) } finally { setLoading(false) }
  }

  async function closeConsultation(id: string) {
    if (!confirm('Close this consultation request?')) return
    await fetch('/api/consultation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'close', id }),
    })
    await loadConsultations()
  }

  // ── Derived ───────────────────────────────────────────────────────────────────

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  )
  const unreadCount = feedbacks.filter(f => !f.read).length
  const pendingConsultCount = consultations.filter(c => c.status === 'pending').length

  const statusBadgeClass: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    replied: 'bg-blue-100 text-blue-700',
    payment_sent: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-500',
  }

  return (
    <div className="min-h-screen bg-muted/20 py-8">
      <div className="mx-auto max-w-5xl px-4">

        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
            <ShieldAlert className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold">Admin Panel</h1>
            <p className="text-xs text-muted-foreground">Secured — Authorized Access Only</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />{error}
            <button onClick={() => setError('')} className="ml-auto text-destructive/60 hover:text-destructive">✕</button>
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />{success}
            <button onClick={() => setSuccess('')} className="ml-auto text-green-500 hover:text-green-700">✕</button>
          </div>
        )}

        <Tabs defaultValue="announcements">
          <TabsList className="flex flex-wrap gap-1 h-auto mb-6">
            <TabsTrigger value="announcements" className="gap-1.5 text-xs">
              <Megaphone className="h-3.5 w-3.5" />Announcements
            </TabsTrigger>
            <TabsTrigger value="feedback" className="gap-1.5 text-xs relative">
              <MessageSquare className="h-3.5 w-3.5" />Feedback
              {unreadCount > 0 && (
                <span className="ml-1 bg-rose-500 text-white text-[10px] rounded-full px-1.5 py-0.5 font-bold">{unreadCount}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="consultations" className="gap-1.5 text-xs relative">
              <GraduationCap className="h-3.5 w-3.5" />1-on-1 Sessions
              {pendingConsultCount > 0 && (
                <span className="ml-1 bg-amber-500 text-white text-[10px] rounded-full px-1.5 py-0.5 font-bold">{pendingConsultCount}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-1.5 text-xs">
              <Users className="h-3.5 w-3.5" />Users
            </TabsTrigger>
            <TabsTrigger value="keys" className="gap-1.5 text-xs">
              <Key className="h-3.5 w-3.5" />Keys
            </TabsTrigger>
            <TabsTrigger value="downloads" className="gap-1.5 text-xs">
              <Download className="h-3.5 w-3.5" />Downloads
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1.5 text-xs">
              <Settings className="h-3.5 w-3.5" />Settings
            </TabsTrigger>
          </TabsList>

          {/* ── ANNOUNCEMENTS ───────────────────────────────────────────────── */}
          <TabsContent value="announcements">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Megaphone className="h-4 w-4" />Dashboard Announcements</CardTitle>
                <CardDescription>Announcements appear at the top of every user's dashboard.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
                  <h3 className="text-sm font-semibold">Create Announcement</h3>
                  <Input value={annTitle} onChange={e => setAnnTitle(e.target.value)} placeholder="Title (optional)" />
                  <Textarea value={annMessage} onChange={e => setAnnMessage(e.target.value)} placeholder="Announcement message shown to all users…" rows={3} />
                  <Button onClick={createAnnouncement} disabled={loading} className="gap-2">
                    <Megaphone className="h-4 w-4" />Post Announcement
                  </Button>
                </div>
                {announcements.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No announcements yet.</p>
                ) : (
                  <div className="space-y-3">
                    {announcements.map(ann => (
                      <div key={ann.id} className={`rounded-lg border p-4 ${ann.active ? 'bg-primary/5 border-primary/30' : 'bg-muted/30 opacity-60'}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            {ann.title && <div className="font-bold text-sm mb-1">{ann.title}</div>}
                            <p className="text-sm">{ann.message}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {new Date(ann.created_at).toLocaleString()} · {ann.active ? '🟢 Visible' : '⚫ Hidden'}
                            </p>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <Button size="sm" variant="outline" onClick={() => toggleAnnouncement(ann.id)} className="text-xs h-7">
                              {ann.active ? 'Hide' : 'Show'}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => deleteAnnouncement(ann.id)} className="text-xs h-7 text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── FEEDBACK — Admin sees ALL users' feedback ───────────────────── */}
          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2"><MessageSquare className="h-4 w-4" />User Feedback</CardTitle>
                    <CardDescription>All feedback from all users. Reply to each user individually.</CardDescription>
                  </div>
                  <Button size="sm" variant="outline" onClick={loadFeedbacks} className="gap-1.5">
                    <RefreshCw className="h-3.5 w-3.5" />Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {feedbacks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No feedback submitted yet.</p>
                ) : (
                  <div className="space-y-4">
                    {feedbacks.map(fb => (
                      <div key={fb.id} className={`rounded-lg border p-4 ${!fb.read ? 'bg-rose-50 border-rose-200' : 'bg-white'}`}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="font-semibold text-sm">{fb.email}</span>
                              {!fb.read && <Badge variant="destructive" className="text-[10px] py-0">New</Badge>}
                              {fb.admin_reply && <Badge className="text-[10px] py-0 bg-blue-100 text-blue-700">Replied</Badge>}
                            </div>
                            {fb.subject && <div className="text-xs font-medium text-muted-foreground mb-1">Subject: {fb.subject}</div>}
                            <p className="text-sm leading-relaxed">{fb.message}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">{new Date(fb.created_at).toLocaleString()}</p>
                          </div>
                          {!fb.read && (
                            <Button size="sm" variant="outline" onClick={() => markFeedbackRead(fb.id)} className="text-xs h-7 flex-shrink-0">
                              Mark Read
                            </Button>
                          )}
                        </div>

                        {fb.admin_reply && (
                          <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs">
                            <div className="font-bold text-blue-700 mb-1">Your Previous Reply:</div>
                            <p>{fb.admin_reply}</p>
                            {fb.replied_at && <p className="text-muted-foreground mt-1">{new Date(fb.replied_at).toLocaleString()}</p>}
                          </div>
                        )}

                        <div className="border-t pt-3 space-y-2">
                          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Reply to this user</div>
                          <Textarea
                            placeholder="Type your reply…"
                            rows={2}
                            value={feedbackReplyMap[fb.id] || ''}
                            onChange={e => setFeedbackReplyMap(prev => ({ ...prev, [fb.id]: e.target.value }))}
                          />
                          <Button size="sm" onClick={() => sendFeedbackReply(fb.id)} disabled={loading} className="gap-2">
                            <MessageSquare className="h-3.5 w-3.5" />Send Reply & Mark Read
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── CONSULTATIONS — Admin sees ALL users' personal session requests ── */}
          <TabsContent value="consultations">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2"><GraduationCap className="h-4 w-4" />1-on-1 Teaching Requests</CardTitle>
                    <CardDescription>
                      Each request is from a specific user. Reply with details and their personal payment link. Users only see their own requests.
                    </CardDescription>
                  </div>
                  <Button size="sm" variant="outline" onClick={loadConsultations} className="gap-1.5">
                    <RefreshCw className="h-3.5 w-3.5" />Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {consultations.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No consultation requests yet.</p>
                ) : (
                  <div className="space-y-4">
                    {consultations.map(c => (
                      <div key={c.id} className="rounded-lg border p-4 space-y-3 bg-white">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="font-semibold text-sm">{c.email}</span>
                              <span className={`text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 ${statusBadgeClass[c.status] || 'bg-gray-100 text-gray-500'}`}>
                                {c.status}
                              </span>
                            </div>
                            <div className="font-semibold text-sm">{c.topic}</div>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{c.details}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">{new Date(c.created_at).toLocaleString()}</p>
                          </div>
                          {c.status !== 'closed' && (
                            <Button size="sm" variant="ghost" onClick={() => closeConsultation(c.id)} className="text-xs h-7 text-muted-foreground flex-shrink-0">
                              Close
                            </Button>
                          )}
                        </div>

                        {c.admin_reply && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs">
                            <div className="font-bold text-blue-700 mb-1">Your Previous Reply (visible to this user):</div>
                            <p>{c.admin_reply}</p>
                            {c.session_time && <p className="mt-1 text-muted-foreground">Session time: {c.session_time}</p>}
                            {c.payment_link && (
                              <p className="mt-1">Payment link sent: <a href={c.payment_link} className="text-primary underline break-all">{c.payment_link}</a></p>
                            )}
                          </div>
                        )}

                        {c.status !== 'closed' && (
                          <div className="border-t pt-3 space-y-2">
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              Reply to {c.email}
                            </div>
                            <Textarea
                              placeholder="Your reply to this user's request…"
                              rows={3}
                              value={replyMap[c.id]?.reply || ''}
                              onChange={e => updateReplyField(c.id, 'reply', e.target.value)}
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <Input
                                placeholder="Personal payment link (optional)"
                                value={replyMap[c.id]?.payment_link || ''}
                                onChange={e => updateReplyField(c.id, 'payment_link', e.target.value)}
                              />
                              <Input
                                placeholder="Session time (e.g. Mon Jan 20 @ 3pm)"
                                value={replyMap[c.id]?.session_time || ''}
                                onChange={e => updateReplyField(c.id, 'session_time', e.target.value)}
                              />
                            </div>
                            <Button size="sm" onClick={() => sendConsultReply(c.id)} disabled={loading} className="gap-2">
                              <GraduationCap className="h-3.5 w-3.5" />Send Reply to User
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── USERS ───────────────────────────────────────────────────────── */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="h-4 w-4" />Registered Users</CardTitle>
                <CardDescription>View all users and manage their access. Software and Past Questions are unlocked by Flutterwave payment only.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by email or name…"
                    className="pl-9"
                  />
                </div>
                <div className="text-xs text-muted-foreground flex gap-4">
                  <span>Total: <strong>{filteredUsers.length}</strong></span>
                  <span>CBT Premium: <strong>{filteredUsers.filter(u => u.premium).length}</strong></span>
                  <span>Software: <strong>{filteredUsers.filter(u => u.software_unlocked).length}</strong></span>
                  <span>PastQ: <strong>{filteredUsers.filter(u => u.pastq_unlocked).length}</strong></span>
                  <span>Blocked: <strong>{filteredUsers.filter(u => u.blocked).length}</strong></span>
                  <span>Active today: <strong>{filteredUsers.filter(u => u.last_seen && (Date.now() - u.last_seen) < 86400000).length}</strong></span>
                </div>
                {filteredUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No users found.</p>
                ) : (
                  <div className="space-y-2">
                    {filteredUsers.map(u => (
                      <div key={u.id} className={`rounded-lg border p-3 text-sm ${u.blocked ? 'bg-destructive/5 border-destructive/20' : 'bg-white'}`}>
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold truncate">{u.email}</span>
                              {u.premium && <Badge className="text-[10px] py-0 bg-green-100 text-green-700">CBT Premium</Badge>}
                              {u.software_unlocked && <Badge className="text-[10px] py-0 bg-blue-100 text-blue-700">Software ✓</Badge>}
                              {u.pastq_unlocked && <Badge className="text-[10px] py-0 bg-purple-100 text-purple-700">PastQ ✓</Badge>}
                              {u.blocked && <Badge variant="destructive" className="text-[10px] py-0">Blocked</Badge>}
                            </div>
                            {u.name && <div className="text-xs text-muted-foreground mt-0.5">Name: {u.name}</div>}
                            {u.created_at && <div className="text-xs text-muted-foreground">Joined: {new Date(u.created_at).toLocaleDateString()}</div>}
                            <div className="text-xs text-muted-foreground flex items-center gap-3 mt-0.5">
                              {u.last_seen
                                ? <span>Last seen: <strong>{new Date(u.last_seen).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong></span>
                                : <span className="italic">Never visited</span>}
                              <span>Visits: <strong>{u.visit_count || 0}</strong></span>
                            </div>

                            {/* Password — plain text for admin */}
                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-[10px] font-mono bg-muted/50 rounded px-2 py-0.5 max-w-[220px] truncate">
                                {showPasswords[u.id]
                                  ? (u.password_plain || u.password_hash || 'N/A')
                                  : '••••••••••••'}
                              </span>
                              <button
                                onClick={() => setShowPasswords(prev => ({ ...prev, [u.id]: !prev[u.id] }))}
                                className="text-muted-foreground hover:text-foreground"
                                title={showPasswords[u.id] ? 'Hide' : 'Show password'}
                              >
                                {showPasswords[u.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                              </button>
                              {!u.password_plain && <span className="text-[9px] text-amber-600">(pre-update)</span>}
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex flex-wrap gap-1 flex-shrink-0">
                            <Button size="sm" variant={u.blocked ? 'default' : 'outline'} onClick={() => toggleBlock(u.email, u.blocked)} className="text-xs h-7">
                              {u.blocked ? 'Unblock' : 'Block'}
                            </Button>
                            {(u.premium || u.software_unlocked || u.pastq_unlocked) && (
                              <Button size="sm" variant="outline" onClick={() => revoke(u.email, 'all')} className="text-xs h-7 text-destructive border-destructive/30 hover:bg-destructive/10">
                                Revoke All
                              </Button>
                            )}
                            {u.premium && (
                              <Button size="sm" variant="outline" onClick={() => revoke(u.email, 'premium')} className="text-xs h-7 text-orange-600 border-orange-300 hover:bg-orange-50">
                                –CBT
                              </Button>
                            )}
                            {!u.software_unlocked && (
                              <Button size="sm" variant="outline" onClick={() => grantAccess(u.email, 'software')} className="text-xs h-7 text-blue-600 border-blue-300 hover:bg-blue-50">
                                +SW
                              </Button>
                            )}
                            {u.software_unlocked && (
                              <Button size="sm" variant="outline" onClick={() => revoke(u.email, 'software')} className="text-xs h-7 text-blue-600 border-blue-300 hover:bg-blue-50">
                                –SW
                              </Button>
                            )}
                            {!u.pastq_unlocked && (
                              <Button size="sm" variant="outline" onClick={() => grantAccess(u.email, 'pastq')} className="text-xs h-7 text-purple-600 border-purple-300 hover:bg-purple-50">
                                +PQ
                              </Button>
                            )}
                            {u.pastq_unlocked && (
                              <Button size="sm" variant="outline" onClick={() => revoke(u.email, 'pastq')} className="text-xs h-7 text-purple-600 border-purple-300 hover:bg-purple-50">
                                –PQ
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── KEYS — CBT Premium only ──────────────────────────────────────── */}
          <TabsContent value="keys">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Key className="h-4 w-4" />CBT Premium Activation Keys</CardTitle>
                <CardDescription>
                  Keys unlock CBT Premium access only (all cadres + AI platform). Windows Software and Past Questions are unlocked exclusively by Flutterwave payment — no key can unlock them.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
                  <h3 className="text-sm font-semibold">Generate New CBT Premium Key</h3>
                  <div className="flex gap-2">
                    <Input
                      value={keyEmail}
                      onChange={e => setKeyEmail(e.target.value)}
                      placeholder="Assign to email (optional)"
                      className="flex-1"
                    />
                    <Button onClick={generateKey} disabled={loading} className="gap-2 flex-shrink-0">
                      <UserPlus className="h-4 w-4" />Generate
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Leave email blank to generate a generic key anyone can use. Fill in email to restrict the key to that user's account only.
                  </p>
                </div>

                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                  <strong>Important:</strong> These keys only unlock CBT Practice + AI Platform (₦5,000 value).
                  Software (₦100,000) and Past Questions (₦5,000) require direct Flutterwave payment — no exceptions.
                </div>

                {keys.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No keys generated yet.</p>
                ) : (
                  <div className="space-y-2">
                    {keys.map((k: any) => (
                      <div key={k.key} className={`rounded-lg border p-3 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 ${k.used ? 'opacity-50 bg-muted/30' : 'bg-white'}`}>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold tracking-wide">{k.key}</span>
                          <Badge className="text-[10px] py-0 bg-green-100 text-green-700">CBT Premium</Badge>
                          {k.assigned_email && (
                            <span className="text-xs text-muted-foreground">→ {k.assigned_email}</span>
                          )}
                          {k.used && (
                            <Badge className="text-[10px] py-0 bg-gray-100 text-gray-500">
                              Used by {k.used_by || '?'}
                            </Badge>
                          )}
                          {!k.used && (
                            <span className="text-[10px] text-green-600 font-semibold">● Available</span>
                          )}
                        </div>
                        {!k.used && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              if (!confirm('Delete this unused key?')) return
                              await fetch('/api/admin/keys', {
                                method: 'DELETE',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ key: k.key }),
                              })
                              await loadKeys()
                            }}
                            className="text-xs h-7 text-destructive border-destructive/30 hover:bg-destructive/10"
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── DOWNLOADS — Update download URLs ────────────────────────────── */}
          <TabsContent value="downloads">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Monitor className="h-4 w-4 text-blue-600" />Windows Software Download URL</CardTitle>
                  <CardDescription>
                    This URL is shown only to users who have paid ₦100,000 via Flutterwave. Update it here when the link changes.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    value={softwareUrl}
                    onChange={e => setSoftwareUrl(e.target.value)}
                    placeholder="https://drive.google.com/... or direct download link"
                  />
                  <Button
                    onClick={async () => {
                      setLoading(true); setError(''); setSuccess('')
                      try {
                        const r = await fetch('/api/admin/settings', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ software_download_url: softwareUrl }),
                        })
                        if (!r.ok) throw new Error('Failed')
                        setSuccess('Software download link updated')
                      } catch (e: any) { setError(e.message) } finally { setLoading(false) }
                    }}
                    disabled={loading}
                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="h-4 w-4" />Update Software Link
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><FileText className="h-4 w-4 text-purple-600" />Past Questions Download URL</CardTitle>
                  <CardDescription>
                    This URL is shown only to users who have paid ₦5,000 via Flutterwave. Update it here when the link changes.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    value={pastqUrl}
                    onChange={e => setPastqUrl(e.target.value)}
                    placeholder="https://drive.google.com/... or direct download link"
                  />
                  <Button
                    onClick={async () => {
                      setLoading(true); setError(''); setSuccess('')
                      try {
                        const r = await fetch('/api/admin/settings', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ pastq_download_url: pastqUrl }),
                        })
                        if (!r.ok) throw new Error('Failed')
                        setSuccess('Past questions link updated')
                      } catch (e: any) { setError(e.message) } finally { setLoading(false) }
                    }}
                    disabled={loading}
                    className="gap-2 bg-purple-600 hover:bg-purple-700"
                  >
                    <Download className="h-4 w-4" />Update Past Questions Link
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── SETTINGS ────────────────────────────────────────────────────── */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Settings className="h-4 w-4" />Platform Settings</CardTitle>
                <CardDescription>Configure the AI CBT platform URL.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">AI CBT Platform URL</label>
                  <Input
                    value={aiCbtUrl}
                    onChange={e => setAiCbtUrl(e.target.value)}
                    placeholder="https://..."
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={async () => {
                    setLoading(true); setError(''); setSuccess('')
                    try {
                      const r = await fetch('/api/admin/settings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ai_cbt_url: aiCbtUrl }),
                      })
                      if (!r.ok) throw new Error('Failed')
                      setSuccess('Settings saved')
                    } catch (e: any) { setError(e.message) } finally { setLoading(false) }
                  }}
                  disabled={loading}
                  className="gap-2"
                >
                  <Settings className="h-4 w-4" />Save Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}
