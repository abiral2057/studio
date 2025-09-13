
'use server';

import { cookies } from 'next/headers';
import type { User } from './types';
import { getUser as getUserFromDb } from './data';
import { encrypt, decrypt } from './session';

export async function login({ username, password }: { username: string, password: string }) {
  const userRecord = await getUserFromDb();
  
  if (!userRecord) {
    return { success: false, error: 'System user not configured.' };
  }
  
  if (username === userRecord.username && password === userRecord.passwordHash) {
    const { passwordHash, ...user } = userRecord;
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
    const session = await encrypt({ user, expires });

    cookies().set('session', session, { expires, httpOnly: true });

    return { success: true };
  }
  return { success: false, error: 'Invalid username or password' };
}

export async function logout() {
  cookies().set('session', '', { expires: new Date(0) });
}

export async function getSession() {
  const sessionCookie = cookies().get('session')?.value;
  const session = await decrypt(sessionCookie);

  if (!session || !session.user) return null;
  
  // Refresh user data from the database to ensure it's up-to-date.
  const latestUser = await getUserFromDb();
  if (!latestUser) return null;

  const { passwordHash, ...user } = latestUser;
  
  return { user: user as User, expires: session.expires as Date };
}

export async function changePassword({ currentPassword, newPassword }: { currentPassword: string, newPassword: string}) {
   const userRecord = await getUserFromDb();
   if (!userRecord) {
    return { success: false, error: 'System user not configured.' };
   }

   if (currentPassword !== userRecord.passwordHash) {
    return { success: false, error: "Current password does not match." };
  }
  
  // In a real app, you would update the hashed password in the database.
  // For this demo, we can't really "change" the hardcoded password in db.json easily.
  // We'll simulate success and log the user out.
  
  console.log("Password change requested. New password would be:", newPassword, ". This is a simulation.");
  
  // Since we changed the password, we should log the user out for security.
  await logout();
  
  return { success: true };
}
