import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth, { type NextAuthResult } from 'next-auth';
import Google from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';
import Resend from 'next-auth/providers/resend';
import { render } from '@react-email/render';
import React from 'react';
import MagicLinkEmailTemplate from "@/lib/emails/magic-link-email";
import type { Session } from "next-auth";
import type { AdapterUser } from "next-auth/adapters";
import { COMMON_ROUTES } from '@/config/routes';

const authConfig = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET,
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY!,
      from: process.env.AUTH_RESEND_FROM!,
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        try {
          // Render the email template
          const html = await render(
            React.createElement(MagicLinkEmailTemplate, {
              //name: 'there',
              magicLink: url,
            })
          );

          // Send the email using Resend
          const result = await fetch('https://api.resend.com/emails', {
            headers: {
              Authorization: `Bearer ${provider.apiKey}`,
              'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({
              from: provider.from,
              to: identifier,
              subject: 'Sign In to Director Club',
              html: html,
            }),
          });
          if (!result.ok) {
            const text = await result.text();
            console.error('[Resend] send fail', result.status, text);
            throw new Error('Failed to send verification email');
          }
        } catch (error) {
          console.error('Error sending verification email:', error);
          throw new Error('Failed to send verification email');
        }
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],

  pages: {
    signIn: COMMON_ROUTES.AUTH.LOGIN,
    error: COMMON_ROUTES.AUTH.LOGIN, 
    verifyRequest: COMMON_ROUTES.AUTH.VERIFY_REQUEST,
  },

  callbacks: {
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Handles the redirect after authentication
      if (url.startsWith("/")) {
        // If it's a relative URL, let the middleware handle locale prefix
        return `${baseUrl}${url}`;
      }
      // Allow redirect to the same origin
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      // Default redirect to home page (middleware will add locale prefix)
      return `${baseUrl}${COMMON_ROUTES.HOME}`;
    },
    async session({ session, user }: { session: Session; user: AdapterUser }) {
      if (!user?.email || !user.id) return session;

      if (session.user) {
        session.user.id = user.id;
      }

      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

const nextAuth = NextAuth(authConfig);

export const handlers: NextAuthResult['handlers'] = nextAuth.handlers;
export const auth: NextAuthResult['auth'] = nextAuth.auth;
export const signIn: NextAuthResult['signIn'] = nextAuth.signIn;
export const signOut: NextAuthResult['signOut'] = nextAuth.signOut;
