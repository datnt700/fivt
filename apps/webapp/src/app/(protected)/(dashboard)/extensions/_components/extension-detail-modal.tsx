'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Download, Trash2, Loader2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Service } from '@/hooks/use-subscriptions';

interface ExtensionDetailModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onInstall?: (serviceId: string) => void;
  onUninstall?: (serviceId: string) => void;
  isInstalled?: boolean;
  isInstalling?: boolean;
  isUninstalling?: boolean;
}

export function ExtensionDetailModal({
  service,
  isOpen,
  onClose,
  onInstall,
  onUninstall,
  isInstalled = false,
  isInstalling = false,
  isUninstalling = false,
}: ExtensionDetailModalProps) {
  const t = useTranslations('extensions');

  if (!service) return null;

  const getServiceIcon = (serviceType: string) => {
    const icons = {
      DASHBOARD: '📊',
      BUDGET_TRACKING: '💰',
      TRANSACTION_MANAGEMENT: '💳',
      BANKING_INTEGRATION: '🏦',
      AI_CHATBOT: '🤖',
    };
    return icons[serviceType as keyof typeof icons] || '⚙️';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{getServiceIcon(service.type)}</span>
              <div>
                <DialogTitle className="text-2xl">{service.name}</DialogTitle>
                <DialogDescription className="text-lg mt-1">
                  {service.description}
                </DialogDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Pricing */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <div className="text-3xl font-bold">${service.price}</div>
              <div className="text-sm text-muted-foreground">
                {t('subscription.month')}
              </div>
            </div>
            {isInstalled ? (
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                {t('status.installed')}
              </Badge>
            ) : (
              <Badge variant="outline">{t('status.available')}</Badge>
            )}
          </div>

          <Separator />

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('features.included')}</h3>
            <div className="grid gap-3">
              {service.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3">
            {isInstalled ? (
              <Button
                variant="destructive"
                onClick={() => onUninstall?.(service.id)}
                disabled={isUninstalling}
                className="flex-1"
              >
                {isUninstalling ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                {isUninstalling ? 'Uninstalling...' : t('actions.uninstall')}
              </Button>
            ) : (
              <Button
                onClick={() => onInstall?.(service.id)}
                disabled={isInstalling}
                className="flex-1"
              >
                {isInstalling ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isInstalling ? 'Installing...' : t('actions.install')}
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              {t('actions.close')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
