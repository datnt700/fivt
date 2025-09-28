'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { toast } from 'sonner';
import { Mail, Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';

export function MagicLinkSignIn() {
  const t = useTranslations('auth');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error(t('invalidEmail'));
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(t('invalidEmail'));
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn('resend', {
        email,
        redirect: false,
      });

      if (result?.error) {
        toast.error(t('signInError'));
      } else {
        setIsEmailSent(true);
        toast.success(t('signInSuccess'));
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error(t('signInError'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Mail className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle>{t('checkEmail')}</CardTitle>
          <CardDescription>
            {t('checkEmailDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <Button
            variant="outline"
            onClick={() => {
              setIsEmailSent(false);
              setEmail('');
            }}
            className="w-full"
          >
            Try a different email
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto mb-6">
      <div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('emailLabel')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('signingIn')}
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                {t('signInButton')}
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
