'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { Loader2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import type { BridgeLinkProps } from '../_types';

export function BridgeLink({ onSuccess }: BridgeLinkProps) {
  const [loading, setLoading] = useState(false);
  const t = useTranslations('banking');

  // Handle Bridge connection
  const handleConnect = useCallback(async () => {
    setLoading(true);
    try {
      // Create Bridge connection request
      const response = await fetch('/api/bridge/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to connect to Bridge');
      }

      const data = await response.json();
      
      if (data.redirect_url) {
        // Open Bridge connection flow in new window
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        
        // Add session_id and user_uuid to the callback URL
        const callbackUrl = new URL(`${window.location.origin}/api/bridge/callback`);
        callbackUrl.searchParams.set('session_id', data.session_id);
        callbackUrl.searchParams.set('user_uuid', data.user_uuid);
        
        // Append callback params to redirect URL if Bridge supports it
        const redirectUrl = new URL(data.redirect_url);
        redirectUrl.searchParams.set('callback_url', callbackUrl.toString());
        
        const popup = window.open(
          redirectUrl.toString(),
          'bridge-connect',
          `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
        );

        // Listen for completion message
        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'BRIDGE_SUCCESS') {
            popup?.close();
            toast.success(t('success'));
            
            if (onSuccess) {
              onSuccess(event.data.data);
            }
            
            // Refresh the page to show connected accounts
            window.location.reload();
          } else if (event.data.type === 'BRIDGE_ERROR') {
            popup?.close();
            toast.error(t('error'));
          }
          
          window.removeEventListener('message', handleMessage);
        };

        window.addEventListener('message', handleMessage);

        // Check if popup was closed manually
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', handleMessage);
            setLoading(false);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Error connecting to Bridge:', error);
      
      // Check if it's a configuration error
      if (error instanceof Error && error.message.includes('not configured')) {
        toast.error('Bridge API not configured. Please contact support.');
      } else {
        toast.error(t('error'));
      }
      setLoading(false);
    }
  }, [t, onSuccess]);

  return (
    <div className="space-y-4">
      <Button
        onClick={handleConnect}
        disabled={loading}
        className="w-full sm:w-auto"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('loading')}
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            {t('connectBank')}
          </>
        )}
      </Button>
      
      <p className="text-sm text-muted-foreground">
        Powered by Bridge API - Optimized for European banks, especially France.
      </p>
    </div>
  );
}