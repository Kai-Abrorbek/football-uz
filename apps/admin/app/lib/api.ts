import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  // baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://72.62.75.97:4000/api/v1',
  withCredentials: true, // ← 쿠키 자동 포함, localStorage 방식 제거
});

// 401 뜨면 자동으로 로그인 페이지로
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      typeof window !== 'undefined' &&
      !window.location.pathname.includes('/login') &&
      !error.config?.url?.includes('/auth/me') // ← 이거 추가
    ) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export const adminApi = {
  // 대시보드
  getDashboard: () => api.get('/admin/dashboard'),

  // 경기
  getMatches: (date?: string, week?: boolean, page = 1) =>
    api.get(
      `/admin/matches?date=${date ?? ''}&week=${week ?? false}&page=${page}`,
    ),

  setStreaming: (
    id: string,
    data: { isStreaming: boolean; streamKey?: string },
  ) => api.post(`/admin/matches/${id}/streaming`, data),
  getStreamingMatches: () => api.get('/admin/matches/streaming'),

  // 유저
  getUsers: (page = 1, search?: string) =>
    api.get(`/admin/users?page=${page}&search=${search ?? ''}`),
  updateUserRole: (id: string, role: string) =>
    api.patch(`/admin/users/${id}/role`, { role }),
  toggleUserBan: (id: string, isBanned: boolean) =>
    api.patch(`/admin/users/${id}/ban`, { isBanned }),

  // 팀
  getTeams: (page = 1, search?: string) =>
    api.get(`/admin/teams?page=${page}&search=${search ?? ''}`),
  updateTeamColor: (id: string, color: string) =>
    api.patch(`/admin/teams/${id}/color`, { color }),

  // 하이라이트
  getHighlights: (page = 1) => api.get(`/admin/highlights?page=${page}`),
  deleteHighlight: (id: string) => api.delete(`/admin/highlights/${id}`),

  // 어드민 Auth
  login: (email: string, password: string) =>
    api.post('/auth/admin/login', { email, password }),

  logout: () => api.post('/auth/admin/logout'),
  getMe: () => api.get('/auth/me'),

  // 알림
  sendNotification: (title: string, body: string, target: string) =>
    api.post('/admin/notifications/send', { title, body, target }),
  getNotificationHistory: (page = 1) =>
    api.get(`/admin/notifications/history?page=${page}`),

  // 브라켓 순서
  getBracketSlots: (leagueId: number, season: number, round: string) =>
    api.get(
      `/bracket/slots?leagueId=${leagueId}&season=${season}&round=${encodeURIComponent(round)}`,
    ),
  updateBracketSlots: (data: any) => api.post('/bracket/slots', data),
};
