/**
 * Financial Profile Results Page
 * Shows user's calculated financial stage with animations
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// Progress component will be implemented inline
import { 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useFinancialProfile } from '@/contexts/financial-profile-context';
import { FLAT_ROUTES } from '@/config/routes';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number]
    }
  }
};

const cardHoverVariants = {
  hover: {
    scale: 1.02,
    transition: { duration: 0.2 }
  }
};

export default function ProfileResultsPage() {
  const router = useRouter();
  const { profile, isLoading } = useFinancialProfile();
  const t = useTranslations('financialProfile.results');
  const tStages = useTranslations('financialProfile.stages');
  const tCategories = useTranslations('financialProfile.categories');
  const tCommon = useTranslations('common');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"
          />
          <p>{tCommon('loading')}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="mb-4">No financial profile found.</p>
            <Button onClick={() => router.push(FLAT_ROUTES.PROFILE_SETUP)}>
              Create Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleContinueToDashboard = () => {
    router.push(FLAT_ROUTES.DASHBOARD);
  };

  const getStageColor = (stage: string) => {
    const colors = {
      'Survival': 'bg-red-500',
      'Stability': 'bg-yellow-500', 
      'Growth': 'bg-blue-500',
      'Freedom': 'bg-green-500',
      'Legacy': 'bg-purple-500'
    };
    return colors[stage as keyof typeof colors] || 'bg-gray-500';
  };

  const getStageIcon = (stage: string) => {
    const icons = {
      'Survival': '🔥',
      'Stability': '🛡️',
      'Growth': '📈',
      'Freedom': '🚀',
      'Legacy': '👑'
    };
    return icons[stage as keyof typeof icons] || '💰';
  };

  return (
    <motion.div
      className="w-full flex items-center justify-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="text-center space-y-6 md:space-y-8 w-full max-w-2xl px-4 md:px-0">
        {/* Header Section */}
        <motion.div variants={itemVariants}>
          <motion.div
            className="inline-flex items-center gap-2 pb-4 md:pb-6"
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-yellow-500" />
            <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t('congratulations')}
            </h1>
            <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-yellow-500" />
          </motion.div>
        </motion.div>

        {/* Main Stage Card - Only show the stage */}
        <motion.div
          variants={itemVariants}
          whileHover="hover"
          className="flex justify-center"
        >
          <motion.div variants={cardHoverVariants}>
            <Card className="relative overflow-hidden border-2 border-primary/20 w-full max-w-md mx-auto">
              <div className={`absolute inset-0 ${getStageColor(profile.stage)} opacity-5`} />
              <CardHeader className="text-center py-6 md:py-8 px-4">
                <motion.div
                  className="text-6xl md:text-8xl mb-4 md:mb-6"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                >
                  {getStageIcon(profile.stage)}
                </motion.div>
                <CardTitle className="text-2xl md:text-4xl mb-3 md:mb-4">
                  {tStages(profile.stage.toLowerCase())}
                </CardTitle>
                <div className="text-lg md:text-xl text-muted-foreground">
                  <Badge variant="outline" className="text-sm md:text-lg px-3 py-1 md:px-4 md:py-2">
                    {tCategories(profile.category.toLowerCase())}
                  </Badge>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        </motion.div>

        {/* Action Section */}
        <motion.div variants={itemVariants} className="w-full">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full"
          >
            <Button 
              size="lg" 
              onClick={handleContinueToDashboard}
              className="px-8 py-3 md:px-12 md:py-4 text-lg md:text-xl w-full sm:w-auto"
            >
              {t('continueToDashboard')}
              <ArrowRight className="ml-2 md:ml-3 h-5 w-5 md:h-6 md:w-6" />
            </Button>
          </motion.div>
          <p className="text-base md:text-lg text-muted-foreground mt-4 md:mt-6 text-center sm:text-left">
            View detailed metrics and insights in your dashboard
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}