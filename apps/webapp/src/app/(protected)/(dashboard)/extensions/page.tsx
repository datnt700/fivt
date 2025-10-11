import { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { ExtensionsManager } from './_components/extensions-manager';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('extensions');

  return {
    title: `${t('title')} - FIVT`,
    description: t('subtitle'),
  };
}

export default function ExtensionsPage() {
  const t = useTranslations('extensions');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <ExtensionsManager />
    </div>
  );
}
