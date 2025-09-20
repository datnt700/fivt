// src/emails/MagicLinkEmailTemplate.tsx
import * as React from 'react';
import { Html } from '@react-email/html';
import { Head } from '@react-email/head';
import { Preview } from '@react-email/preview';
import { Body } from '@react-email/body';
import { Container } from '@react-email/container';
import { Heading } from '@react-email/heading';
import { Text } from '@react-email/text';
import { Button } from '@react-email/button';

interface MagicLinkEmailTemplateProps {
  magicLink: string;
  appName?: string;
}

export default function MagicLinkEmailTemplate({
  magicLink,
  appName = 'MyApp',
}: MagicLinkEmailTemplateProps) {
  console.log('Rendering MagicLinkEmailTemplate with magicLink:', magicLink);
  return (
    <Html>
      <Head />
      <Preview>Your magic link to sign in to {appName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Sign in to {appName}</Heading>
          <Text style={paragraph}>
            Click the button below to securely sign in. This link will expire in 10 minutes.
          </Text>
          <Button href={magicLink} style={button}>
            Sign in to {appName}
          </Button>
          <Text style={paragraph}>
            Or copy and paste this link into your browser:
            <br />
            {magicLink}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: '#ffffff', padding: '20px' };
const container = {
  margin: '0 auto',
  padding: '20px',
  maxWidth: '480px',
  backgroundColor: '#f9f9f9',
  borderRadius: '8px',
};
const heading = { fontSize: '24px', fontWeight: 'bold' };
const paragraph = { fontSize: '16px', lineHeight: '24px', color: '#444' };
const button = {
  backgroundColor: '#0070f3',
  color: '#fff',
  padding: '12px 20px',
  borderRadius: '6px',
  textDecoration: 'none',
};
