const base = '' // proxy in dev forwards /api to backend

async function request<T>(
  path: string,
  options: RequestInit & { json?: unknown } = {}
): Promise<T> {
  const { json, ...init } = options
  const headers: HeadersInit = { ...(init.headers as HeadersInit) }
  if (json !== undefined) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json'
  }
  const res = await fetch(path.startsWith('http') ? path : `${base}${path}`, {
    ...init,
    headers,
    credentials: 'include',
    body: json !== undefined ? JSON.stringify(json) : init.body,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((err as { error?: string }).error ?? 'Request failed')
  }
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as T
  }
  return res.json() as Promise<T>
}

export type UserResponse = {
  id: string
  email: string
  username: string
  createdAt: string
}

export const api = {
  async login(email: string, password: string): Promise<UserResponse> {
    const data = await request<{ user: UserResponse }>('/api/auth/login', {
      method: 'POST',
      json: { email, password },
    })
    return data!.user
  },
  async register(email: string, username: string, password: string): Promise<UserResponse> {
    const data = await request<{ user: UserResponse }>('/api/auth/register', {
      method: 'POST',
      json: { email, username, password },
    })
    return data!.user
  },
  async logout(): Promise<void> {
    await request('/api/auth/logout', { method: 'POST' })
  },
  async getMe(): Promise<UserResponse> {
    return request<UserResponse>('/api/users/me')
  },
  async patchMe(body: { username?: string }): Promise<UserResponse> {
    return request<UserResponse>('/api/users/me', { method: 'PATCH', json: body })
  },
  async getFriends(): Promise<{ friends: Array<{ id: string; username: string; createdAt: string }> }> {
    return request('/api/friends')
  },
  async getInvites(): Promise<{
    invites: Array<{ id: string; fromUser: { id: string; username: string }; createdAt: string }>
  }> {
    return request('/api/friends/invites')
  },
  async inviteFriend(username: string): Promise<unknown> {
    return request('/api/friends/invite', { method: 'POST', json: { username } })
  },
  async acceptInvite(id: string): Promise<unknown> {
    return request(`/api/friends/invites/${id}/accept`, { method: 'POST' })
  },
  async rejectInvite(id: string): Promise<unknown> {
    return request(`/api/friends/invites/${id}/reject`, { method: 'POST' })
  },
}
