
import { SettingsClient } from "@/components/settings/settings-client";
import { getSession } from "@/lib/auth-actions";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session || !session.user) {
    redirect('/login?from=/settings');
  }
  
  return (
    <SettingsClient user={session.user} />
  );
}
