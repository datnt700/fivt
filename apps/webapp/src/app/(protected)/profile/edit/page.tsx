'use client';
import { updateUserProfile } from '@/actions/user/profile';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import React, { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required'),
});

type FormData = z.infer<typeof formSchema>;

function ProfileEditPage({
  defaultName,
  defaultEmail,
}: {
  defaultName: string;
  defaultEmail?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const tCommon = useTranslations('common');
  const tAuth = useTranslations('auth');
  const tUser = useTranslations('userProfile');
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultName || '',
      email: defaultEmail || '',
    },
  });

  const handleSubmit = (data: FormData) => {
    startTransition(async () => {
      const toastId = toast.loading('Updating settings...');
      try {
        await updateUserProfile(data);
        toast.success('Settings updated', { id: toastId });
      } catch {
        toast.error('Failed to update settings', { id: toastId });
      }
    });
  };
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/avatar.png" alt={defaultName} />
              <AvatarFallback>{(defaultName || 'U').charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-semibold">
                {defaultName || 'User'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {tUser('underName')}
              </p>
            </div>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>{tUser('account')}</CardTitle>
            <CardDescription>{tUser('description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 items-start">
                  {/* Name Field */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{tAuth('nameLabel')}</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email Field (visible but read-only) */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{tAuth('emailLabel')}</FormLabel>
                        <div className="flex items-center gap-2">
                          <FormControl className="flex-1">
                            <Input
                              placeholder="you@domain.com"
                              {...field}
                              readOnly
                              disabled
                            />
                          </FormControl>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {tUser('canChange')}
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isPending}>
                    {isPending ? (
                      <svg
                        className="mr-2 h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                      </svg>
                    ) : null}
                    {tCommon('save')}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ProfileEditPage;
