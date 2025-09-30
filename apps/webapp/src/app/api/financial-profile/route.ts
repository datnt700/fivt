/**
 * Financial Profile API Endpoint
 * Handles CRUD operations for user financial profiles
 * 
 * Endpoints:
 * GET /api/financial-profile - Get current user's financial profile
 * POST /api/financial-profile - Create/update user's financial profile
 * DELETE /api/financial-profile - Delete user's financial profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import {
  calculateFinancialProfile,
  validateFinancialInput
} from '@/lib/financial-profile-calculator';
import {
  FinancialProfileInput
} from '@/types/financial-profile';

/**
 * GET /api/financial-profile
 * Retrieve the current user's financial profile
 */
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: For now, return mock data since we don't have profile storage in DB yet
    // In the future, this will query the database for the user's stored profile
    
    // Check if user has any financial data we can use to calculate profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        transactions: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // User hasn't completed their financial profile yet
    return NextResponse.json({
      error: 'Financial profile not found',
      message: 'User needs to complete their financial profile setup'
    }, { status: 404 });

  } catch (error) {
    console.error('Error fetching financial profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/financial-profile
 * Create or update the current user's financial profile
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate the financial input data
    const validation = validateFinancialInput(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Invalid financial data', 
          details: validation.errors 
        },
        { status: 400 }
      );
    }

    // Calculate the financial profile
    const result = calculateFinancialProfile(body as FinancialProfileInput);

    // TODO: Store the profile in the database
    // For now, we'll just return the calculated profile
    // In the future, add a FinancialProfile model to Prisma schema and save here
    
    /*
    // Future implementation:
    const savedProfile = await prisma.financialProfile.upsert({
      where: { userId: session.user.id },
      update: {
        profileData: result.profile,
        lastCalculated: new Date(),
      },
      create: {
        userId: session.user.id,
        profileData: result.profile,
        lastCalculated: new Date(),
      }
    });
    */

    return NextResponse.json({
      success: true,
      profile: result.profile,
      insights: result.insights,
      recommendations: result.recommendations,
      calculatedAt: new Date().toISOString(),
      message: 'Financial profile calculated successfully'
    });

  } catch (error) {
    console.error('Error creating/updating financial profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/financial-profile
 * Delete the current user's financial profile
 */
export async function DELETE() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Delete from database when FinancialProfile model is added
    /*
    await prisma.financialProfile.delete({
      where: { userId: session.user.id }
    });
    */

    return NextResponse.json({
      success: true,
      message: 'Financial profile deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting financial profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/financial-profile/recalculate
 * Recalculate profile using existing user data
 */
export async function PUT() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Fetch user's financial data from various sources
    // - Bank connections (Bridge/Powens)
    // - Transactions
    // - Manual inputs
    // Then recalculate profile

    return NextResponse.json({
      success: true,
      message: 'Profile recalculation not yet implemented',
      todo: 'Implement data aggregation from user sources'
    });

  } catch (error) {
    console.error('Error recalculating financial profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}