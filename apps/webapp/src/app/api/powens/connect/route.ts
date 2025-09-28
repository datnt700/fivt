import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { powensApi } from '@/lib/powens-api';
import { prisma } from '@/lib/prisma';
import { randomInt } from 'crypto';

export async function POST() {
  try {
    const session = await auth();
    
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if Powens credentials are configured
    if (!process.env.POWENS_CLIENT_ID || !process.env.POWENS_CLIENT_SECRET) {
      console.error('Powens API credentials not configured');
      return NextResponse.json(
        { error: 'Powens API not configured. Please set POWENS_CLIENT_ID and POWENS_CLIENT_SECRET environment variables.' },
        { status: 500 }
      );
    }

    console.log('Powens API connect request for user:', session.user.email);
    console.log('Powens credentials configured:', {
      hasClientId: !!process.env.POWENS_CLIENT_ID,
      hasClientSecret: !!process.env.POWENS_CLIENT_SECRET,
    });

    // Step 1: Check if Powens user already exists in our database
    const existingPowensUser = await prisma.powensUser.findUnique({
      where: { userId: session.user.id }
    });

    let accessToken: string;

    if (existingPowensUser) {
      // For existing users, we would need to store the access token
      // For now, create a new access token each time
      const authResponse = await powensApi.createUser();
      accessToken = authResponse.access_token;
    } else {
      // Create new Powens user and get access token
      try {
        const authResponse = await powensApi.createUser();
        accessToken = authResponse.access_token;

        // Store Powens user in our database with a placeholder ID
        // The actual user ID will be determined after connection
        await prisma.powensUser.create({
          data: {
            userId: session.user.id,
            powensId: randomInt(1000000, 999999999), // Secure random temporary ID
            email: session.user.email,
          },
        });
      } catch (createError) {
        console.error('Error creating Powens user:', createError);
        return NextResponse.json(
          { error: 'Failed to create Powens user' },
          { status: 500 }
        );
      }
    }

    // Step 2: Get temporary code for webview
    const temporaryCode = await powensApi.getTemporaryCode(accessToken);

    // Step 3: Create connect session
    // Powens API callback URL setup
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const callbackUrl = process.env.POWENS_CALLBACK_URL || `${baseUrl}/api/powens/callback`;
      
    console.log('Using Powens callback URL:', callbackUrl);
    
    const connectSession = await powensApi.createConnectSession(
      temporaryCode,
      callbackUrl
    );

    return NextResponse.json({ 
      connect_url: connectSession.connect_url,
      session_id: connectSession.id_session,
      access_token: accessToken // Store for later use
    });
  } catch (error) {
    console.error('Error creating Powens connection:', error);
    return NextResponse.json(
      { error: 'Failed to create Powens connection' },
      { status: 500 }
    );
  }
}