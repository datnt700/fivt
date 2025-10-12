/**
 * Financial Profile Setup Page
 * Dedicated page for users to input/update their financial information
 */

import { Suspense } from 'react';
import { FinancialProfileForm } from './_components/financial-profile-form';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileSetupPage() {
  return (
    <Suspense fallback={<ProfileSetupSkeleton />}>
      <FinancialProfileForm />
    </Suspense>
  );
}

function ProfileSetupSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 px-4 md:px-0">
      <div className="md:border md:rounded-lg p-4 md:p-6">
        <Skeleton className="h-6 md:h-8 w-48 md:w-64 mb-2" />
        <Skeleton className="h-3 md:h-4 w-72 md:w-96 mb-6 md:mb-8" />
        
        {/* Income Section */}
        <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
          <Skeleton className="h-5 md:h-6 w-20 md:w-24" />
          <div className="grid md:grid-cols-2 gap-3 md:gap-4">
            <div className="space-y-2">
              <Skeleton className="h-3 md:h-4 w-28 md:w-32" />
              <Skeleton className="h-9 md:h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 md:h-4 w-28 md:w-32" />
              <Skeleton className="h-9 md:h-10 w-full" />
            </div>
          </div>
        </div>

        {/* Expenses Section */}
        <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
          <Skeleton className="h-5 md:h-6 w-28 md:w-32" />
          <Skeleton className="h-9 md:h-10 w-full" />
        </div>

        {/* Investments Section */}
        <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
          <Skeleton className="h-5 md:h-6 w-32 md:w-40" />
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-3 md:gap-4">
            <Skeleton className="h-9 md:h-10 w-full" />
            <Skeleton className="h-9 md:h-10 w-full" />
            <Skeleton className="h-9 md:h-10 w-full" />
          </div>
        </div>

        {/* Assets Section */}
        <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
          <Skeleton className="h-5 md:h-6 w-32 md:w-36" />
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-3 md:gap-4">
            <Skeleton className="h-9 md:h-10 w-full" />
            <Skeleton className="h-9 md:h-10 w-full" />
            <Skeleton className="h-9 md:h-10 w-full" />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-3 md:pt-4">
          <Skeleton className="h-9 md:h-10 w-full sm:w-32" />
          <Skeleton className="h-9 md:h-10 flex-1" />
        </div>
      </div>
    </div>
  );
}