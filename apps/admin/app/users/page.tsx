import { PageLayout } from '../components/Layout';
import { PageCard, SectionHeader, SearchBar } from '../components/ui/PageCard';
import { Pill } from '../components/ui/Pill';

const USERS = [
  {
    name: '김민준',
    email: 'minjun@gmail.com',
    date: '2026.01.12',
    method: 'Google',
    methodColor: '#A78BFA',
    verified: true,
    role: '유저',
    roleColor: '#6B7A99',
  },
  {
    name: '이서연',
    email: 'seoyeon@naver.com',
    date: '2026.02.03',
    method: 'Email',
    methodColor: '#00E5FF',
    verified: true,
    role: '유저',
    roleColor: '#6B7A99',
  },
  {
    name: '박지호',
    email: 'jiho@tg.uz',
    date: '2026.03.01',
    method: 'Telegram',
    methodColor: '#26A5E4',
    verified: false,
    role: '유저',
    roleColor: '#6B7A99',
  },
  {
    name: 'Alisher T.',
    email: 'ali@mail.ru',
    date: '2026.03.08',
    method: 'Telegram',
    methodColor: '#26A5E4',
    verified: false,
    role: '유저',
    roleColor: '#6B7A99',
  },
  {
    name: '관리자',
    email: 'admin@footballuz.uz',
    date: '2025.12.01',
    method: 'Email',
    methodColor: '#00E5FF',
    verified: true,
    role: 'ADMIN',
    roleColor: '#FF3D57',
  },
];

export default function UsersPage() {
  return (
    <PageLayout title="유저 관리">
      <SearchBar placeholder="유저 검색..." />
      <PageCard>
        <SectionHeader title="유저 목록" />
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
              </tr>
            </thead>
            <tbody>
              {USERS.map((u, i) => (
                <tr key={i}>
                  <td>
                    <strong>{u.name}</strong>
                  </td>
                  <td className="mono" style={{ color: 'var(--muted2)' }}>
                    {u.email}
                  </td>
                  <td
                    className="mono"
                    style={{ color: 'var(--muted2)', fontSize: 10 }}
                  >
                    {u.date}
                  </td>
                  <td>
                    <Pill color={u.methodColor}>{u.method}</Pill>
                  </td>
                  <td>
                    <Pill color={u.verified ? '#00E5FF' : '#FFB800'}>
                      {u.verified ? '완료' : '대기'}
                    </Pill>
                  </td>
                  <td>
                    <Pill color={u.roleColor}>{u.role}</Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageCard>
    </PageLayout>
  );
}
