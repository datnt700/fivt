import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { powensApi, type PowensTransaction } from '@/lib/powens-api';

interface ExtendedTransaction extends PowensTransaction {
  accountName?: string;
  accountId?: number;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7); // YYYY-MM format
    const accountId = searchParams.get('accountId');

    // Find the user's Powens connection
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        powensUser: true,
        powensAccounts: true,
      },
    });

    if (!user || !user.powensUser) {
      return NextResponse.json({ 
        error: 'Powens account not connected. Please connect your bank account first.' 
      }, { status: 404 });
    }

    // Get access token (you'll need to implement token management)
    // For now, we'll assume you have a way to get/refresh tokens
    const accessToken = await getOrRefreshPowensToken();

    if (!accessToken) {
      return NextResponse.json({ 
        error: 'Unable to authenticate with Powens. Please reconnect your account.' 
      }, { status: 401 });
    }

    let allTransactions: ExtendedTransaction[] = [];

    if (accountId) {
      // Get transactions for specific account
      const transactions = await powensApi.getTransactions(accessToken, parseInt(accountId));
      allTransactions = transactions;
    } else {
      // Get transactions for all user accounts
      for (const account of user.powensAccounts) {
        try {
          const transactions = await powensApi.getTransactions(accessToken, account.powensAccountId);
          allTransactions.push(...transactions.map(t => ({
            ...t,
            accountName: account.name,
            accountId: account.powensAccountId,
          })));
        } catch (error) {
          console.error(`Error fetching transactions for account ${account.powensAccountId}:`, error);
          // Continue with other accounts even if one fails
        }
      }
    }

    // Filter transactions for the specified month
    const [year, monthNumber] = month.split('-').map(Number);
    const filteredTransactions = allTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getFullYear() === year && 
             transactionDate.getMonth() === (monthNumber || 1) - 1; // JavaScript months are 0-indexed
    });

    // Sort by date (newest first)
    filteredTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      transactions: filteredTransactions,
      total: filteredTransactions.reduce((sum, t) => sum + t.value, 0),
      count: filteredTransactions.length,
      month,
    });

  } catch (error) {
    console.error('Error fetching Powens transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

// Helper function to get or refresh Powens access token
// You'll need to implement this based on how you store and manage tokens
async function getOrRefreshPowensToken(): Promise<string | null> {
  try {
    // This is a placeholder - you'll need to implement proper token management
    // You might store tokens in the database or use a session storage
    // For now, we'll try to create a new session (this should be improved)
    const authResponse = await powensApi.createUser();
    return authResponse.access_token;
  } catch (error) {
    console.error('Error getting Powens access token:', error);
    return null;
  }
}