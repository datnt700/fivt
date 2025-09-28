import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { bridgeApi } from '@/lib/bridge-api';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const session_id = searchParams.get('session_id');
    const status = searchParams.get('status');
    const user_uuid = searchParams.get('user_uuid');

    if (!session_id) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    if (!user_uuid) {
      return NextResponse.json({ error: 'Missing user_uuid' }, { status: 400 });
    }

    if (status === 'success') {
      // Authenticate user and fetch account information from Bridge
      try {
        const authResponse = await bridgeApi.authenticateUser(user_uuid);
        const accountsResponse = await bridgeApi.getAccounts(authResponse.access_token);

        // Store accounts in database
        if (accountsResponse.resources && accountsResponse.resources.length > 0) {
          for (const account of accountsResponse.resources) {
            await prisma.bridgeAccount.upsert({
              where: { bridgeAccountId: account.id.toString() },
              update: {
                name: account.name,
                type: account.type,
                balance: account.balance ? parseFloat(account.balance.toString()) : null,
                currencyCode: account.currency_code,
                providerId: account.provider_id ? parseInt(account.provider_id) : null,
                dataAccess: account.data_access || 'enabled',
                lastRefreshStatus: account.last_refresh_status,
                pro: account.pro || false,
                updatedAt: new Date(),
              },
              create: {
                userId: session.user.id,
                bridgeAccountId: account.id.toString(),
                itemId: account.item_id.toString(),
                name: account.name,
                type: account.type,
                balance: account.balance ? parseFloat(account.balance.toString()) : null,
                currencyCode: account.currency_code,
                providerId: account.provider_id ? parseInt(account.provider_id) : null,
                dataAccess: account.data_access || 'enabled',
                lastRefreshStatus: account.last_refresh_status,
                pro: account.pro || false,
              },
            });
          }
        }

        console.log('Bridge connection successful:', {
          userId: session.user.id,
          userUuid: user_uuid,
          sessionId: session_id,
          accountsCount: accountsResponse.resources?.length || 0,
        });

        // Send success message to parent window
        const html = `
          <html>
            <body>
              <script>
                window.opener.postMessage({
                  type: 'BRIDGE_SUCCESS',
                  data: ${JSON.stringify(accountsResponse.resources || [])}
                }, '${process.env.NEXTAUTH_URL}');
                window.close();
              </script>
            </body>
          </html>
        `;
        
        return new NextResponse(html, {
          headers: { 'Content-Type': 'text/html' },
        });
      } catch (apiError) {
        console.error('Error fetching Bridge accounts:', apiError);
        // Send error message to parent window
        const html = `
          <html>
            <body>
              <script>
                window.opener.postMessage({
                  type: 'BRIDGE_ERROR',
                  error: 'Failed to fetch account data'
                }, '${process.env.NEXTAUTH_URL}');
                window.close();
              </script>
            </body>
          </html>
        `;
        
        return new NextResponse(html, {
          headers: { 'Content-Type': 'text/html' },
        });
      }
    } else {
      // Connection failed or was cancelled
      const html = `
        <html>
          <body>
            <script>
              window.opener.postMessage({
                type: 'BRIDGE_ERROR',
                error: 'Connection was cancelled or failed'
              }, '${process.env.NEXTAUTH_URL}');
              window.close();
            </script>
          </body>
        </html>
      `;
      
      return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html' },
      });
    }
  } catch (error) {
    console.error('Error in Bridge callback:', error);
    return NextResponse.json(
      { error: 'Failed to process Bridge callback' },
      { status: 500 }
    );
  }
}