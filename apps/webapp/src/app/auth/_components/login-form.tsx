'use client';

import { MagicLinkSignIn } from './magic-link-signin';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/theme';
import { signInWithGoogle } from '@/lib/auth-actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function LoginForm(props: React.ComponentProps<'div'>) {
  const t = useTranslations('auth');
  
  const handleGoogleSignIn = () => {
    signInWithGoogle();
  };
  
  return (
    <div className="flex flex-col gap-6" {...props}>
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1" />
            <LanguageSwitcher />
          </div>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <MagicLinkSignIn />
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <Button variant="outline" onClick={handleGoogleSignIn} className="w-full">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 mr-2">
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                Login with Google
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="text-center text-xs leading-6">
        By clicking continue, you agree to our <a href="#" className="underline underline-offset-4">Terms of Service</a> and{' '}
        <a href="#" className="underline underline-offset-4">Privacy Policy</a>.
      </div>
    </div>
  );
}
