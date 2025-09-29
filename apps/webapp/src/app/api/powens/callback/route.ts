import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get('connection_id');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    console.log('Powens callback received:', { connectionId, error, errorDescription });

    if (error) {
      console.error('Powens connection error:', error, errorDescription);
      const errorPageUrl = new URL(`${process.env.NEXTAUTH_URL}/banking/error`);
      errorPageUrl.searchParams.set('error', error);
      if (errorDescription) {
        errorPageUrl.searchParams.set('error_description', errorDescription);
      }
      return NextResponse.redirect(errorPageUrl.toString());
    }

    if (!connectionId) {
      console.error('Invalid Powens callback parameters - missing connection_id');
      const errorPageUrl = new URL(`${process.env.NEXTAUTH_URL}/banking/error`);
      errorPageUrl.searchParams.set('error', 'invalid_callback');
      return NextResponse.redirect(errorPageUrl.toString());
    }

    try {
      // Get Powens user from database
      const powensUser = await prisma.powensUser.findUnique({
        where: { userId: session.user.id }
      });

      if (!powensUser) {
        console.error('Powens user not found for session user');
        const errorPageUrl = new URL(`${process.env.NEXTAUTH_URL}/banking/error`);
        errorPageUrl.searchParams.set('error', 'user_not_found');
        return NextResponse.redirect(errorPageUrl.toString());
      }

      console.log('Powens connection successful for connection_id:', connectionId);

      // For now, we'll just mark the connection as successful
      // In a full implementation, you would:
      // 1. Store the connection_id
      // 2. Use the stored access_token to fetch accounts
      // 3. Store account data in the database

      // Update the Powens user record if needed
      if (powensUser) {
        // You could store the connection_id here for future use
        console.log('Connection established for existing Powens user');
      }

      // Redirect back to banking page with success parameter
      const successUrl = new URL(`${process.env.NEXTAUTH_URL}/banking`);
      successUrl.searchParams.set('success', 'true');
      successUrl.searchParams.set('provider', 'powens');
      successUrl.searchParams.set('connection_id', connectionId);
      
      return NextResponse.redirect(successUrl.toString());

    } catch (fetchError) {
      console.error('Error fetching Powens accounts:', fetchError);
      const errorPageUrl = new URL(`${process.env.NEXTAUTH_URL}/banking/error`);
      errorPageUrl.searchParams.set('error', 'fetch_failed');
      return NextResponse.redirect(errorPageUrl.toString());
    }

  } catch (error) {
    console.error('Error in Powens callback:', error);
    const errorPageUrl = new URL(`${process.env.NEXTAUTH_URL}/banking/error`);
    errorPageUrl.searchParams.set('error', 'callback_failed');
    return NextResponse.redirect(errorPageUrl.toString());
  }
}