import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'uz', 'ko'],
  defaultLocale: 'uz', // 기본 언어를 우즈베크어로 설정
});

export const config = {
  matcher: ['/', '/(en|uz)/:path*'],
};
