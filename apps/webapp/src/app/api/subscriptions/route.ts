import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscriptions = await prisma.userSubscription.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        service: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error('Error fetching user subscriptions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { serviceId, planId } = body;

    if (!serviceId && !planId) {
      return NextResponse.json(
        { error: 'Service ID or Plan ID is required' },
        { status: 400 }
      );
    }

    if (planId) {
      // Subscribe to multiple services in a plan
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { id: planId },
      });

      if (!plan) {
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
      }

      const subscriptions = [];
      for (const serviceId of plan.serviceIds) {
        const subscription = await prisma.userSubscription.upsert({
          where: {
            userId_serviceId: {
              userId: session.user.id,
              serviceId,
            },
          },
          update: {
            status: 'ACTIVE',
            startDate: new Date(),
            autoRenew: true,
          },
          create: {
            userId: session.user.id,
            serviceId,
            status: 'ACTIVE',
            startDate: new Date(),
            autoRenew: true,
          },
          include: {
            service: true,
          },
        });
        subscriptions.push(subscription);
      }

      return NextResponse.json({ subscriptions, plan });
    } else {
      // Subscribe to single service
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
      });

      if (!service) {
        return NextResponse.json(
          { error: 'Service not found' },
          { status: 404 }
        );
      }

      const subscription = await prisma.userSubscription.upsert({
        where: {
          userId_serviceId: {
            userId: session.user.id,
            serviceId,
          },
        },
        update: {
          status: 'ACTIVE',
          startDate: new Date(),
          autoRenew: true,
        },
        create: {
          userId: session.user.id,
          serviceId,
          status: 'ACTIVE',
          startDate: new Date(),
          autoRenew: true,
        },
        include: {
          service: true,
        },
      });

      return NextResponse.json(subscription);
    }
  } catch (error) {
    console.error('Error subscribing to service:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');

    if (!serviceId) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }

    const subscription = await prisma.userSubscription.update({
      where: {
        userId_serviceId: {
          userId: session.user.id,
          serviceId,
        },
      },
      data: {
        status: 'CANCELLED',
        autoRenew: false,
      },
      include: {
        service: true,
      },
    });

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Error unsubscribing from service:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
