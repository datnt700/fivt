import { Metadata } from 'next';
import { Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';

export const metadata: Metadata = {
  title: 'Check Your Email - Director Club',
  description: "We've sent you a magic link to sign in to Director Club",
};

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Mail className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle>Check Your Email</CardTitle>
          <CardDescription>We've sent you a magic link to sign in to Director Club</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            Click the link in your email to securely sign in to your account.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>• The link will expire in 24 hours</p>
            <p>• Check your spam folder if you don't see it</p>
            <p>• Make sure to check the email address you entered</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
