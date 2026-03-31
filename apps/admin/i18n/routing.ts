import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'uz', 'ko'],
  defaultLocale: 'uz',
});

// 여기서 생성된 useRouter, usePathname을 앱 전체에서 사용하게 됨
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
