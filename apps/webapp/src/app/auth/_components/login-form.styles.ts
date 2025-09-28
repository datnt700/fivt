import styled from '@emotion/styled';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Simple styled components using existing UI components as base
export const StyledLoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const StyledCard = styled(Card)``;

export const StyledCardHeader = styled(CardHeader)`
  text-align: center;
`;

export const StyledCardTitle = styled(CardTitle)``;

export const StyledCardDescription = styled(CardDescription)``;

export const StyledCardContent = styled(CardContent)``;

export const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

export const HeaderSpacer = styled.div`
  flex: 1;
`;

export const FormGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const StyledGoogleButton = styled(Button)`
  width: 100%;
`;

export const Footer = styled.div`
  text-align: center;
  font-size: 0.75rem;
  line-height: 1.5;
`;