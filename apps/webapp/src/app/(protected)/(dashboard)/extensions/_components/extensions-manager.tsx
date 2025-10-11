'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
  ExtensionOperationsProvider,
  useExtensionOperations,
} from '../_contexts/extension-operations-context';
import { ExtensionSkeleton } from '@/components/ui/extension-skeleton';
import {
  CheckCircle,
  Zap,
  Star,
  Download,
  Trash2,
  Loader2,
} from 'lucide-react';
import {
  useUserSubscriptions,
  useServices,
  useSubscribeToService,
  useUnsubscribeFromService,
} from '../_hooks/use-extensions';
import type { ServiceType } from '@/hooks/use-subscriptions';
import { useTranslations } from 'next-intl';

import { toast } from 'sonner';

function ExtensionsManagerContent() {
  const router = useRouter();
  const t = useTranslations('extensions');
  const [activeTab, setActiveTab] = useState('installed');

  const {
    isUninstalling,
    isInstalling,
    setUninstallingServiceId,
    setInstallingServiceId,
  } = useExtensionOperations();

  const { data: subscriptions, isLoading: subsLoading } =
    useUserSubscriptions();
  const { data: services, isLoading: servicesLoading } = useServices();

  const subscribeToService = useSubscribeToService();
  const unsubscribeFromService = useUnsubscribeFromService();

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

  if (subsLoading || servicesLoading) {
    return <ExtensionSkeleton count={3} />;
  }

  const activeSubscriptions =
    subscriptions?.filter(sub => sub.status === 'ACTIVE') || [];
  const availableServices =
    services?.filter(
      service =>
        !subscriptions?.some(
          sub => sub.serviceId === service.id && sub.status === 'ACTIVE'
        )
    ) || [];

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('stats.installed')}
            </CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeSubscriptions.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('stats.installedDescription')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('stats.available')}
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableServices.length}</div>
            <p className="text-xs text-muted-foreground">
              {t('stats.availableDescription')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('stats.activeServices')}
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeSubscriptions.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('stats.activeServicesDescription')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="installed">{t('tabs.installed')}</TabsTrigger>
          <TabsTrigger value="discover">{t('tabs.discover')}</TabsTrigger>
        </TabsList>

        <TabsContent value="installed" className="space-y-4">
          {activeSubscriptions.length > 0 ? (
            <div className="max-h-[600px] overflow-y-auto pr-2">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-6">
                {activeSubscriptions.map(subscription => (
                  <Card
                    key={subscription.id}
                    className="group hover:shadow-lg transition-all cursor-pointer h-64 flex flex-col"
                  >
                    <div
                      className="flex-1 flex flex-col"
                      onClick={() => {
                        router.push(`/extensions/${subscription.service.id}`);
                      }}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start gap-3">
                          <span className="text-4xl">
                            {getServiceIcon(subscription.service.type)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base truncate">
                              {subscription.service.name}
                            </CardTitle>
                            <CardDescription className="text-xs line-clamp-2 mt-1">
                              {subscription.service.description}
                            </CardDescription>
                          </div>
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800 text-xs shrink-0"
                          >
                            {t('status.active')}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col justify-between pt-0">
                        {/* Features removed for now */}
                      </CardContent>
                    </div>
                    <div className="p-4 pt-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={e => {
                          e.stopPropagation();
                          console.log(
                            'Uninstalling service:',
                            subscription.serviceId,
                            subscription.service.name
                          );
                          setUninstallingServiceId(subscription.serviceId);
                          unsubscribeFromService.mutate(
                            subscription.serviceId,
                            {
                              onSuccess: data => {
                                console.log(
                                  'Service uninstalled successfully:',
                                  data
                                );
                                setUninstallingServiceId(null);
                                toast.success(
                                  t('notifications.uninstallSuccess', {
                                    name: subscription.service.name,
                                  })
                                );
                              },
                              onError: error => {
                                console.error(
                                  'Failed to uninstall service:',
                                  error
                                );
                                setUninstallingServiceId(null);
                                toast.error(
                                  t('notifications.uninstallError', {
                                    name: subscription.service.name,
                                  })
                                );
                              },
                            }
                          );
                        }}
                        disabled={
                          unsubscribeFromService.isPending ||
                          isUninstalling(subscription.serviceId)
                        }
                      >
                        {isUninstalling(subscription.serviceId) ? (
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
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="space-y-3">
                  <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <Download className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">
                    {t('empty.installed.title')}
                  </h3>
                  <p className="text-muted-foreground">
                    {t('empty.installed.description')}
                  </p>
                  <Button onClick={() => setActiveTab('discover')}>
                    {t('empty.installed.action')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="discover" className="space-y-4">
          {availableServices.length > 0 ? (
            <div className="max-h-[600px] overflow-y-auto pr-2">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-6">
                {availableServices.map(service => (
                  <Card
                    key={service.id}
                    className="group hover:shadow-lg transition-all cursor-pointer h-64 flex flex-col"
                  >
                    <div
                      className="flex-1 flex flex-col"
                      onClick={() => {
                        router.push(`/extensions/${service.id}`);
                      }}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start gap-3">
                          <span className="text-4xl">
                            {getServiceIcon(service.type)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base truncate">
                              {service.name}
                            </CardTitle>
                            <CardDescription className="text-xs line-clamp-2 mt-1">
                              {service.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col justify-between pt-0">
                        {/* Features removed for now */}
                      </CardContent>
                    </div>
                    <div className="p-4 pt-0">
                      <Button
                        size="sm"
                        className="w-full"
                        disabled={
                          subscribeToService.isPending ||
                          isInstalling(service.id)
                        }
                        onClick={e => {
                          e.stopPropagation();
                          console.log(
                            'Installing service:',
                            service.id,
                            service.name
                          );
                          setInstallingServiceId(service.id);
                          subscribeToService.mutate(
                            { serviceId: service.id },
                            {
                              onSuccess: data => {
                                console.log(
                                  'Service installed successfully:',
                                  data
                                );
                                toast.success(
                                  t('notifications.installSuccess', {
                                    name: service.name,
                                  })
                                );
                                setInstallingServiceId(null);
                                setActiveTab('installed');
                              },
                              onError: error => {
                                console.error(
                                  'Failed to install service:',
                                  error
                                );
                                toast.error(
                                  t('notifications.installError', {
                                    name: service.name,
                                  })
                                );
                                setInstallingServiceId(null);
                              },
                            }
                          );
                        }}
                      >
                        {isInstalling(service.id) ? (
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
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="space-y-3">
                  <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="text-lg font-medium">
                    {t('empty.discover.title')}
                  </h3>
                  <p className="text-muted-foreground">
                    {t('empty.discover.description')}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function ExtensionsManager() {
  return (
    <ExtensionOperationsProvider>
      <ExtensionsManagerContent />
    </ExtensionOperationsProvider>
  );
}
