"use client";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}

export function Header({ title, actionButton }: HeaderProps) {
  return (
    <header className="bg-card/80 backdrop-blur-sm sticky top-0 z-10 border-b p-4 md:bg-transparent md:backdrop-blur-none md:static md:border-none md:p-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {actionButton && (
          <Button onClick={actionButton.onClick} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            {actionButton.label}
          </Button>
        )}
      </div>
    </header>
  );
}
