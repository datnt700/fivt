'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Loader2, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  useServices,
  useUserSubscriptions,
  useSubscribeToService,
  useUnsubscribeFromService,
} from '../_hooks/use-extensions';
import { useExtensionOperations } from '../_contexts/extension-operations-context';
import type { ServiceType } from '@/hooks/use-subscriptions';

interface ExtensionDetailProps {
  extensionId: string;
}

export function ExtensionDetail({ extensionId }: ExtensionDetailProps) {
  const router = useRouter();
  const t = useTranslations('extensions');
  const [extension, setExtension] = useState<{
    id: string;
    name: string;
    description?: string;
    type: ServiceType;
    price: number;
    isActive: boolean;
  } | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  const { data: services, isLoading: servicesLoading } = useServices();
  const { data: subscriptions, isLoading: subsLoading } =
    useUserSubscriptions();
  const subscribeToService = useSubscribeToService();
  const unsubscribeFromService = useUnsubscribeFromService();

  const {
    isInstalling,
    isUninstalling,
    setInstallingServiceId,
    setUninstallingServiceId,
  } = useExtensionOperations();

  const getServiceIcon = (serviceType: ServiceType) => {
    const icons = {
      DASHBOARD: '📊',
      BUDGET_TRACKING: '💰',
      TRANSACTION_MANAGEMENT: '💳',
      BANKING_INTEGRATION: '🏦',
      AI_CHATBOT: '🤖',
    };
    return icons[serviceType] || '⚙️';
  };

  useEffect(() => {
    if (services && !servicesLoading) {
      const foundExtension = services.find(
        service => service.id === extensionId
      );
      if (foundExtension) {
        setExtension(foundExtension);
      }
    }
  }, [services, servicesLoading, extensionId]);

  useEffect(() => {
    if (subscriptions && extension && !subsLoading) {
      const subscription = subscriptions.find(
        sub => sub.serviceId === extension.id && sub.status === 'ACTIVE'
      );
      setIsInstalled(!!subscription);
    }
  }, [subscriptions, extension, subsLoading]);

  if (servicesLoading || subsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('back')}
          </Button>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!extension) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('back')}
          </Button>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">
              {t('errors.notFound')}
            </h2>
            <p className="text-muted-foreground">
              {t('errors.notFoundDescription')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleInstall = () => {
    console.log('Installing extension:', extension.id, extension.name);
    setInstallingServiceId(extension.id);
    subscribeToService.mutate(
      { serviceId: extension.id },
      {
        onSuccess: data => {
          console.log('Extension installed successfully:', data);
          toast.success(
            t('notifications.installSuccess', { name: extension.name })
          );
          setInstallingServiceId(null);
          setIsInstalled(true);
        },
        onError: error => {
          console.error('Failed to install extension:', error);
          toast.error(
            t('notifications.installError', { name: extension.name })
          );
          setInstallingServiceId(null);
        },
      }
    );
  };

  const handleUninstall = () => {
    console.log('Uninstalling extension:', extension.id, extension.name);
    setUninstallingServiceId(extension.id);
    unsubscribeFromService.mutate(extension.id, {
      onSuccess: data => {
        console.log('Extension uninstalled successfully:', data);
        toast.success(
          t('notifications.uninstallSuccess', { name: extension.name })
        );
        setUninstallingServiceId(null);
        setIsInstalled(false);
      },
      onError: error => {
        console.error('Failed to uninstall extension:', error);
        toast.error(
          t('notifications.uninstallError', { name: extension.name })
        );
        setUninstallingServiceId(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('back')}
          </Button>
        </div>
        <div className="flex items-center gap-3">
          {isInstalled && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {t('status.active')}
            </Badge>
          )}
        </div>
      </div>

      {/* Extension Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <span className="text-6xl">{getServiceIcon(extension.type)}</span>
            <div className="flex-1">
              <CardTitle className="text-3xl">{extension.name}</CardTitle>
              <p className="text-lg text-muted-foreground mt-2">
                {extension.description}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Features section removed for now */}

          {/* Actions */}
          <div className="flex justify-center">
            {isInstalled ? (
              <Button
                variant="outline"
                size="lg"
                onClick={handleUninstall}
                disabled={
                  unsubscribeFromService.isPending ||
                  isUninstalling(extension.id)
                }
              >
                {isUninstalling(extension.id) ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('actions.uninstalling')}
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('actions.uninstall')}
                  </>
                )}
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={handleInstall}
                disabled={
                  subscribeToService.isPending || isInstalling(extension.id)
                }
              >
                {isInstalling(extension.id) ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('actions.installing')}
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    {t('actions.install')}
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
