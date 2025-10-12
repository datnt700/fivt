/**
 * Profile Completion Banner
 * Shows a banner prompting users to complete their financial profile
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useProfileStatus } from '@/contexts/financial-profile-context';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, User, TrendingUp, Target, ArrowRight } from 'lucide-react';
import { FLAT_ROUTES } from '@/config/routes';

interface ProfileCompletionBannerProps {
  className?: string;
  variant?: 'banner' | 'card' | 'minimal';
  showDismiss?: boolean;
}

export function ProfileCompletionBanner({ 
  className = '', 
  variant = 'banner',
  showDismiss = true 
}: ProfileCompletionBannerProps) {
  const router = useRouter();
  const { hasProfile, needsProfile, isLoading } = useProfileStatus();
  const [isDismissed, setIsDismissed] = useState(false);
  const t = useTranslations('financialProfile.completion');

  // Don't show if loading, has profile, or dismissed
  if (isLoading || hasProfile || isDismissed) {
    return null;
  }

  // Don't show if profile is not needed
  if (!needsProfile) {
    return null;
  }

  const handleSetupProfile = () => {
    router.push(FLAT_ROUTES.PROFILE_SETUP);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge variant="outline" className="flex items-center gap-1">
          <User className="h-3 w-3" />
          {t('profileIncomplete')}
        </Badge>
        <Button 
          size="sm" 
          variant="link" 
          onClick={handleSetupProfile}
          className="h-auto p-0 text-sm"
        >
          {t('completeSetup')}
        </Button>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">{t('title')}</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                {t('description')}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>{t('trackSavings')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  <span>{t('monitorProgress')}</span>
                </div>
              </div>
              <Button onClick={handleSetupProfile} className="flex items-center gap-2">
                {t('getStarted')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            {showDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default banner variant
  return (
    <Alert className={`border-blue-200 bg-blue-50 ${className}`}>
      <User className="h-4 w-4 text-blue-600" />
      <div className="flex items-center justify-between w-full">
        <div className="flex-1">
          <AlertDescription className="text-blue-800">
            <strong>Complete your financial profile</strong> to unlock personalized insights and track your progress towards financial independence.
          </AlertDescription>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button 
            size="sm" 
            onClick={handleSetupProfile}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {t('setupProfile')}
          </Button>
          {showDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
}

/**
 * Profile Completion Check Hook
 * Provides profile completion status and utilities
 */
export function useProfileCompletion() {
  const { hasProfile, needsProfile, isLoading } = useProfileStatus();
  
  return {
    isComplete: hasProfile,
    needsCompletion: needsProfile,
    isLoading,
    completionPercentage: hasProfile ? 100 : 0,
    canShowBanner: !isLoading && needsProfile
  };
}

/**
 * Profile Completion Guard
 * Wrapper component that shows completion banner if profile is incomplete
 */
interface ProfileCompletionGuardProps {
  children: React.ReactNode;
  showBanner?: boolean;
  bannerVariant?: 'banner' | 'card' | 'minimal';
  className?: string;
}

export function ProfileCompletionGuard({ 
  children, 
  showBanner = true,
  bannerVariant = 'banner',
  className = ''
}: ProfileCompletionGuardProps) {
  const { canShowBanner } = useProfileCompletion();

  return (
    <div className={className}>
      {showBanner && canShowBanner && (
        <div className="mb-6">
          <ProfileCompletionBanner variant={bannerVariant} />
        </div>
      )}
      {children}
    </div>
  );
}