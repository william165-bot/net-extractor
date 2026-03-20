import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'
import { useNavigate } from 'react-router-dom'
import { Shield, User, Lock, AlertCircle } from 'lucide-react'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  async function submit() {
    setLoading(true); setError('')
    try {
      await api('/admin/login', { method: 'POST', body: JSON.stringify({ username, password }) })
      nav('/admin')
    } catch (e: any) {
      setError(e?.error || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="h-1 w-full" style={{background: 'linear-gradient(90deg, #1a5c35 0%, #1a5c35 65%, #c8a84b 65%, #c8a84b 100%)'}} />
          <div className="p-8">
            <div className="flex justify-center mb-6">
              <div className="h-14 w-14 rounded-2xl bg-primary/8 border border-primary/15 flex items-center justify-center">
                <Shield className="h-7 w-7 text-primary" />
              </div>
            </div>
            <h1 className="font-serif text-xl font-bold text-center mb-1">Admin Portal</h1>
            <p className="text-xs text-center text-muted-foreground mb-6">FCT CBT Practice — Restricted Access</p>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-primary" />
                  Admin Username
                </label>
                <Input
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="h-11"
                  onKeyDown={e => e.key === 'Enter' && submit()}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-primary" />
                  Password
                </label>
                <Input
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  type="password"
                  className="h-11"
                  onKeyDown={e => e.key === 'Enter' && submit()}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/8 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button className="w-full h-11 font-bold" onClick={submit} disabled={loading}>
                {loading ? (
                  <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />Please wait…</>
                ) : (
                  'Sign In to Admin Panel'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
