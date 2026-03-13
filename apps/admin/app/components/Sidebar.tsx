'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { adminApi } from '../lib/api';

const NAV = [
  {
    href: '/',
    label: '대시보드',
    badge: null,
    live: false,
    icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10',
  },
  {
    href: '/matches',
    label: '경기 관리',
    badge: null,
    live: false,
    icon: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  },
  {
    href: '/streaming',
    label: '스트리밍',
    badge: null,
    live: true,
    icon: 'M23 7l-7 5 7 5V7z M1 5h15a2 2 0 012 2v10a2 2 0 01-2 2H1z',
  },
  {
    href: '/highlights',
    label: '하이라이트',
    badge: null,
    live: false,
    icon: 'M10 8l6 4-6 4V8z M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    href: '/users',
    label: '유저 관리',
    badge: null,
    live: false,
    icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z',
  },
  {
    href: '/notifications',
    label: '푸시 알림',
    badge: null,
    live: false,
    icon: 'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0',
  },
  {
    href: '/swagger',
    label: 'Swagger API',
    badge: null,
    live: false,
    icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [me, setMe] = useState<{ email: string; id: string } | null>(null);

  useEffect(() => {
    adminApi
      .getMe()
      .then((res) => setMe(res.data))
      .catch(() => {}); // 인터셉터가 처리
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await adminApi.logout();
      router.push('/login');
    } catch {
      router.push('/login');
    } finally {
      setLoggingOut(false);
      setShowConfirm(false);
    }
  };

  const avatarLetter = me?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <aside
      style={{
        width: 220,
        background: 'var(--sidebar)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '20px 16px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, var(--cyan), var(--red))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
          }}
        >
          ⚽
        </div>
        <div>
          <div
            style={{ fontSize: 14, fontWeight: 800, letterSpacing: '0.02em' }}
          >
            Football UZ
          </div>
          <div
            style={{
              fontSize: 9,
              color: 'var(--muted2)',
              letterSpacing: '0.1em',
              marginTop: 1,
            }}
          >
            ADMIN PANEL
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
        {NAV.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{ textDecoration: 'none' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 11px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  background: isActive ? 'rgba(0,229,255,0.1)' : 'transparent',
                  color: isActive ? 'var(--cyan)' : 'var(--muted2)',
                  marginBottom: 2,
                  transition: 'all 0.15s',
                  fontSize: 12.5,
                  fontWeight: isActive ? 600 : 400,
                  position: 'relative',
                }}
              >
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 4,
                      bottom: 4,
                      width: 3,
                      borderRadius: '0 2px 2px 0',
                      background: 'var(--cyan)',
                    }}
                  />
                )}
                <svg
                  width={15}
                  height={15}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={item.icon} />
                </svg>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.live && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      background: 'var(--red)',
                      animation: 'pulse 1.5s ease infinite',
                    }}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ borderTop: '1px solid var(--border)' }}>
        {showConfirm && (
          <div
            style={{
              margin: '10px 10px 0',
              background: 'rgba(255,61,87,0.08)',
              border: '1px solid rgba(255,61,87,0.25)',
              borderRadius: 10,
              padding: '12px 14px',
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: 'var(--text)',
                marginBottom: 10,
                fontWeight: 500,
              }}
            >
              로그아웃 하시겠습니까?
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                style={{
                  flex: 1,
                  padding: '6px 0',
                  borderRadius: 6,
                  border: 'none',
                  background: 'var(--red)',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: loggingOut ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  opacity: loggingOut ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                }}
              >
                {loggingOut ? (
                  <>
                    <svg
                      style={{ animation: 'spin 1s linear infinite' }}
                      width={11}
                      height={11}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                    >
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    처리중...
                  </>
                ) : (
                  '로그아웃'
                )}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  flex: 1,
                  padding: '6px 0',
                  borderRadius: 6,
                  border: '1px solid var(--border2)',
                  background: 'transparent',
                  color: 'var(--muted2)',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                취소
              </button>
            </div>
          </div>
        )}

        <div
          style={{
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              background: 'rgba(0,229,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 800,
              color: 'var(--cyan)',
              flexShrink: 0,
            }}
          >
            {avatarLetter}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {me?.email ?? '...'}
            </div>
            <div style={{ fontSize: 9, color: 'var(--muted)' }}>
              Administrator
            </div>
          </div>
          <button
            onClick={() => setShowConfirm(!showConfirm)}
            title="로그아웃"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: showConfirm ? 'var(--red)' : 'var(--muted)',
              padding: 4,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--red)')}
            onMouseLeave={(e) => {
              if (!showConfirm) e.currentTarget.style.color = 'var(--muted)';
            }}
          >
            <svg
              width={15}
              height={15}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </aside>
  );
}
