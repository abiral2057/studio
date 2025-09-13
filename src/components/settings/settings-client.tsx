"use client";

import { Header } from "@/components/layout/header";

export function SettingsClient() {
  return (
    <div className="flex-1 p-4 md:p-6">
      <Header title="Settings" />
      <div className="mt-4 md:mt-6">
        <p>Settings will be available here.</p>
      </div>
    </div>
  );
}
