import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
});

// 어드민 토큰 설정
export const setAdminToken = (token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// 페이지 로드시 토큰 자동 주입
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('admin_token');
  if (token) setAdminToken(token);
}

export const adminApi = {
  // 대시보드
  getDashboard: () => api.get('/admin/dashboard'),

  // 경기
  getMatches: (date?: string, page = 1) =>
    api.get(`/admin/matches?date=${date ?? ''}&page=${page}`),
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
};
