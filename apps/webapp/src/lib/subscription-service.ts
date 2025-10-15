import { ServiceType } from '@prisma/client';
import { Session } from 'next-auth';
import { prisma } from '@/lib/prisma';

/**
 * Check if user has access to a specific service
 */
export async function hasServiceAccess(
  userId: string,
  serviceType: ServiceType
): Promise<boolean> {
  try {
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId,
        service: {
          type: serviceType,
        },
        status: 'ACTIVE',
        OR: [
          { endDate: null }, // No end date (lifetime)
          { endDate: { gt: new Date() } }, // Not expired
        ],
      },
    });

    return !!subscription;
  } catch (error) {
    console.error('Error checking service access:', error);
    return false;
  }
}

/**
 * Get all active services for a user
 */
export async function getUserActiveServices(userId: string) {
  try {
    const subscriptions = await prisma.userSubscription.findMany({
      where: {
        userId,
        status: 'ACTIVE',
        OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
      },
      include: {
        service: true,
      },
    });

    return subscriptions.map(sub => sub.service);
  } catch (error) {
    console.error('Error getting user services:', error);
    return [];
  }
}

/**
 * Subscribe user to a service
 */
export async function subscribeToService(
  userId: string,
  serviceId: string,
  endDate?: Date
) {
  try {
    return await prisma.userSubscription.upsert({
      where: {
        userId_serviceId: {
          userId,
          serviceId,
        },
      },
      update: {
        status: 'ACTIVE',
        startDate: new Date(),
        endDate,
        autoRenew: true,
      },
      create: {
        userId,
        serviceId,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate,
        autoRenew: true,
      },
    });
  } catch (error) {
    console.error('Error subscribing to service:', error);
    throw error;
  }
}

/**
 * Unsubscribe user from a service
 */
export async function unsubscribeFromService(
  userId: string,
  serviceId: string
) {
  try {
    return await prisma.userSubscription.update({
      where: {
        userId_serviceId: {
          userId,
          serviceId,
        },
      },
      data: {
        status: 'CANCELLED',
        autoRenew: false,
      },
    });
  } catch (error) {
    console.error('Error unsubscribing from service:', error);
    throw error;
  }
}

/**
 * Check service access for session-based requests
 */
export async function requireServiceAccess(
  session: Session | null,
  serviceType: ServiceType
): Promise<boolean> {
  if (!session?.user?.id) {
    return false;
  }

  return hasServiceAccess(session.user.id, serviceType);
}

/**
 * Service access guard for pages
 */
export function withServiceAccess(serviceType: ServiceType) {
  return async function guard(userId: string) {
    const hasAccess = await hasServiceAccess(userId, serviceType);

    if (!hasAccess) {
      throw new Error(`Access denied: ${serviceType} service not subscribed`);
    }

    return true;
  };
}
