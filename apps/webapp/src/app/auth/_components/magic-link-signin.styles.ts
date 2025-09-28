import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Keyframes for spinner animation
export const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// Simple styled components using existing UI components as base
export const StyledContainer = styled.div`
  width: 100%;
  max-width: 28rem;
  margin: 0 auto 1.5rem auto;
`;

export const StyledSuccessCard = styled(Card)`
  width: 100%;
  max-width: 28rem;
  margin: 0 auto;
`;

export const StyledSuccessHeader = styled(CardHeader)`
  text-align: center;
`;

export const IconWrapper = styled.div`
  width: 3rem;
  height: 3rem;
  background: #dcfce7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem auto;
`;

export const StyledSuccessTitle = styled(CardTitle)``;

export const StyledSuccessDescription = styled(CardDescription)``;

export const StyledSuccessContent = styled(CardContent)`
  text-align: center;
`;

export const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const StyledLabel = styled(Label)``;

export const StyledInput = styled(Input)``;

export const StyledSubmitButton = styled(Button)`
  width: 100%;
`;

export const StyledOutlineButton = styled(Button)`
  width: 100%;
`;