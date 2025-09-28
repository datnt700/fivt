// Magic Link Email Template for Authentication
import * as React from 'react';
import { Html } from '@react-email/html';
import { Head } from '@react-email/head';
import { Preview } from '@react-email/preview';
import { Body } from '@react-email/body';
import { Container } from '@react-email/container';
import { Heading } from '@react-email/heading';
import { Text } from '@react-email/text';
import { Button } from '@react-email/button';
import { emailStyles, emailTheme } from './email-theme.styles';

interface MagicLinkEmailTemplateProps {
  magicLink: string;
  locale?: 'en' | 'fr' | 'vi';
  appName?: string;
  expiryMinutes?: number;
}

// Default translations (fallback)
const translations = {
  en: {
    preview: 'Your magic link to sign in to {appName}',
    heading: 'Sign in to {appName}',
    description: 'Click the button below to securely sign in. This link will expire in {minutes} minutes.',
    buttonText: 'Sign in to {appName}',
    fallbackText: 'Or copy and paste this link into your browser:',
    expiry: 'This link will expire in {minutes} minutes for security reasons.',
    noReply: 'This is an automated email. Please do not reply to this message.'
  },
  fr: {
    preview: 'Votre lien magique pour vous connecter à {appName}',
    heading: 'Se connecter à {appName}',
    description: 'Cliquez sur le bouton ci-dessous pour vous connecter en toute sécurité. Ce lien expirera dans {minutes} minutes.',
    buttonText: 'Se connecter à {appName}',
    fallbackText: 'Ou copiez et collez ce lien dans votre navigateur :',
    expiry: 'Ce lien expirera dans {minutes} minutes pour des raisons de sécurité.',
    noReply: 'Ceci est un email automatisé. Veuillez ne pas répondre à ce message.'
  },
  vi: {
    preview: 'Liên kết đăng nhập của bạn cho {appName}',
    heading: 'Đăng nhập vào {appName}',
    description: 'Nhấp vào nút bên dưới để đăng nhập an toàn. Liên kết này sẽ hết hạn sau {minutes} phút.',
    buttonText: 'Đăng nhập vào {appName}',
    fallbackText: 'Hoặc sao chép và dán liên kết này vào trình duyệt của bạn:',
    expiry: 'Liên kết này sẽ hết hạn sau {minutes} phút vì lý do bảo mật.',
    noReply: 'Đây là email tự động. Vui lòng không trả lời tin nhắn này.'
  }
};

function replaceVariables(text: string, variables: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return variables[key]?.toString() || match;
  });
}

export default function MagicLinkEmailTemplate({
  magicLink,
  locale = 'en',
  appName = 'FIVT',
  expiryMinutes = 10,
}: MagicLinkEmailTemplateProps) {
  const t = translations[locale] || translations.en;
  const variables = { appName, minutes: expiryMinutes };

  return (
    <Html>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
      </Head>
      <Preview>{replaceVariables(t.preview, variables)}</Preview>
      <Body style={emailStyles.main}>
        <Container style={emailStyles.container}>
          <Heading style={emailStyles.heading}>
            {replaceVariables(t.heading, variables)}
          </Heading>
          
          <Text style={emailStyles.paragraph}>
            {replaceVariables(t.description, variables)}
          </Text>
          
          <div style={{ textAlign: 'center', margin: `${emailTheme.spacing.xl} 0` }}>
            <Button href={magicLink} style={emailStyles.button}>
              {replaceVariables(t.buttonText, variables)}
            </Button>
          </div>
          
          <Text style={emailStyles.paragraph}>
            {t.fallbackText}
          </Text>
          
          <Text style={{ ...emailStyles.paragraph, ...emailStyles.link }}>
            {magicLink}
          </Text>
          
          <div style={{ 
            borderTop: `1px solid ${emailTheme.colors.border}`,
            margin: `${emailTheme.spacing.xl} 0`,
            width: '100%'
          }} />
          
          <Text style={emailStyles.footer}>
            {replaceVariables(t.expiry, variables)}
          </Text>
          
          <Text style={emailStyles.footer}>
            {t.noReply}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}