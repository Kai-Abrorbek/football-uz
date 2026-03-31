import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import '../globals.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  // Football UZ 앱에 맞춘 3개 국어 SEO 데이터
  const seoData: Record<string, { title: string; desc: string }> = {
    uz: {
      title: 'Football UZ | Jonli natijalar va Hamjamiyat',
      desc: "Real vaqtda o'yin natijalari, liga jadvali va futbol muxlislari bilan aloqa.",
    },
    en: {
      title: 'Football UZ | Live Scores & Fan Community',
      desc: 'Get real-time match scores, league standings, and connect with football fans worldwide.',
    },
    ko: {
      title: 'Football UZ | 우즈베키스탄 축구 라이브 & 커뮤니티',
      desc: '실시간 경기 스코어, 리그 순위, 그리고 글로벌 팬들과 소통하는 가장 빠른 방법.',
    },
  };

  const currentSEO = seoData[locale] || seoData.en;

  return {
    metadataBase: new URL('https://footballuz.online'),
    title: currentSEO.title,
    description: currentSEO.desc,
    icons: {
      icon: [
        { url: '/icon2.png', sizes: '16x16' },
        { url: '/icon2.png', sizes: '32x32' },
      ],
      apple: [{ url: '/icon2.jpg', sizes: '180x180' }],
    },
    openGraph: {
      title: currentSEO.title,
      description: currentSEO.desc,
      url: 'https://footballuz.online',
      siteName: 'Football Uz',
      images: [
        {
          url: '/icon2.jpg', // 나중에 1200x630 사이즈의 'og-image.png'를 따로 만들어서 교체하는 걸 추천!
          width: 1200,
          height: 630,
          alt: 'Football UZ 미리보기',
        },
      ],
      locale: locale,
      type: 'website',
    },
  };
}

// 기존 레이아웃 코드는 그대로 유지
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!['en', 'uz', 'ko'].includes(locale)) notFound();

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
