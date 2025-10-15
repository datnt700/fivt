import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ExtensionDetail } from '../_components/extension-detail';
import { ExtensionOperationsProvider } from '../_contexts/extension-operations-context';

interface ExtensionPageProps {
  params: Promise<{
    extensionId: string;
  }>;
}

export async function generateMetadata({
  params,
}: ExtensionPageProps): Promise<Metadata> {
  const { extensionId } = await params;
  const t = await getTranslations('extensions');

  return {
    title: `${t('title')} - ${extensionId} - FIVT`,
    description: t('subtitle'),
  };
}

export default async function ExtensionPage({ params }: ExtensionPageProps) {
  const { extensionId } = await params;

  if (!extensionId) {
    notFound();
  }

  return (
    <ExtensionOperationsProvider>
      <ExtensionDetail extensionId={extensionId} />
    </ExtensionOperationsProvider>
  );
}
