
'use server';

import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import type { User } from './types';

// Hardcoded user for simplicity. In a real app, you'd fetch this from a database.
const FAKE_USER: User & { passwordHash: string } = {
  id: '1',
  name: 'Abiral Shrestha',
  username: 'abiral@admin',
  email: 'abiral.shrestha72@gmail.com',
  passwordHash: 'BaqCjyjSpU2HQ8yC', // This should be a securely hashed password
};

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'a-very-secret-and-secure-key-for-jwt');
const cookieName = 'session';

async function encrypt(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d') // Session expires in 1 day
    .sign(secret);
}

async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, secret, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function login({ username, password }: { username: string, password: string }) {
  // In a real app, you would verify the password against the stored hash
  if (username === FAKE_USER.username && password === FAKE_USER.passwordHash) {
    const { passwordHash, ...user } = FAKE_USER;
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
    const session = await encrypt({ user, expires });

    cookies().set(cookieName, session, { expires, httpOnly: true });

    return { success: true };
  }
  return { success: false, error: 'Invalid username or password' };
}

export async function logout() {
  cookies().set(cookieName, '', { expires: new Date(0) });
}

export async function getSession() {
  const sessionCookie = cookies().get(cookieName)?.value;
  if (!sessionCookie) return null;

  const session = await decrypt(sessionCookie);

  if (!session || !session.user) return null;
  
  return session as { user: User; expires: Date };
}

export async function changePassword({ currentPassword, newPassword }: { currentPassword: string, newPassword: string}) {
   if (currentPassword !== FAKE_USER.passwordHash) {
    return { success: false, error: "Current password does not match." };
  }
  
  // In a real app, you would update the hashed password in the database.
  // For this demo, we can't really "change" the hardcoded password.
  // We'll simulate success and log the user out.
  
  console.log("Password change requested. New password would be:", newPassword);
  
  // Since we changed the password, we should log the user out for security.
  await logout();
  
  return { success: true };
}
