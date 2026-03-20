export async function api<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, { ...opts, headers: { 'Content-Type': 'application/json', ...(opts?.headers||{}) } })
  if (!res.ok) throw await res.json().catch(()=>({ error: res.statusText }))
  return res.json()
}

export async function getJSON(path: string) {
  const res = await fetch(path)
  if (!res.ok) throw new Error('Network error')
  return res.json()
}
