import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { bridgeApi } from '@/lib/bridge-api';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const session = await auth();
    
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if Bridge credentials are configured
    if (!process.env.BRIDGE_CLIENT_ID || !process.env.BRIDGE_CLIENT_SECRET) {
      console.error('Bridge API credentials not configured');
      return NextResponse.json(
        { error: 'Bridge API not configured. Please set BRIDGE_CLIENT_ID and BRIDGE_CLIENT_SECRET environment variables.' },
        { status: 500 }
      );
    }

    console.log('Bridge API connect request for user:', session.user.email);
    console.log('Bridge credentials configured:', {
      hasClientId: !!process.env.BRIDGE_CLIENT_ID,
      hasClientSecret: !!process.env.BRIDGE_CLIENT_SECRET,
    });

    // Step 1: Check if Bridge user already exists in our database
    const existingBridgeUser = await prisma.bridgeUser.findUnique({
      where: { userId: session.user.id }
    });

    let bridgeUserUuid: string;

    if (existingBridgeUser) {
      // Use existing Bridge user
      bridgeUserUuid = existingBridgeUser.bridgeUuid;
    } else {
      // Create new Bridge user
      try {
        const newBridgeUser = await bridgeApi.createUser(session.user.id);
        bridgeUserUuid = newBridgeUser.uuid;

        // Store Bridge user in our database
        await prisma.bridgeUser.create({
          data: {
            userId: session.user.id,
            bridgeUuid: newBridgeUser.uuid,
            externalUserId: session.user.id,
          },
        });
      } catch (createError) {
        console.error('Error creating Bridge user:', createError);
        return NextResponse.json(
          { error: 'Failed to create Bridge user' },
          { status: 500 }
        );
      }
    }

    // Step 2: Authenticate user to get access token
    const authResponse = await bridgeApi.authenticateUser(bridgeUserUuid);

    // Step 3: Create connect session
    // Bridge API requires HTTPS callback URLs
    // For development, use BRIDGE_CALLBACK_URL or fallback to production-style URL
    const callbackUrl = process.env.BRIDGE_CALLBACK_URL || `${process.env.NEXTAUTH_URL}/api/bridge/callback`;
      
    console.log('Using callback URL:', callbackUrl);
    
    const connectSession = await bridgeApi.createConnectSession(
      authResponse.access_token,
      session.user.email,
      callbackUrl
    );

    return NextResponse.json({ 
      redirect_url: connectSession.url,
      session_id: connectSession.id,
      user_uuid: bridgeUserUuid
    });
  } catch (error) {
    console.error('Error creating Bridge connection:', error);
    return NextResponse.json(
      { error: 'Failed to create Bridge connection' },
      { status: 500 }
    );
  }
}