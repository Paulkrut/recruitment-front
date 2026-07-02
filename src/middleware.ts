import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sanitizeInterviewToken } from '@/utils/interviewToken';

/** iOS/HH: к URL прилипает следующее слово — режем до 64 hex и редиректим */
function getCleanInterviewPath(pathname: string): string | null {
  const applyMatch = pathname.match(/^\/interview\/apply\/([^/?#]+)/);
  if (applyMatch) {
    const clean = sanitizeInterviewToken(applyMatch[1]);
    if (clean && clean !== applyMatch[1]) {
      return pathname.replace(`/interview/apply/${applyMatch[1]}`, `/interview/apply/${clean}`);
    }
    return null;
  }

  const interviewMatch = pathname.match(/^\/interview\/([^/?#]+)/);
  if (interviewMatch && interviewMatch[1] !== 'apply') {
    const clean = sanitizeInterviewToken(interviewMatch[1]);
    if (clean && clean !== interviewMatch[1]) {
      return pathname.replace(`/interview/${interviewMatch[1]}`, `/interview/${clean}`);
    }
  }

  return null;
}

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const { pathname } = request.nextUrl;

  const cleanPath = getCleanInterviewPath(pathname);
  if (cleanPath) {
    const url = request.nextUrl.clone();
    url.pathname = cleanPath;
    return NextResponse.redirect(url, 307);
  }

  // Определяем язык по домену
  let locale = 'ru';
  if (hostname.includes('.com') || hostname.includes('en.')) {
    locale = 'en';
  }

  // Устанавливаем заголовок с текущей локалью
  const response = NextResponse.next();
  response.cookies.set('NEXT_LOCALE', locale, {
    maxAge: 60 * 60 * 24 * 365, // 1 год
    path: '/',
  });

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};


