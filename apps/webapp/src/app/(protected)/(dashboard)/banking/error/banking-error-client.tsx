'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, RefreshCw, Shield, Wifi } from 'lucide-react';
import Link from 'next/link';

type ErrorType = 
  | 'access_denied'
  | 'connection_error' 
  | 'ssl_error'
  | 'callback_failed'
  | 'invalid_callback'
  | 'user_not_found'
  | 'fetch_failed'
  | 'popup_blocked';

export function BankingErrorClient() {
  const t = useTranslations('banking');
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const error = searchParams.get('error') as ErrorType;
  const errorDescription = searchParams.get('error_description');

  const getErrorInfo = (errorType: ErrorType | null) => {
    switch (errorType) {
      case 'access_denied':
        return {
          title: t('errors.access_denied.title'),
          description: t('errors.access_denied.description'),
          icon: AlertCircle,
          color: 'text-orange-500',
          suggestion: t('errors.access_denied.suggestion'),
          canRetry: true,
        };
      case 'connection_error':
      case 'ssl_error':
        return {
          title: t('errors.ssl_error.title'),
          description: t('errors.ssl_error.description'),
          icon: Wifi,
          color: 'text-red-500',
          suggestion: t('errors.ssl_error.suggestion'),
          canRetry: true,
        };
      case 'callback_failed':
      case 'invalid_callback':
        return {
          title: t('errors.callback_failed.title'),
          description: t('errors.callback_failed.description'),
          icon: AlertCircle,
          color: 'text-red-500',
          suggestion: t('errors.callback_failed.suggestion'),
          canRetry: true,
        };
      case 'user_not_found':
        return {
          title: t('errors.user_not_found.title'),
          description: t('errors.user_not_found.description'),
          icon: AlertCircle,
          color: 'text-yellow-500',
          suggestion: t('errors.user_not_found.suggestion'),
          canRetry: true,
        };
      case 'fetch_failed':
        return {
          title: t('errors.fetch_failed.title'),
          description: t('errors.fetch_failed.description'),
          icon: RefreshCw,
          color: 'text-red-500',
          suggestion: t('errors.fetch_failed.suggestion'),
          canRetry: true,
        };
      case 'popup_blocked':
        return {
          title: t('errors.popup_blocked.title'),
          description: t('errors.popup_blocked.description'),
          icon: Shield,
          color: 'text-yellow-500',
          suggestion: t('errors.popup_blocked.suggestion'),
          canRetry: true,
        };
      default:
        return {
          title: t('errors.unknown.title'),
          description: t('errors.unknown.description'),
          icon: AlertCircle,
          color: 'text-gray-500',
          suggestion: t('errors.unknown.suggestion'),
          canRetry: true,
        };
    }
  };

  const errorInfo = getErrorInfo(error);
  const Icon = errorInfo.icon;

  const handleRetry = () => {
    router.push('/banking');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/banking" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('errors.back_to_banking')}
          </Link>
          <h1 className="text-3xl font-bold mb-2">{t('errors.page_title')}</h1>
          <p className="text-muted-foreground">{t('errors.page_description')}</p>
        </div>

        {/* Error Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Icon className={`h-6 w-6 ${errorInfo.color}`} />
              {errorInfo.title}
            </CardTitle>
            <CardDescription>{errorInfo.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {errorDescription && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">{t('errors.technical_details')}</p>
                <p className="text-sm text-muted-foreground">{errorDescription}</p>
              </div>
            )}
            
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                {t('errors.what_to_do')}
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {errorInfo.suggestion}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Common Solutions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('errors.common_solutions.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium">{t('errors.common_solutions.allow_popups.title')}</p>
                  <p className="text-sm text-muted-foreground">{t('errors.common_solutions.allow_popups.description')}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium">{t('errors.common_solutions.check_connection.title')}</p>
                  <p className="text-sm text-muted-foreground">{t('errors.common_solutions.check_connection.description')}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium">{t('errors.common_solutions.try_different_browser.title')}</p>
                  <p className="text-sm text-muted-foreground">{t('errors.common_solutions.try_different_browser.description')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {errorInfo.canRetry && (
            <Button onClick={handleRetry} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              {t('errors.try_again')}
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href="/banking">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('errors.back_to_banking')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}