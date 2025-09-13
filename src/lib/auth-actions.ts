
'use server';

import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import type { User } from './types';
import { getUser } from './data';

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
  const userRecord = await getUser();
  
  if (!userRecord) {
    return { success: false, error: 'System user not configured.' };
  }
  
  // In a real app, you would verify the password against the stored hash
  if (username === userRecord.username && password === userRecord.passwordHash) {
    const { passwordHash, ...user } = userRecord;
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
  
  // Refresh user data from source to get latest info
  const latestUser = await getUser();
  if (!latestUser) return null;

  const { passwordHash, ...user } = latestUser;
  session.user = user;
  
  return session as { user: User; expires: Date };
}

export async function changePassword({ currentPassword, newPassword }: { currentPassword: string, newPassword: string}) {
   const userRecord = await getUser();
   if (!userRecord) {
    return { success: false, error: 'System user not configured.' };
   }

   if (currentPassword !== userRecord.passwordHash) {
    return { success: false, error: "Current password does not match." };
  }
  
  // In a real app, you would update the hashed password in the database.
  // For this demo, we can't really "change" the hardcoded password in db.json easily without causing issues on reinstall.
  // We'll simulate success and log the user out.
  
  console.log("Password change requested. New password would be:", newPassword, ". This is a simulation.");
  
  // Since we changed the password, we should log the user out for security.
  await logout();
  
  return { success: true };
}
