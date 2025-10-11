import { describe, it, expect } from 'vitest';
import type {
  ExtensionType,
  ExtensionFeature,
  ExtensionDashboard,
  SubscriptionFeature,
  SubscriptionPlansData,
  Service,
  ServicesData,
} from '../../../../../../app/(protected)/(dashboard)/extensions/_types';

describe('Extension Types', () => {
  describe('ExtensionType', () => {
    it('should accept valid extension type values', () => {
      const validTypes: ExtensionType[] = [
        'BANKING',
        'PRODUCTIVITY',
        'ANALYTICS',
        'FINANCE',
      ];

      validTypes.forEach(type => {
        expect(typeof type).toBe('string');
        expect(['BANKING', 'PRODUCTIVITY', 'ANALYTICS', 'FINANCE']).toContain(
          type
        );
      });
    });
  });

  describe('ExtensionFeature', () => {
    it('should have correct structure for extension feature', () => {
      const feature: ExtensionFeature = {
        id: 'feature-1',
        title: 'Test Feature',
        description: 'Test feature description',
        icon: '🔧',
      };

      expect(feature).toHaveProperty('id');
      expect(feature).toHaveProperty('title');
      expect(feature).toHaveProperty('description');
      expect(feature).toHaveProperty('icon');
      expect(typeof feature.id).toBe('string');
      expect(typeof feature.title).toBe('string');
      expect(typeof feature.description).toBe('string');
      expect(typeof feature.icon).toBe('string');
    });

    it('should handle feature with minimal required properties', () => {
      const feature: ExtensionFeature = {
        id: 'minimal-feature',
        title: 'Minimal',
        description: 'Minimal description',
        icon: '⚡',
      };

      expect(feature.id).toBe('minimal-feature');
      expect(feature.title).toBe('Minimal');
      expect(feature.description).toBe('Minimal description');
      expect(feature.icon).toBe('⚡');
    });
  });

  describe('ExtensionDashboard', () => {
    it('should have correct structure for extension dashboard', () => {
      const dashboard: ExtensionDashboard = {
        id: 'dashboard-1',
        title: 'Test Dashboard',
        description: 'Test dashboard description',
        url: '/dashboard/test',
        icon: '📊',
        isActive: true,
      };

      expect(dashboard).toHaveProperty('id');
      expect(dashboard).toHaveProperty('title');
      expect(dashboard).toHaveProperty('description');
      expect(dashboard).toHaveProperty('url');
      expect(dashboard).toHaveProperty('icon');
      expect(dashboard).toHaveProperty('isActive');
      expect(typeof dashboard.id).toBe('string');
      expect(typeof dashboard.title).toBe('string');
      expect(typeof dashboard.description).toBe('string');
      expect(typeof dashboard.url).toBe('string');
      expect(typeof dashboard.icon).toBe('string');
      expect(typeof dashboard.isActive).toBe('boolean');
    });

    it('should handle dashboard with inactive state', () => {
      const dashboard: ExtensionDashboard = {
        id: 'inactive-dashboard',
        title: 'Inactive Dashboard',
        description: 'This dashboard is inactive',
        url: '/dashboard/inactive',
        icon: '❌',
        isActive: false,
      };

      expect(dashboard.isActive).toBe(false);
    });
  });

  describe('SubscriptionFeature', () => {
    it('should have correct structure for subscription feature', () => {
      const feature: SubscriptionFeature = {
        id: 'sub-feature-1',
        name: 'Premium Feature',
        description: 'Premium feature description',
        isIncluded: true,
      };

      expect(feature).toHaveProperty('id');
      expect(feature).toHaveProperty('name');
      expect(feature).toHaveProperty('description');
      expect(feature).toHaveProperty('isIncluded');
      expect(typeof feature.id).toBe('string');
      expect(typeof feature.name).toBe('string');
      expect(typeof feature.description).toBe('string');
      expect(typeof feature.isIncluded).toBe('boolean');
    });

    it('should handle feature that is not included', () => {
      const feature: SubscriptionFeature = {
        id: 'excluded-feature',
        name: 'Excluded Feature',
        description: 'This feature is not included',
        isIncluded: false,
      };

      expect(feature.isIncluded).toBe(false);
    });
  });

  describe('SubscriptionPlansData', () => {
    it('should have correct structure for subscription plans data', () => {
      const plansData: SubscriptionPlansData = {
        plans: [
          {
            id: 'basic',
            name: 'Basic Plan',
            description: 'Basic plan description',
            price: 9.99,
            currency: 'USD',
            interval: 'monthly',
            features: [
              {
                id: 'feature-1',
                name: 'Feature 1',
                description: 'Feature 1 description',
                isIncluded: true,
              },
            ],
            serviceId: 'service-1',
            isPopular: false,
          },
        ],
        success: true,
      };

      expect(plansData).toHaveProperty('plans');
      expect(plansData).toHaveProperty('success');
      expect(Array.isArray(plansData.plans)).toBe(true);
      expect(typeof plansData.success).toBe('boolean');
      expect(plansData.plans[0]).toHaveProperty('id');
      expect(plansData.plans[0]).toHaveProperty('name');
      expect(plansData.plans[0]).toHaveProperty('description');
      expect(plansData.plans[0]).toHaveProperty('price');
      expect(plansData.plans[0]).toHaveProperty('currency');
      expect(plansData.plans[0]).toHaveProperty('interval');
      expect(plansData.plans[0]).toHaveProperty('features');
      expect(plansData.plans[0]).toHaveProperty('serviceId');
      expect(plansData.plans[0]).toHaveProperty('isPopular');
    });

    it('should handle empty plans array', () => {
      const plansData: SubscriptionPlansData = {
        plans: [],
        success: true,
      };

      expect(plansData.plans).toHaveLength(0);
      expect(plansData.success).toBe(true);
    });

    it('should handle failed response', () => {
      const plansData: SubscriptionPlansData = {
        plans: [],
        success: false,
      };

      expect(plansData.success).toBe(false);
    });
  });

  describe('Service', () => {
    it('should have correct structure for service', () => {
      const service: Service = {
        id: 'service-1',
        name: 'Test Service',
        description: 'Test service description',
        icon: '🛠️',
        type: 'BANKING',
        isInstalled: false,
        hasSubscription: false,
        installUrl: '/install/service-1',
        uninstallUrl: '/uninstall/service-1',
        dashboardUrl: '/dashboard/service-1',
        features: [
          {
            id: 'feature-1',
            title: 'Feature 1',
            description: 'Feature 1 description',
            icon: '⭐',
          },
        ],
        dashboards: [
          {
            id: 'dashboard-1',
            title: 'Dashboard 1',
            description: 'Dashboard 1 description',
            url: '/dashboard/1',
            icon: '📊',
            isActive: true,
          },
        ],
      };

      expect(service).toHaveProperty('id');
      expect(service).toHaveProperty('name');
      expect(service).toHaveProperty('description');
      expect(service).toHaveProperty('icon');
      expect(service).toHaveProperty('type');
      expect(service).toHaveProperty('isInstalled');
      expect(service).toHaveProperty('hasSubscription');
      expect(service).toHaveProperty('installUrl');
      expect(service).toHaveProperty('uninstallUrl');
      expect(service).toHaveProperty('dashboardUrl');
      expect(service).toHaveProperty('features');
      expect(service).toHaveProperty('dashboards');
      expect(typeof service.id).toBe('string');
      expect(typeof service.name).toBe('string');
      expect(typeof service.description).toBe('string');
      expect(typeof service.icon).toBe('string');
      expect(['BANKING', 'PRODUCTIVITY', 'ANALYTICS', 'FINANCE']).toContain(
        service.type
      );
      expect(typeof service.isInstalled).toBe('boolean');
      expect(typeof service.hasSubscription).toBe('boolean');
      expect(Array.isArray(service.features)).toBe(true);
      expect(Array.isArray(service.dashboards)).toBe(true);
    });

    it('should handle service with installed state', () => {
      const service: Service = {
        id: 'installed-service',
        name: 'Installed Service',
        description: 'This service is installed',
        icon: '✅',
        type: 'PRODUCTIVITY',
        isInstalled: true,
        hasSubscription: true,
        installUrl: '/install/installed-service',
        uninstallUrl: '/uninstall/installed-service',
        dashboardUrl: '/dashboard/installed-service',
        features: [],
        dashboards: [],
      };

      expect(service.isInstalled).toBe(true);
      expect(service.hasSubscription).toBe(true);
      expect(service.type).toBe('PRODUCTIVITY');
    });

    it('should handle service with empty features and dashboards', () => {
      const service: Service = {
        id: 'minimal-service',
        name: 'Minimal Service',
        description: 'Minimal service with no features',
        icon: '📦',
        type: 'ANALYTICS',
        isInstalled: false,
        hasSubscription: false,
        installUrl: '/install/minimal-service',
        uninstallUrl: '/uninstall/minimal-service',
        dashboardUrl: '/dashboard/minimal-service',
        features: [],
        dashboards: [],
      };

      expect(service.features).toHaveLength(0);
      expect(service.dashboards).toHaveLength(0);
    });
  });

  describe('ServicesData', () => {
    it('should have correct structure for services data', () => {
      const servicesData: ServicesData = {
        services: [
          {
            id: 'service-1',
            name: 'Service 1',
            description: 'Service 1 description',
            icon: '🔧',
            type: 'BANKING',
            isInstalled: false,
            hasSubscription: false,
            installUrl: '/install/service-1',
            uninstallUrl: '/uninstall/service-1',
            dashboardUrl: '/dashboard/service-1',
            features: [],
            dashboards: [],
          },
        ],
        success: true,
      };

      expect(servicesData).toHaveProperty('services');
      expect(servicesData).toHaveProperty('success');
      expect(Array.isArray(servicesData.services)).toBe(true);
      expect(typeof servicesData.success).toBe('boolean');
      expect(servicesData.services[0]).toHaveProperty('id');
      expect(servicesData.services[0]).toHaveProperty('name');
      expect(servicesData.services[0]).toHaveProperty('type');
    });

    it('should handle empty services array', () => {
      const servicesData: ServicesData = {
        services: [],
        success: true,
      };

      expect(servicesData.services).toHaveLength(0);
      expect(servicesData.success).toBe(true);
    });

    it('should handle failed response', () => {
      const servicesData: ServicesData = {
        services: [],
        success: false,
      };

      expect(servicesData.success).toBe(false);
    });

    it('should handle multiple services with different types', () => {
      const servicesData: ServicesData = {
        services: [
          {
            id: 'banking-service',
            name: 'Banking Service',
            description: 'Banking service description',
            icon: '🏦',
            type: 'BANKING',
            isInstalled: true,
            hasSubscription: false,
            installUrl: '/install/banking-service',
            uninstallUrl: '/uninstall/banking-service',
            dashboardUrl: '/dashboard/banking-service',
            features: [],
            dashboards: [],
          },
          {
            id: 'productivity-service',
            name: 'Productivity Service',
            description: 'Productivity service description',
            icon: '⚡',
            type: 'PRODUCTIVITY',
            isInstalled: false,
            hasSubscription: true,
            installUrl: '/install/productivity-service',
            uninstallUrl: '/uninstall/productivity-service',
            dashboardUrl: '/dashboard/productivity-service',
            features: [],
            dashboards: [],
          },
        ],
        success: true,
      };

      expect(servicesData.services).toHaveLength(2);
      expect(servicesData.services[0].type).toBe('BANKING');
      expect(servicesData.services[1].type).toBe('PRODUCTIVITY');
      expect(servicesData.services[0].isInstalled).toBe(true);
      expect(servicesData.services[1].isInstalled).toBe(false);
    });
  });
});
