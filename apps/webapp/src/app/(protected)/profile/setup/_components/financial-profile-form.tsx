/**
 * Financial Profile Setup Form Component
 * Uses React Hook Form with Zod validation and Framer Motion animations
 */

'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, Calculator, Info, TrendingUp } from 'lucide-react';
import { 
  financialProfileSchema, 
  type FinancialProfileFormData,
  convertFormDataToProfileInput
} from '../_schemas/financial-profile-schema';
import { useCreateProfile } from '../_hooks/use-profile';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4 }
  }
};

export function FinancialProfileForm() {
  const createProfileMutation = useCreateProfile();
  const t = useTranslations('financialProfile.setup');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, isDirty }
  } = useForm<FinancialProfileFormData>({
    resolver: zodResolver(financialProfileSchema),
    mode: 'onChange',
    defaultValues: {
      grossIncome: '',
      netIncome: '',
      monthlyExpenses: '',
      monthlyInvestments: '',
      oneTimeInvestments: '0',
      bonusInvestments: '0',
      netWorth: '',
      age: '',
      debt: '0',
      notes: ''
    }
  });

  // Watch form values for preview calculations
  const watchedValues = watch();
  const canPreview = watchedValues.netIncome && watchedValues.monthlyExpenses && watchedValues.monthlyInvestments;

  const onSubmit = async (data: FinancialProfileFormData) => {
    try {
      // Validate and transform the data using Zod
      const validatedData = financialProfileSchema.parse(data);
      const profileInput = convertFormDataToProfileInput(validatedData);
      createProfileMutation.mutate(profileInput);
    } catch (error) {
      console.error('Validation error:', error);
    }
  };

  // Calculate preview values
  const getPreviewCalculations = () => {
    if (!canPreview) return null;

    const netIncome = typeof watchedValues.netIncome === 'string' 
      ? parseFloat(watchedValues.netIncome) || 0 
      : watchedValues.netIncome || 0;
    const monthlyExpenses = typeof watchedValues.monthlyExpenses === 'string' 
      ? parseFloat(watchedValues.monthlyExpenses) || 0 
      : watchedValues.monthlyExpenses || 0;
    const annualExpenses = monthlyExpenses * 12;
    const annualSavings = netIncome - annualExpenses;
    const savingsRate = netIncome > 0 ? (annualSavings / netIncome) * 100 : 0;
    const fiNumber = annualExpenses * 25;
    const netWorth = typeof watchedValues.netWorth === 'string' 
      ? parseFloat(watchedValues.netWorth) || 0 
      : watchedValues.netWorth || 0;
    const progressToFI = fiNumber > 0 ? (netWorth / fiNumber) * 100 : 0;

    return {
      annualSavings,
      savingsRate,
      fiNumber,
      progressToFI
    };
  };

  const previewCalcs = getPreviewCalculations();

  return (
    <motion.div
      className="w-full space-y-4 md:space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <Card className="md:border md:shadow-sm border-0 shadow-none">
          <CardHeader className="px-4 md:px-6 py-4 md:py-6">
            <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
              <Calculator className="h-5 w-5 md:h-6 md:w-6" />
              {t('title')}
            </CardTitle>
            <CardDescription className="text-sm md:text-base">
              {t('subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
              {/* Income Section */}
              <motion.div className="space-y-3 md:space-y-4" variants={itemVariants}>
                <div className="flex items-center gap-2">
                  <h3 className="text-base md:text-lg font-semibold">{t('income')}</h3>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="grossIncome">{t('grossIncome')}</Label>
                    <Input
                      id="grossIncome"
                      type="number"
                      placeholder={t('grossIncomePlaceholder')}
                      {...register('grossIncome')}
                      className={errors.grossIncome ? 'border-red-500' : ''}
                    />
                    {errors.grossIncome && (
                      <p className="text-sm text-red-500">{errors.grossIncome.message}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{t('grossIncomeDesc')}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="netIncome">{t('netIncome')}</Label>
                    <Input
                      id="netIncome"
                      type="number"
                      placeholder={t('netIncomePlaceholder')}
                      {...register('netIncome')}
                      className={errors.netIncome ? 'border-red-500' : ''}
                    />
                    {errors.netIncome && (
                      <p className="text-sm text-red-500">{errors.netIncome.message}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{t('netIncomeDesc')}</p>
                  </div>
                </div>
              </motion.div>

              {/* Expenses Section */}
              <motion.div className="space-y-3 md:space-y-4" variants={itemVariants}>
                <h3 className="text-base md:text-lg font-semibold">{t('expenses')}</h3>
                <div className="space-y-2">
                  <Label htmlFor="monthlyExpenses">{t('monthlyExpenses')}</Label>
                  <Input
                    id="monthlyExpenses"
                    type="number"
                    placeholder={t('monthlyExpensesPlaceholder')}
                    {...register('monthlyExpenses')}
                    className={errors.monthlyExpenses ? 'border-red-500' : ''}
                  />
                  {errors.monthlyExpenses && (
                    <p className="text-sm text-red-500">{errors.monthlyExpenses.message}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {t('monthlyExpensesDesc')}
                  </p>
                </div>
              </motion.div>

              {/* Investments Section */}
              <motion.div className="space-y-3 md:space-y-4" variants={itemVariants}>
                <h3 className="text-base md:text-lg font-semibold">{t('investments')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="monthlyInvestments">{t('monthlyInvestments')}</Label>
                    <Input
                      id="monthlyInvestments"
                      type="number"
                      placeholder={t('monthlyInvestmentsPlaceholder')}
                      {...register('monthlyInvestments')}
                      className={errors.monthlyInvestments ? 'border-red-500' : ''}
                    />
                    {errors.monthlyInvestments && (
                      <p className="text-sm text-red-500">{errors.monthlyInvestments.message}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{t('monthlyInvestmentsDesc')}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="oneTimeInvestments">{t('oneTimeInvestments')}</Label>
                    <Input
                      id="oneTimeInvestments"
                      type="number"
                      placeholder={t('oneTimeInvestmentsPlaceholder')}
                      {...register('oneTimeInvestments')}
                      className={errors.oneTimeInvestments ? 'border-red-500' : ''}
                    />
                    {errors.oneTimeInvestments && (
                      <p className="text-sm text-red-500">{errors.oneTimeInvestments.message}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{t('oneTimeInvestmentsDesc')}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bonusInvestments">{t('bonusInvestments')}</Label>
                    <Input
                      id="bonusInvestments"
                      type="number"
                      placeholder={t('bonusInvestmentsPlaceholder')}
                      {...register('bonusInvestments')}
                      className={errors.bonusInvestments ? 'border-red-500' : ''}
                    />
                    {errors.bonusInvestments && (
                      <p className="text-sm text-red-500">{errors.bonusInvestments.message}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{t('bonusInvestmentsDesc')}</p>
                  </div>
                </div>
              </motion.div>

              {/* Assets & Personal Section */}
              <motion.div className="space-y-3 md:space-y-4" variants={itemVariants}>
                <h3 className="text-base md:text-lg font-semibold">{t('assets')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="netWorth">{t('netWorth')}</Label>
                    <Input
                      id="netWorth"
                      type="number"
                      placeholder={t('netWorthPlaceholder')}
                      {...register('netWorth')}
                      className={errors.netWorth ? 'border-red-500' : ''}
                    />
                    {errors.netWorth && (
                      <p className="text-sm text-red-500">{errors.netWorth.message}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{t('netWorthDesc')}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">{t('age')}</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder={t('agePlaceholder')}
                      {...register('age')}
                      className={errors.age ? 'border-red-500' : ''}
                    />
                    {errors.age && (
                      <p className="text-sm text-red-500">{errors.age.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="debt">{t('debt')}</Label>
                    <Input
                      id="debt"
                      type="number"
                      placeholder={t('debtPlaceholder')}
                      {...register('debt')}
                      className={errors.debt ? 'border-red-500' : ''}
                    />
                    {errors.debt && (
                      <p className="text-sm text-red-500">{errors.debt.message}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{t('debtDesc')}</p>
                  </div>
                </div>
              </motion.div>

              {/* Additional Notes */}
              <motion.div className="space-y-3 md:space-y-4" variants={itemVariants}>
                <h3 className="text-base md:text-lg font-semibold">{t('notes')}</h3>
                <div className="space-y-2">
                  <Label htmlFor="notes">{t('notesLabel')}</Label>
                  <Textarea
                    id="notes"
                    placeholder={t('notesPlaceholder')}
                    {...register('notes')}
                    rows={3}
                  />
                </div>
              </motion.div>

              {/* Preview Section */}
              {canPreview && previewCalcs && (
                <motion.div
                  variants={itemVariants}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-muted/50 border-0 md:border shadow-none md:shadow-sm">
                    <CardHeader className="px-4 md:px-6 py-3 md:py-4">
                      <CardTitle className="text-base md:text-lg flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        {t('preview')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 px-4 md:px-6 pb-4 md:pb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-sm">
                        <div>
                          <strong>{t('annualSavings')}:</strong> €{previewCalcs.annualSavings.toLocaleString()}
                        </div>
                        <div>
                          <strong>{t('savingsRate')}:</strong> {previewCalcs.savingsRate.toFixed(1)}%
                        </div>
                        <div>
                          <strong>{t('fiNumber')}:</strong> €{previewCalcs.fiNumber.toLocaleString()}
                        </div>
                        <div>
                          <strong>{t('progressToFI')}:</strong> {previewCalcs.progressToFI.toFixed(1)}%
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Error Display */}
              {createProfileMutation.isError && (
                <motion.div
                  variants={itemVariants}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Alert variant="destructive">
                    <AlertDescription>
                      {createProfileMutation.error?.message || 'Failed to create financial profile'}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.div className="flex justify-center md:justify-end pt-3 md:pt-4" variants={itemVariants}>
                <Button 
                  type="submit" 
                  disabled={!isValid || !isDirty || createProfileMutation.isPending}
                  className="w-full sm:w-auto sm:min-w-[200px]"
                  size="lg"
                >
                  {createProfileMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('creatingProfile')}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {t('createProfile')}
                    </>
                  )}
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}