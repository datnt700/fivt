import { useTranslations } from 'next-intl';
import { Step } from '../_types';

// src/data/steps/index.ts
type StepAnswers = { focus?: string; [key: string]: unknown };
export function useFinancialRoadmapSteps(): Step[] {
  const t = useTranslations('roadmap');
  return [
    {
      id: 'A',
      label: t('stepqna.A.title'),
      title: t('stepqna.A.title'),
      description: t('stepqna.A.description'),
      questions: [
        {
          id: 'focus',
          type: 'radio',
          label: t('stepqna.A.focusLabel'),
          options: [
            { value: 'saving', label: t('stepqna.A.options.saving') },
            { value: 'debt', label: t('stepqna.A.options.debt') },
            { value: 'investing', label: t('stepqna.A.options.investing') },
            { value: 'spending', label: t('stepqna.A.options.spending') },
          ],
        },
      ],
    },
    {
      id: 'B',
      label: t('stepqna.B.title'),
      title: t('stepqna.B.title'),
      description: t('stepqna.B.description'),
      questions: [
        {
          id: 'incomeSource',
          type: 'textarea',
          label: t('stepqna.B.incomeSource'),
        },
        {
          id: 'incomeStability',
          type: 'radio',
          label: t('stepqna.B.incomeStability'),
          options: [
            { value: 'stable', label: 'Mostly stable' },
            { value: 'variable', label: 'Changes month to month' },
          ],
        },
        {
          id: 'incomeRange',
          type: 'radio',
          label: t('stepqna.B.incomeRange'),
          options: [
            { value: '<1000', label: 'Under €1,000' },
            { value: '1000-2000', label: '1,000–2,000€' },
            { value: '2000-3000', label: '2,000–3,000€' },
            { value: '>3000', label: 'Over €3,000' },
          ],
        },
      ],
    },
    {
      id: 'C',
      label: t('stepqna.C.title'),
      title: t('stepqna.C.title'),
      branches: [
        {
          condition: (answers: StepAnswers) => answers.focus === 'saving',
          title: t('stepqna.C.saving.title'),
          questions: [
            {
              id: 'trackSpending',
              type: 'checkbox',
              label: 'Do you currently track your spending?',
            },
            {
              id: 'setBudget',
              type: 'checkbox',
              label: 'Do you follow a set budget for each category?',
            },
            {
              id: 'monthlySavings',
              type: 'input',
              label: 'On average, how much are you able to save every month?',
              placeholder: 'e.g., €200',
            },
          ],
        },
        {
          condition: (answers: StepAnswers) => answers.focus === 'debt',
          title: t('stepqna.C.debt.title'),
          questions: [
            {
              id: 'hasDebt',
              type: 'checkbox',
              label: 'Do you currently have any debts or loans?',
            },
            {
              id: 'debtEnd',
              type: 'input',
              label: 'When do you think you’ll finish paying them off?',
            },
            {
              id: 'monthlyDebtPayment',
              type: 'input',
              label: 'About how much do you pay each month toward your debts?',
              placeholder: 'e.g., €300',
            },
          ],
        },
        {
          condition: (answers: StepAnswers) => answers.focus === 'investing',
          title: t('stepqna.C.investing.title'),
          questions: [
            {
              id: 'hasInvested',
              type: 'checkbox',
              label: 'Have you ever invested before?',
            },
            {
              id: 'riskUnderstanding',
              type: 'radio',
              label:
                'How would you describe your understanding of investment risks?',
              options: [
                { value: 'none', label: 'I don’t really understand them yet' },
                { value: 'basic', label: 'I know the basics' },
                {
                  value: 'advanced',
                  label: 'I understand them well and already invest',
                },
              ],
            },
            {
              id: 'investmentGoal',
              type: 'textarea',
              label: 'Do you have a specific investment goal in mind?',
              placeholder: 'e.g., build wealth, retire early, buy a house…',
            },
          ],
        },
        {
          condition: (answers: StepAnswers) => answers.focus === 'spending',
          title: t('stepqna.C.spending.title'),
          questions: [
            {
              id: 'spendingDrivers',
              type: 'textarea',
              label: 'What usually influences your spending decisions?',
            },
            {
              id: 'overspendingSituations',
              type: 'textarea',
              label:
                'In what kind of situations do you usually go over budget?',
            },
            {
              id: 'overspendingFeelings',
              type: 'textarea',
              label: 'When you overspend, how does that make you feel?',
            },
          ],
        },
      ],
    },
    {
      id: 'D',
      label: t('stepqna.D.title'),
      title: t('stepqna.D.title'),
      questions: [
        {
          id: 'financialChallenge',
          type: 'textarea',
          label: t('stepqna.D.financialChallenge'),
          placeholder:
            'e.g., staying consistent, not knowing where to start, unstable income…',
        },
        {
          id: 'motivation',
          type: 'textarea',
          label: t('stepqna.D.motivation'),
          placeholder: 'e.g., “I want to buy a car for my dad.”',
        },
      ],
    },
  ];
}
