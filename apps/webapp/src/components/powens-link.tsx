'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface PowensConnectionData {
  webviewUrl: string;
  userId: string;
}

interface PowensLinkProps {
  onSuccess?: (data: PowensConnectionData) => void;
  onError?: (error: string) => void;
}

export function PowensLink({ onSuccess, onError }: PowensLinkProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const t = useTranslations('banking');

  const handleConnect = async () => {
    setIsConnecting(true);

    try {
      // Create Powens connect session
      const response = await fetch('/api/powens/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create Powens connection');
      }

      const data = await response.json();
      
      // Open popup window for Powens connect
      const popup = window.open(
        data.connect_url,
        'powens-connect',
        'width=500,height=700,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error(t('connection.popup_blocked'));
      }

      // Listen for popup messages
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'POWENS_SUCCESS') {
          console.log('Powens connection successful');
          toast.success(t('connection.success', { provider: 'Powens' }));
          onSuccess?.(event.data);
          window.removeEventListener('message', handleMessage);
          setIsConnecting(false);
        } else if (event.data.type === 'POWENS_ERROR') {
          console.error('Powens connection error:', event.data.error);
          toast.error(t('connection.error', { error: event.data.error }));
          onError?.(event.data.error);
          window.removeEventListener('message', handleMessage);
          setIsConnecting(false);
        }
      };

      window.addEventListener('message', handleMessage);

      // Check if popup is closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          setIsConnecting(false);
          toast.info(t('connection.cancelled'));
        }
      }, 1000);

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