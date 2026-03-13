'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageLayout } from '../components/Layout';
import { PageCard, SectionHeader, SearchBar } from '../components/ui/PageCard';
import { Pill } from '../components/ui/Pill';
import { adminApi } from '../lib/api';

interface User {
  _id: string;
  username: string;
  email: string;
  createdAt: string;
  isEmailVerified: boolean;
  role: string;
  isBanned: boolean;
  googleId?: string;
  telegramId?: string;
}

const getLoginMethod = (u: User): { label: string; color: string } => {
  if (u.telegramId) return { label: 'Telegram', color: '#26A5E4' };
  if (u.googleId) return { label: 'Google', color: '#A78BFA' };
  return { label: 'Email', color: '#00E5FF' };
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async (p: number, q: string) => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers(p, q);
      if (p === 1) {
        setUsers(res.data.users);
      } else {
        setUsers((prev) => [...prev, ...res.data.users]);
      }
      setTotal(res.data.total);
      setHasMore(res.data.hasMore);
      setPage(p);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(1, '');
  }, [fetchUsers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1, search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, fetchUsers]);

  const handleRoleChange = async (id: string, role: string) => {
    if (
      !confirm(
        role === 'admin'
          ? '어드민으로 승격하시겠습니까?'
          : '권한을 해제하시겠습니까?',
      )
    )
      return;
    try {
      await adminApi.updateUserRole(id, role);
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, role } : u)));
    } catch {
      alert('역할 변경 실패');
    }
  };

  const handleToggleBan = async (id: string, isBanned: boolean) => {
    if (
      !confirm(
        isBanned ? '정지를 해제하시겠습니까?' : '유저를 정지하시겠습니까?',
      )
    )
      return;
    try {
      await adminApi.toggleUserBan(id, !isBanned);
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, isBanned: !isBanned } : u)),
      );
    } catch {
      alert('정지 설정 실패');
    }
  };

  return (
    <PageLayout title={`유저 관리 (${total})`}>
      <SearchBar
        placeholder="유저 검색..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <PageCard>
        <SectionHeader title="유저 목록" />
        {loading && page === 1 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 0',
              color: 'var(--muted2)',
              fontSize: 13,
            }}
          >
            불러오는 중...
          </div>
        ) : users.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 0',
              color: 'var(--muted2)',
              fontSize: 13,
            }}
          >
            유저가 없습니다.
          </div>
        ) : (
          <>
            <div className="tbl-wrap">
              <table>
                <thead>
                  <tr>
                    <th>이름</th>
                    <th>이메일</th>
                    <th>가입일</th>
                    <th>로그인</th>
                    <th>인증</th>
                    <th>역할</th>
                    <th>상태</th>
                    <th>액션</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const method = getLoginMethod(u);
                    return (
                      <tr key={u._id}>
                        <td>
                          <strong>{u.username}</strong>
                        </td>
                        <td className="mono" style={{ color: 'var(--muted2)' }}>
                          {u.email}
                        </td>
                        <td
                          className="mono"
                          style={{ color: 'var(--muted2)', fontSize: 10 }}
                        >
                          {formatDate(u.createdAt)}
                        </td>
                        <td>
                          <Pill color={method.color}>{method.label}</Pill>
                        </td>
                        <td>
                          <Pill
                            color={u.isEmailVerified ? '#00E5FF' : '#FFB800'}
                          >
                            {u.isEmailVerified ? '완료' : '대기'}
                          </Pill>
                        </td>
                        <td>
                          <Pill
                            color={u.role === 'admin' ? '#FF3D57' : '#6B7A99'}
                          >
                            {u.role === 'admin' ? 'ADMIN' : '유저'}
                          </Pill>
                        </td>
                        <td>
                          <Pill color={u.isBanned ? '#FF3D57' : '#00D68F'}>
                            {u.isBanned ? '정지' : '정상'}
                          </Pill>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 5 }}>
                            <button
                              onClick={() =>
                                handleRoleChange(
                                  u._id,
                                  u.role === 'admin' ? 'user' : 'admin',
                                )
                              }
                              style={{
                                background:
                                  u.role === 'admin'
                                    ? 'rgba(107,122,153,0.08)'
                                    : 'rgba(167,139,250,0.08)',
                                border: `1px solid ${u.role === 'admin' ? 'rgba(107,122,153,0.25)' : 'rgba(167,139,250,0.25)'}`,
                                color:
                                  u.role === 'admin'
                                    ? 'var(--muted2)'
                                    : '#A78BFA',
                                borderRadius: 5,
                                padding: '3px 8px',
                                fontSize: 10,
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                              }}
                            >
                              {u.role === 'admin' ? '권한해제' : '승격'}
                            </button>
                            <button
                              onClick={() => handleToggleBan(u._id, u.isBanned)}
                              style={{
                                background: u.isBanned
                                  ? 'rgba(0,214,143,0.08)'
                                  : 'rgba(255,61,87,0.08)',
                                border: `1px solid ${u.isBanned ? 'rgba(0,214,143,0.25)' : 'rgba(255,61,87,0.25)'}`,
                                color: u.isBanned ? '#00D68F' : 'var(--red)',
                                borderRadius: 5,
                                padding: '3px 8px',
                                fontSize: 10,
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                              }}
                            >
                              {u.isBanned ? '해제' : '정지'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {hasMore && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <button
                  onClick={() => fetchUsers(page + 1, search)}
                  disabled={loading}
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border2)',
                    color: 'var(--muted2)',
                    borderRadius: 8,
                    padding: '8px 24px',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit',
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? '불러오는 중...' : '더 보기'}
                </button>
              </div>
            )}
          </>
        )}
      </PageCard>
    </PageLayout>
  );
}
