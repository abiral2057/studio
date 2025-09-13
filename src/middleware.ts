import { NextResponse, type NextRequest } from 'next/server';
import { getSessionFromCookie } from '@/lib/session';

// The middleware will run for all paths except for the ones specified in the matcher
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login).*)'],
};

export async function middleware(request: NextRequest) {
  const session = await getSessionFromCookie();
  const { pathname } = request.nextUrl;

  // If the user is not authenticated and is trying to access a protected page,
  // redirect them to the login page.
  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // If the user is authenticated, allow them to proceed.
  return NextResponse.next();
}
