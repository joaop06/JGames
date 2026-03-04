import { getUserMessage } from '../lib/userMessages';

const base = ''; // proxy in dev forwards /api to backend

async function request<T>(
  path: string,
  options: RequestInit & { json?: unknown } = {}
): Promise<T> {
  const { json, ...init } = options;
  const headers: HeadersInit = { ...(init.headers as HeadersInit) };
  if (json !== undefined) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }
  const res = await fetch(path.startsWith('http') ? path : `${base}${path}`, {
    ...init,
    headers,
    credentials: 'include',
    body: json !== undefined ? JSON.stringify(json) : init.body,
  });
  if (!res.ok) {
    const errBody = (await res.json().catch(() => ({ error: res.statusText }))) as {
      error?: string;
      details?: unknown;
    };
    const message = errBody.error ?? res.statusText ?? 'Request failed';
    const err = new Error(getUserMessage(message, res.status)) as Error & { details?: unknown };
    if (errBody.details != null) err.details = errBody.details;
    throw err;
  }
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export type UserResponse = {
  id: string;
  username: string;
  name?: string | null;
  email?: string | null;
  createdAt: string;
};

export const api = {
  async login(identifier: string, password: string): Promise<UserResponse> {
    const data = await request<{ user: UserResponse }>('/api/auth/login', {
      method: 'POST',
      json: { login: identifier, password },
    });
    return data!.user;
  },
  async register(
    username: string,
    password: string,
    name: string,
    email?: string
  ): Promise<UserResponse> {
    const data = await request<{ user: UserResponse }>('/api/auth/register', {
      method: 'POST',
      json: { username, password, name, email },
    });
    return data!.user;
  },
  async logout(): Promise<void> {
    await request('/api/auth/logout', { method: 'POST' });
  },
  async getMe(): Promise<UserResponse> {
    return request<UserResponse>('/api/users/me');
  },
  async checkUsername(username: string): Promise<{ exists: boolean }> {
    const q = new URLSearchParams({ username });
    return request<{ exists: boolean }>(`/api/users/check-username?${q.toString()}`);
  },
  async patchMe(body: { username?: string; name?: string; email?: string }): Promise<UserResponse> {
    return request<UserResponse>('/api/users/me', { method: 'PATCH', json: body });
  },
  async getFriends(): Promise<{
    friends: Array<{ id: string; username: string; name?: string | null; createdAt: string }>;
  }> {
    return request('/api/friends');
  },
  async getInvites(): Promise<{
    invites: Array<{
      id: string;
      fromUser: { id: string; username: string; name?: string | null };
      createdAt: string;
    }>;
  }> {
    return request('/api/friends/invites');
  },
  async inviteFriend(username: string): Promise<unknown> {
    return request('/api/friends/invite', { method: 'POST', json: { username } });
  },
  async acceptInvite(id: string): Promise<unknown> {
    return request(`/api/friends/invites/${id}/accept`, { method: 'POST' });
  },
  async rejectInvite(id: string): Promise<unknown> {
    return request(`/api/friends/invites/${id}/reject`, { method: 'POST' });
  },
  async removeFriend(friendId: string): Promise<void> {
    return request(`/api/friends/${friendId}`, { method: 'DELETE' });
  },

  async getNotifications(): Promise<{
    notifications: Array<{
      id: string;
      type: string;
      read: boolean;
      createdAt: string;
      friendInvite: {
        id: string;
        status: string;
        fromUser: { id: string; username: string; name?: string | null };
      } | null;
      gameInvite: {
        matchId: string;
        fromUser?: { id: string; username: string; name?: string | null };
        gameType: string;
      } | null;
    }>;
  }> {
    return request('/api/notifications');
  },
  async markNotificationRead(id: string): Promise<{ ok: boolean }> {
    return request(`/api/notifications/${id}/read`, { method: 'PATCH' });
  },
  async markAllNotificationsRead(): Promise<{ ok: boolean }> {
    return request('/api/notifications/read-all', { method: 'PATCH' });
  },

  async getWsToken(): Promise<{ token: string }> {
    return request<{ token: string }>('/api/auth/ws-token');
  },

  async createTicTacToeMatch(
    opponentUserId?: string
  ): Promise<{ match: TicTacToeMatchState; opponentBusy?: boolean }> {
    const id = typeof opponentUserId === 'string' ? opponentUserId.trim() : '';
    return request('/api/games/tic-tac-toe/matches', {
      method: 'POST',
      json: id ? { opponentUserId: id } : {},
    });
  },
  async listTicTacToeMatches(params?: { status?: string; limit?: number }): Promise<{
    matches: TicTacToeMatchListItem[];
  }> {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.limit != null) q.set('limit', String(params.limit));
    const query = q.toString();
    return request(`/api/games/tic-tac-toe/matches${query ? `?${query}` : ''}`);
  },
  async getTicTacToeMatch(matchId: string): Promise<{ match: TicTacToeMatchState }> {
    return request(`/api/games/tic-tac-toe/matches/${matchId}`);
  },
  async joinTicTacToeMatch(matchId: string): Promise<{ match: TicTacToeMatchState }> {
    return request(`/api/games/tic-tac-toe/matches/${matchId}/join`, { method: 'POST' });
  },
  async getTicTacToeStats(): Promise<{ stats: { wins: number; losses: number; draws: number } }> {
    return request('/api/games/tic-tac-toe/stats');
  },
  async getTicTacToeStatsVsFriend(
    friendId: string
  ): Promise<{ stats: { wins: number; losses: number; draws: number } }> {
    return request(`/api/games/tic-tac-toe/stats/vs-friend/${friendId}`);
  },
  async getTicTacToeLeaderboard(limit?: number): Promise<{
    leaderboard: Array<{
      rank: number;
      userId: string;
      username: string;
      name?: string | null;
      wins: number;
      losses: number;
      draws: number;
    }>;
  }> {
    const q = limit != null ? `?limit=${limit}` : '';
    return request(`/api/games/tic-tac-toe/leaderboard${q}`);
  },
  async getTicTacToeOnlineCount(): Promise<{ count: number }> {
    return request('/api/games/tic-tac-toe/online');
  },

  // --- Hangman / Jogo da Forca ---

  async startHangmanGame(body: {
    categoryId?: string;
    difficulty: HangmanDifficulty;
    mode?: HangmanMode;
    timerSeconds?: number | null;
  }): Promise<{ game: HangmanGameState; categories: HangmanCategoryMeta[] }> {
    return request('/api/games/hangman/start', {
      method: 'POST',
      json: body,
    });
  },

  async guessHangman(gameId: string, letter: string): Promise<HangmanGuessResponse> {
    return request(`/api/games/hangman/${gameId}/guess`, {
      method: 'POST',
      json: { letter },
    });
  },

  async requestHangmanHint(gameId: string): Promise<HangmanHintResponse> {
    return request(`/api/games/hangman/${gameId}/hint`, {
      method: 'POST',
    });
  },

  async getHangmanGame(gameId: string): Promise<HangmanGameState> {
    return request(`/api/games/hangman/${gameId}`);
  },

  async getHangmanStats(userId: string): Promise<HangmanStatsResponse> {
    return request(`/api/games/hangman/stats/${userId}`);
  },

  async getHangmanLeaderboard(
    period: HangmanLeaderboardPeriod,
    limit?: number
  ): Promise<{ leaderboard: HangmanLeaderboardEntry[] }> {
    const q = new URLSearchParams({ period });
    if (limit != null) q.set('limit', String(limit));
    return request(`/api/games/hangman/leaderboard?${q.toString()}`);
  },

  async getHangmanAchievements(
    userId: string
  ): Promise<{ achievements: HangmanAchievement[] }> {
    return request(`/api/games/hangman/achievements/${userId}`);
  },
};

export type TicTacToeBoard = (null | 'X' | 'O')[];
export type TicTacToeMatchState = {
  id: string;
  gameType: string;
  status: string;
  winnerId: string | null;
  playerX: { id: string; username: string; name?: string | null } | undefined;
  playerO: { id: string; username: string; name?: string | null } | null;
  board: TicTacToeBoard;
  currentTurn: 'X' | 'O';
  moves: Array<{ position: number; playerId: string }>;
};
export type TicTacToeMatchListItem = {
  id: string;
  status: string;
  winnerId: string | null;
  playerX: { id: string; username: string };
  playerO: { id: string; username: string } | null;
  createdAt: string;
  finishedAt: string | null;
};

// --- Tipos do Jogo da Forca ---

export type HangmanMode = 'single' | 'multiplayer' | 'daily';
export type HangmanDifficulty = 'easy' | 'medium' | 'hard';
export type HangmanStatus = 'playing' | 'won' | 'lost';

export type HangmanCategoryMeta = {
  id: string;
  name: string;
};

export type HangmanGameState = {
  gameId: string;
  mode: HangmanMode;
  category: HangmanCategoryMeta | null;
  difficulty: HangmanDifficulty;
  maskedWord: string;
  maxErrors: number;
  errorsRemaining: number;
  guessedLetters: string[];
  hintsAvailable: number;
  hintsUsed: number;
  status: HangmanStatus;
  timerSeconds: number | null;
};

export type HangmanGuessResponse = HangmanGameState & {
  letter: string;
  correct: boolean;
  revealedWord?: string;
  score?: number;
};

export type HangmanHintResponse = HangmanGameState & {
  revealedLetter: string;
  positions: number[];
  scorePenalty: number;
};

export type HangmanStatsResponse = {
  gamesPlayed: number;
  wins: number;
  losses: number;
  currentStreak: number;
  bestStreak: number;
  averageScore: number;
};

export type HangmanLeaderboardPeriod = 'daily' | 'weekly' | 'alltime';

export type HangmanLeaderboardEntry = {
  rank: number;
  userId: string;
  username: string;
  avatar: string | null;
  score: number;
};

export type HangmanAchievement = {
  code: string;
  unlockedAt: string;
};
