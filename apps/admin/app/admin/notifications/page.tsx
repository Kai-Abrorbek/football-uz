'use client';

import { useEffect, useState } from 'react';
import { PageLayout } from '../../components/Layout';
import { PageCard, SectionHeader } from '../../components/ui/PageCard';
import { Pill } from '../../components/ui/Pill';
import { adminApi } from '../../lib/api';

interface NotifHistory {
  _id: string;
  title: string;
  target: string;
  successCount: number;
  failureCount: number;
  createdAt: string;
}

const TARGET_OPTIONS = [
  { value: 'all', label: '전체 유저' },
  { value: 'verified', label: '인증 완료 유저' },
];

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const TARGET_LABEL: Record<string, string> = {
  all: '전체',
  verified: '인증유저',
};

export default function NotificationsPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState('all');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [history, setHistory] = useState<NotifHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await (adminApi as any).getNotificationHistory();
      setHistory(res.data.items);
    } catch {
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }
    if (!confirm(`${TARGET_LABEL[target]}에게 알림을 발송하시겠습니까?`))
      return;
    setSending(true);
    try {
      await (adminApi as any).sendNotification(title, body, target);
      setSent(true);
      setTitle('');
      setBody('');
      setTimeout(() => setSent(false), 3000);
      fetchHistory();
    } catch {
      alert('알림 발송 실패');
    } finally {
      setSending(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--surface)',
    border: '1px solid var(--border2)',
    borderRadius: 7,
    padding: '9px 12px',
    color: 'var(--text)',
    fontSize: 12,
    outline: 'none',
    fontFamily: 'inherit',
  };

  return (
    <PageLayout title="푸시 알림">
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        {/* 발송 폼 */}
        <div style={{ flex: 1, minWidth: 260 }}>
          <PageCard>
            <SectionHeader title="알림 발송" />
            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  fontSize: 10,
                  color: 'var(--muted2)',
                  display: 'block',
                  marginBottom: 6,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                대상
              </label>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                style={inputStyle}
              >
                {TARGET_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  fontSize: 10,
                  color: 'var(--muted2)',
                  display: 'block',
                  marginBottom: 6,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                제목
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="알림 제목..."
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  fontSize: 10,
                  color: 'var(--muted2)',
                  display: 'block',
                  marginBottom: 6,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                내용
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                placeholder="알림 내용을 입력하세요..."
                style={{ ...inputStyle, resize: 'none' }}
              />
            </div>
            {sent && (
              <div
                style={{
                  background: 'rgba(0,214,143,0.1)',
                  color: 'var(--green)',
                  border: '1px solid rgba(0,214,143,0.25)',
                  borderRadius: 7,
                  padding: '8px 12px',
                  fontSize: 12,
                  textAlign: 'center',
                  marginBottom: 12,
                }}
              >
                ✓ 알림이 성공적으로 발송되었습니다!
              </div>
            )}
            <button
              onClick={handleSend}
              disabled={sending}
              style={{
                width: '100%',
                background: sending ? 'var(--border2)' : 'var(--cyan)',
                color: sending ? 'var(--muted2)' : 'var(--bg)',
                border: 'none',
                borderRadius: 8,
                padding: '11px 0',
                fontSize: 13,
                fontWeight: 800,
                cursor: sending ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                letterSpacing: '0.04em',
              }}
            >
              {sending ? '전송 중...' : '▶ 전송하기'}
            </button>
          </PageCard>
        </div>

        {/* 발송 이력 */}
        <div style={{ flex: 1, minWidth: 240 }}>
          <PageCard>
            <SectionHeader title="발송 이력" />
            {loadingHistory ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '24px 0',
                  color: 'var(--muted2)',
                  fontSize: 12,
                }}
              >
                불러오는 중...
              </div>
            ) : history.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '24px 0',
                  color: 'var(--muted2)',
                  fontSize: 12,
                }}
              >
                발송 이력이 없습니다.
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>제목</th>
                    <th>대상</th>
                    <th>성공</th>
                    <th>일시</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h._id}>
                      <td
                        style={{
                          maxWidth: 120,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h.title}
                      </td>
                      <td>
                        <Pill color="#6B7A99">
                          {TARGET_LABEL[h.target] ?? h.target}
                        </Pill>
                      </td>
                      <td
                        className="mono"
                        style={{ color: 'var(--cyan)', fontSize: 11 }}
                      >
                        {h.successCount}
                      </td>
                      <td
                        className="mono"
                        style={{ fontSize: 10, color: 'var(--muted2)' }}
                      >
                        {formatDate(h.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </PageCard>
        </div>
      </div>
    </PageLayout>
  );
}
