'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Mail, Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import {
  StyledContainer,
  StyledSuccessCard,
  StyledSuccessHeader,
  IconWrapper,
  StyledSuccessTitle,
  StyledSuccessDescription,
  StyledSuccessContent,
  StyledForm,
  FormGroup,
  StyledLabel,
  StyledInput,
  StyledSubmitButton,
  StyledOutlineButton,
  spin,
} from './magic-link-signin.styles';

export function MagicLinkSignIn() {
  const t = useTranslations('auth');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error(t('invalidEmail'));
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(t('invalidEmail'));
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn('resend', {
        email,
        redirect: false,
      });

      if (result?.error) {
        toast.error(t('signInError'));
      } else {
        setIsEmailSent(true);
        toast.success(t('signInSuccess'));
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error(t('signInError'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <StyledSuccessCard>
        <StyledSuccessHeader>
          <IconWrapper>
            <Mail style={{ width: '1.5rem', height: '1.5rem', color: '#16a34a' }} />
          </IconWrapper>
          <StyledSuccessTitle>{t('checkEmail')}</StyledSuccessTitle>
          <StyledSuccessDescription>
            {t('checkEmailDescription')}
          </StyledSuccessDescription>
        </StyledSuccessHeader>
        <StyledSuccessContent>
          <StyledOutlineButton
            onClick={() => {
              setIsEmailSent(false);
              setEmail('');
            }}
          >
            Try a different email
          </StyledOutlineButton>
        </StyledSuccessContent>
      </StyledSuccessCard>
    );
  }

  return (
    <StyledContainer>
      <StyledForm onSubmit={handleSubmit}>
        <FormGroup>
          <StyledLabel htmlFor="email">{t('emailLabel')}</StyledLabel>
          <StyledInput
            id="email"
            type="email"
            placeholder={t('emailPlaceholder')}
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </FormGroup>

        <StyledSubmitButton type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 style={{ width: '1rem', height: '1rem', animation: `${spin} 1s linear infinite` }} />
              {t('signingIn')}
            </>
          ) : (
            <>
              <Mail style={{ width: '1rem', height: '1rem' }} />
              {t('signInButton')}
            </>
          )}
        </StyledSubmitButton>
      </StyledForm>
    </StyledContainer>
  );
}
