'use client';

import { useServiceAccess, ServiceType } from '@/hooks/use-subscriptions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Zap } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface ServiceGuardProps {
  serviceType: ServiceType;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component that guards access to features based on user's service subscriptions
 */
export function ServiceGuard({
  serviceType,
  children,
  fallback,
}: ServiceGuardProps) {
  const { hasAccess } = useServiceAccess(serviceType);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return <ServiceAccessDenied serviceType={serviceType} />;
}

/**
 * Default fallback component when access is denied
 */
function ServiceAccessDenied({ serviceType }: { serviceType: ServiceType }) {
  const t = useTranslations('extensions');

  const serviceInfo = {
    DASHBOARD: {
      name: t('services.dashboard.name'),
      description: t('services.dashboard.description'),
      icon: '📊',
    },
    BUDGET_TRACKING: {
      name: t('services.budget.name'),
      description: t('services.budget.description'),
      icon: '💰',
    },
    TRANSACTION_MANAGEMENT: {
      name: t('services.transactions.name'),
      description: t('services.transactions.description'),
      icon: '💳',
    },
    BANKING_INTEGRATION: {
      name: t('services.banking.name'),
      description: t('services.banking.description'),
      icon: '🏦',
    },
    AI_CHATBOT: {
      name: t('services.chatbot.name'),
      description: t('services.chatbot.description'),
      icon: '🤖',
    },
  };

  const service = serviceInfo[serviceType];

  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
            <Lock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle className="text-xl">{t('accessDenied.title')}</CardTitle>
          <CardDescription>
            {t('accessDenied.description', { service: service.name })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{service.icon}</span>
              <div className="text-left">
                <h3 className="font-medium">{service.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {service.description}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/pricing">
                <Zap className="mr-2 h-4 w-4" />
                {t('accessDenied.upgrade')}
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/dashboard">{t('accessDenied.backToDashboard')}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Hook to conditionally render content based on service access
 */
export function useConditionalService(serviceType: ServiceType) {
  const { hasAccess } = useServiceAccess(serviceType);

  return {
    hasAccess,
    renderIf: (content: React.ReactNode, fallback?: React.ReactNode) =>
      hasAccess
        ? content
        : fallback || <ServiceAccessDenied serviceType={serviceType} />,
  };
}

/**
 * Higher-order component for service-protected pages
 */
export function withServiceProtection(serviceType: ServiceType) {
  return function ServiceProtectedComponent<T extends Record<string, unknown>>(
    Component: React.ComponentType<T>
  ) {
    return function ProtectedComponent(props: T) {
      return (
        <ServiceGuard serviceType={serviceType}>
          <Component {...props} />
        </ServiceGuard>
      );
    };
  };
}
