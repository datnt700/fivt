'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { BowensLink } from '@/app/components/bowens-link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, CreditCard, TrendingUp, AlertCircle } from 'lucide-react';

export default function BowensBankingClient() {
  const t = useTranslations('banking');
  const searchParams = useSearchParams();
  
  const success = searchParams.get('success');
  const error = searchParams.get('error');

  const handleConnectionSuccess = (data: any) => {
    console.log('Bowens connection successful:', data);
    // Refresh the page or update state to show connected accounts
    window.location.reload();
  };

  const handleConnectionError = (error: string) => {
    console.error('Bowens connection failed:', error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t('title')} - Bowens
          </h1>
          <p className="text-lg text-gray-600">
            {t('subtitle_bowens')}
          </p>
        </div>

        {/* Status Messages */}
        {success && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-green-800">
                <Shield className="h-5 w-5" />
                <span>{t('connection.success', { provider: 'Bowens' })}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <span>{t('connection.error', { error: decodeURIComponent(error) })}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Connection Card */}
          <div className="space-y-6">
            <BowensLink 
              onSuccess={handleConnectionSuccess}
              onError={handleConnectionError}
            />
          </div>

          {/* Information Cards */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  {t('security.title')}
                </CardTitle>
                <CardDescription>
                  {t('security.description_bowens')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✓ {t('security.encryption')}</li>
                  <li>✓ {t('security.no_storage')}</li>
                  <li>✓ {t('security.compliance')}</li>
                  <li>✓ {t('security.audit')}</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  {t('features.title')}
                </CardTitle>
                <CardDescription>
                  {t('features.description_bowens')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✓ {t('features.account_balance')}</li>
                  <li>✓ {t('features.transaction_history')}</li>
                  <li>✓ {t('features.categorization')}</li>
                  <li>✓ {t('features.real_time_sync')}</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  {t('benefits.title')}
                </CardTitle>
                <CardDescription>
                  {t('benefits.description_bowens')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✓ {t('benefits.financial_overview')}</li>
                  <li>✓ {t('benefits.expense_tracking')}</li>
                  <li>✓ {t('benefits.budgeting')}</li>
                  <li>✓ {t('benefits.insights')}</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>{t('footer.powered_by')} Bowens • {t('footer.secure')} • {t('footer.compliant')}</p>
        </div>
      </div>
    </div>
  );
}