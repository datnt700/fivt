/**
 * Financial Profile Components
 * Reusable components for displaying financial profile information
 */

'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useProfile, useProfileStatus } from '@/contexts/financial-profile-context';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Target, PiggyBank, Calendar } from 'lucide-react';

/**
 * Simple profile status indicator for nav/header
 */
export function ProfileStatusIndicator() {
  const { hasProfile, isProfileOutdated, isLoading } = useProfileStatus();
  const profile = useProfile();
  const t = useTranslations('financialProfile.widgets');

  if (isLoading) {
    return <Badge variant="secondary">{t('loading')}</Badge>;
  }

  if (!hasProfile) {
    return <Badge variant="destructive">{t('noProfile')}</Badge>;
  }

  if (isProfileOutdated) {
    return <Badge variant="outline">{t('profileOutdated')}</Badge>;
  }

  return (
    <Badge variant="default">
      {profile?.stage} • {profile?.category}
    </Badge>
  );
}

/**
 * Quick metrics display
 */
export function QuickMetrics() {
  const profile = useProfile();
  const t = useTranslations('financialProfile.results');

  if (!profile) {
    return null;
  }

  const { metrics } = profile;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm font-medium">{t('savingsRate')}</p>
              <p className="text-lg font-bold text-green-600">
                {(metrics.savingsRate * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-sm font-medium">{t('progressToFI')}</p>
              <p className="text-lg font-bold text-blue-600">
                {(metrics.progressToFI * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <PiggyBank className="h-4 w-4 text-purple-600" />
            <div>
              <p className="text-sm font-medium">{t('fiNumber')}</p>
              <p className="text-lg font-bold text-purple-600">
                €{metrics.fiNumber.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-orange-600" />
            <div>
              <p className="text-sm font-medium">{t('yearsToFI')}</p>
              <p className="text-lg font-bold text-orange-600">
                {metrics.yearsToFI.toFixed(1)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Profile overview card
 */
export function ProfileOverviewCard() {
  const profile = useProfile();

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No financial profile available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Stage</span>
          <Badge variant="default">{profile.stage}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span>Category</span>
          <Badge variant="outline">{profile.category}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span>Age</span>
          <span>{profile.age} years</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Net Worth</span>
          <span className="font-medium">€{profile.netWorth.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Last Updated</span>
          <span className="text-sm text-muted-foreground">
            {new Date(profile.lastUpdated).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Progress bar component
 */
export function FIProgressBar() {
  const profile = useProfile();

  if (!profile) {
    return null;
  }

  const progressPercentage = Math.min(profile.metrics.progressToFI * 100, 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Independence Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{progressPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>€0</span>
            <span>€{profile.metrics.fiNumber.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}