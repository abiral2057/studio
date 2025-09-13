
"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { changePassword } from "@/lib/auth-actions";
import { type User } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { EditProfileSheet } from "./edit-profile-sheet";
import { updateUser } from "@/lib/actions";

interface SettingsClientProps {
  user: User;
}

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(8, "New password must be at least 8 characters."),
  confirmPassword: z.string().min(1, "Please confirm your new password."),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match.",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export function SettingsClient({ user }: SettingsClientProps) {
  const { toast } = useToast();
  const { logout: authLogout } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  const onPasswordSubmit = (values: PasswordFormValues) => {
    startTransition(async () => {
      try {
        const result = await changePassword(values);
        if (result.success) {
          toast({ title: "Success", description: "Your password has been changed. You will be logged out." });
          form.reset();
          await authLogout(); // Use logout from context which handles redirect
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: result.error,
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred.",
        });
      }
    });
  };

  const handleLogout = async () => {
    await authLogout();
  };
  
  const handleUpdateProfile = async (values: { name: string; avatarUrl: string }) => {
    startTransition(async () => {
      const result = await updateUser(values);
       if (result.success) {
        toast({ title: "Success", description: "Profile updated successfully." });
        setIsEditSheetOpen(false);
      } else {
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: result.error || "An unexpected error occurred.",
        });
      }
    });
  };

  return (
    <div className="flex-1 p-2 sm:p-4 md:p-6">
      <Header title="Settings" />
      <div className="mt-4 md:mt-6 grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your personal information.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                 <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <div className="text-xl font-semibold">{user.name}</div>
                <div className="text-sm text-muted-foreground">{user.email}</div>
                 <div className="text-sm text-muted-foreground">Username: {user.username}</div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => setIsEditSheetOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your login password. After changing, you will be logged out.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

         <Card>
          <CardHeader>
            <CardTitle>Sign Out</CardTitle>
            <CardDescription>Sign out of your account on this device.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
      <EditProfileSheet 
        isOpen={isEditSheetOpen}
        setIsOpen={setIsEditSheetOpen}
        user={user}
        onUpdateProfile={handleUpdateProfile}
        isPending={isPending}
      />
    </div>
  );
}
