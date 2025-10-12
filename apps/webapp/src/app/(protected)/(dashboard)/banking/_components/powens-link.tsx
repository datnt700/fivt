'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import type { PowensLinkProps } from '../_types';

export function PowensLink({ onSuccess, onError }: PowensLinkProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const t = useTranslations('banking');

  // Cleanup message listener on unmount  
  useEffect(() => {
    return () => {
      // Cleanup is handled in the handleConnect function
    };
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);

    try {
      // Get platform info to help optimize Powens connection experience
      const { isPlatformMobile, getPowensWebviewRecommendations } = await import('../_utils/platform-utils');
      const platformInfo = getPowensWebviewRecommendations();
      
      console.log('Powens connection - Platform:', platformInfo);

      // Create Powens connect session
      const response = await fetch('/api/powens/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': navigator.userAgent, // Help Powens optimize for device
        },
        body: JSON.stringify({
          platform: platformInfo.platform,
          isMobile: isPlatformMobile(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create Powens connection');
      }

      const data = await response.json();
      
      // Use platform-specific webview opening for optimal app-to-app support
      // This helps enable QR code and desktop login options for compte courant
      const { openPowensWebview } = await import('../_utils/platform-utils');
      
      // Set up popup message listener for callback handling
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data?.type === 'POWENS_SUCCESS') {
          console.log('Powens connection successful:', event.data);
          toast.success(t('connection.success'));
          onSuccess?.(event.data);
          window.removeEventListener('message', handleMessage);
        } else if (event.data?.type === 'POWENS_ERROR') {
          console.error('Powens connection error:', event.data);
          toast.error(t('connection.error', { error: event.data.error }));
          onError?.(event.data.error);
          window.removeEventListener('message', handleMessage);
        }
      };
      
      window.addEventListener('message', handleMessage);
      openPowensWebview(data.connect_url);

    } catch (error) {
      console.error('Error connecting to Powens:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(t('connection.error', { error: errorMessage }));
      onError?.(errorMessage);
      setIsConnecting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          {t('providers.powens.title')}
        </CardTitle>
        <CardDescription>
          {t('providers.powens.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleConnect}
          disabled={isConnecting}
          className="w-full"
          size="lg"
        >
          {isConnecting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {t('connection.connecting')}
            </>
          ) : (
            t('connection.connect', { provider: 'Powens' })
          )}
        </Button>
        
        <div className="mt-4 text-sm text-gray-600 space-y-2">
          <p>✓ {t('features.secure_connection')}</p>
          <p>✓ {t('features.real_time_data')}</p>
          <p>✓ {t('features.european_banks')}</p>
        </div>
      </CardContent>
    </Card>
  );
}