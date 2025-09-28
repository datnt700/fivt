'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { Banknote, Shield, AlertCircle } from 'lucide-react';
import { PowensLink } from '@/components/powens-link';

export function BankingPageClient() {
  const t = useTranslations('banking');

  const handlePowensSuccess = (data: { webviewUrl: string; userId: string }) => {
    console.log('Powens connection successful:', data);
    // You could refresh the page or update state to show connected accounts
    // window.location.reload();
  };

  const handlePowensError = (error: string) => {
    console.error('Powens connection failed:', error);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle_powens')}</p>
        </div>

        {/* Security Notice */}
        <Card className="mb-6 border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Shield className="h-5 w-5 text-blue-500 mr-2" />
            <CardTitle className="text-lg">{t('security.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">{t('securityNote')}</p>
            <p className="text-xs text-muted-foreground italic">{t('security.description_powens')}</p>
          </CardContent>
        </Card>

        {/* Connect Bank Account Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Banknote className="h-5 w-5 mr-2" />
              {t('connectBank')}
            </CardTitle>
            <CardDescription>{t('connectDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <PowensLink 
              onSuccess={handlePowensSuccess}
              onError={handlePowensError}
            />
          </CardContent>
        </Card>

        {/* Connected Accounts Section */}
        <Card>
          <CardHeader>
            <CardTitle>{t('connectedAccounts')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">{t('noAccountsConnected')}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('connectFirstAccount')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}