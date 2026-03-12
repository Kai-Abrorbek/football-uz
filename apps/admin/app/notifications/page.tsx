'use client';

import { useState } from 'react';
import { PageLayout } from '../components/Layout';
import { PageCard, SectionHeader } from '../components/ui/PageCard';
import { Pill } from '../components/ui/Pill';

const HISTORY = [
  { title: 'UPL R12 개막!', target: '전체', date: '03/12 10:00' },
  { title: 'Pakhtakor 하이라이트', target: '구독자', date: '03/11 22:30' },
  { title: '서버 점검 안내', target: '전체', date: '03/10 09:00' },
];

export default function NotificationsPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    setSent(true);
    setTitle('');
    setBody('');
    setTimeout(() => setSent(false), 3000);
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
              <select style={inputStyle}>
                <option>전체 유저</option>
                <option>인증 완료 유저</option>
                <option>특정 팀 구독자</option>
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
              style={{
                width: '100%',
                background: 'var(--cyan)',
                color: 'var(--bg)',
                border: 'none',
                borderRadius: 8,
                padding: '11px 0',
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: 'inherit',
                letterSpacing: '0.04em',
              }}
            >
              ▶ 전송하기
            </button>
          </PageCard>
        </div>

        {/* 발송 이력 */}
        <div style={{ flex: 1, minWidth: 240 }}>
          <PageCard>
            <SectionHeader title="발송 이력" />
            <table>
              <thead>
                <tr>
                  <th>제목</th>
                  <th>대상</th>
                  <th>일시</th>
                </tr>
              </thead>
              <tbody>
                {HISTORY.map((h, i) => (
                  <tr key={i}>
                    <td>{h.title}</td>
                    <td>
                      <Pill color="#6B7A99">{h.target}</Pill>
                    </td>
                    <td
                      className="mono"
                      style={{ fontSize: 10, color: 'var(--muted2)' }}
                    >
                      {h.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </PageCard>
        </div>
      </div>
    </PageLayout>
  );
}
