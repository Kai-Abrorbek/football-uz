import type { Metadata } from 'next';
import '../globals.css';
import { Sidebar } from './components/Sidebar';

export const metadata: Metadata = {
  title: 'Football UZ — Admin',
  description: 'Football UZ Admin Panel',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body
        style={{
          display: 'flex',
          height: '100vh',
          overflow: 'hidden',
          background: 'var(--bg)',
        }}
      >
        <Sidebar />
        <main
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
