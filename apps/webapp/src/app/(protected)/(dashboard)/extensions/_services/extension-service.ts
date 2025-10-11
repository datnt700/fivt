import type {
  UserSubscription,
  Service,
  SubscriptionPlan,
} from '@/hooks/use-subscriptions';

/**
 * Service layer for extension-related API calls
 * Handles all extension, service, and plan operations for the extensions module
 */

/**
 * Get user's extension subscriptions
 */
export async function getUserExtensions(): Promise<UserSubscription[]> {
  const response = await fetch('/api/subscriptions');
  if (!response.ok) {
    throw new Error('Failed to fetch user extensions');
  }
  const data = await response.json();
  // The API returns the subscriptions directly, not in a wrapper object
  return Array.isArray(data) ? data : data.subscriptions || [];
}

/**
 * Get all available extension services
 */
export async function getExtensionServices(): Promise<Service[]> {
  const response = await fetch('/api/services');
  if (!response.ok) {
    throw new Error('Failed to fetch extension services');
  }
  return response.json();
}

/**
 * Get all extension plans
 */
export async function getExtensionPlans(): Promise<SubscriptionPlan[]> {
  const response = await fetch('/api/subscription-plans');
  if (!response.ok) {
    throw new Error('Failed to fetch extension plans');
  }
  return response.json();
}

/**
 * Install an extension or plan
 */
export async function installExtension(params: {
  serviceId?: string;
  planId?: string;
}) {
  const response = await fetch('/api/subscriptions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Failed to install extension');
  }

  return response.json();
}

/**
 * Uninstall an extension
 */
export async function uninstallExtension(serviceId: string) {
  const response = await fetch(`/api/subscriptions?serviceId=${serviceId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to uninstall extension');
  }

  return response.json();
}

// Export as a service object for easier importing
export const extensionService = {
  getUserExtensions,
  getExtensionServices,
  getExtensionPlans,
  installExtension,
  uninstallExtension,
};
