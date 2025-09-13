
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'a-very-secret-and-secure-key-for-jwt');
const cookieName = 'session';

export async function encrypt(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d') // Session expires in 1 day
    .sign(secret);
}

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, secret, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

// This function is safe for the Edge runtime as it only deals with cookies.
export async function getSessionFromCookie(cookieStore: ReadonlyRequestCookies) {
  const sessionCookie = cookieStore.get(cookieName)?.value;
  if (!sessionCookie) return null;
  return await decrypt(sessionCookie);
}
