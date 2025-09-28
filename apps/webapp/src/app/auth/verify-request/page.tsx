import { Metadata } from 'next';
import { Mail } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { redirect } from 'next/navigation';
import { useTranslations } from 'next-intl';

export const metadata: Metadata = {
  title: 'Check Your Email - Director Club',
  description: "We've sent you a magic link to sign in to Director Club",
};

export default function VerifyRequestPage() {
  const t = useTranslations('auth');
  redirect(`/auth/verify-request`);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Mail className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle>{t('checkEmail')}</CardTitle>
          <CardDescription>{t('checkEmailDescription')} </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-gray-600">{t('hint')}</p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>• {t('bullets.expire', { hours: 24 })}</p>
            <p>• {t('bullets.spam')}</p>
            <p>• {t('bullets.checkEmail')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
