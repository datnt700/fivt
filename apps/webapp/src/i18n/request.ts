import { getRequestConfig } from 'next-intl/server';
import { getUserLocale } from '../services/locale';

export default getRequestConfig(async () => {
  const locale = await getUserLocale();

  // Import all modular translation files and merge them
  const messages = {
    common: (await import(`../../messages/${locale}/common.json`)).default,
    navigation: (await import(`../../messages/${locale}/navigation.json`))
      .default,
    auth: (await import(`../../messages/${locale}/auth.json`)).default,
    chatbot: (await import(`../../messages/${locale}/chatbot.json`)).default,
    theme: (await import(`../../messages/${locale}/theme.json`)).default,
    language: (await import(`../../messages/${locale}/language.json`)).default,
    home: (await import(`../../messages/${locale}/home.json`)).default,
    banking: (await import(`../../messages/${locale}/banking.json`)).default,
    errors: (await import(`../../messages/${locale}/errors.json`)).default,
    transactions: (await import(`../../messages/${locale}/transactions.json`))
      .default,
    budget: (await import(`../../messages/${locale}/budget.json`)).default,
    category: (await import(`../../messages/${locale}/category.json`)).default,
    financialProfile: (
      await import(`../../messages/${locale}/financialProfile.json`)
    ).default,
    userProfile: (await import(`../../messages/${locale}/userProfile.json`))
      .default,
    extensions: (await import(`../../messages/${locale}/extensions.json`))
      .default,
    community: (await import(`../../messages/${locale}/community.json`))
      .default,
  };

  return {
    locale,
    messages,
  };
});
