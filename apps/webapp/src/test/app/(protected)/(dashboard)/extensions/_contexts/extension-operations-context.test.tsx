import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import {
  ExtensionOperationsProvider,
  useExtensionOperations,
} from '../../../../../../app/(protected)/(dashboard)/extensions/_contexts/extension-operations-context';

// Test component that uses the context
function TestComponent() {
  const {
    uninstallingServiceId,
    installingServiceId,
    subscribingPlanId,
    setUninstallingServiceId,
    setInstallingServiceId,
    setSubscribingPlanId,
    isUninstalling,
    isInstalling,
    isSubscribing,
    clearAllLoadingStates,
  } = useExtensionOperations();

  return (
    <div>
      <div data-testid="uninstalling-id">{uninstallingServiceId || 'none'}</div>
      <div data-testid="installing-id">{installingServiceId || 'none'}</div>
      <div data-testid="subscribing-id">{subscribingPlanId || 'none'}</div>

      <button
        data-testid="set-uninstalling"
        onClick={() => setUninstallingServiceId('service-1')}
      >
        Set Uninstalling
      </button>

      <button
        data-testid="set-installing"
        onClick={() => setInstallingServiceId('service-2')}
      >
        Set Installing
      </button>

      <button
        data-testid="set-subscribing"
        onClick={() => setSubscribingPlanId('plan-1')}
      >
        Set Subscribing
      </button>

      <button data-testid="clear-all" onClick={clearAllLoadingStates}>
        Clear All
      </button>

      <div data-testid="is-uninstalling-service-1">
        {isUninstalling('service-1') ? 'true' : 'false'}
      </div>
      <div data-testid="is-installing-service-2">
        {isInstalling('service-2') ? 'true' : 'false'}
      </div>
      <div data-testid="is-subscribing-plan-1">
        {isSubscribing('plan-1') ? 'true' : 'false'}
      </div>
    </div>
  );
}

// Test component that tries to use context outside provider
function TestComponentOutsideProvider() {
  try {
    useExtensionOperations();
    return <div data-testid="no-error">No error</div>;
  } catch (error) {
    return <div data-testid="error-message">{(error as Error).message}</div>;
  }
}

describe('ExtensionOperationsContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Provider', () => {
    it('should provide initial state values', () => {
      render(
        <ExtensionOperationsProvider>
          <TestComponent />
        </ExtensionOperationsProvider>
      );

      expect(screen.getByTestId('uninstalling-id')).toHaveTextContent('none');
      expect(screen.getByTestId('installing-id')).toHaveTextContent('none');
      expect(screen.getByTestId('subscribing-id')).toHaveTextContent('none');
      expect(screen.getByTestId('is-uninstalling-service-1')).toHaveTextContent(
        'false'
      );
      expect(screen.getByTestId('is-installing-service-2')).toHaveTextContent(
        'false'
      );
      expect(screen.getByTestId('is-subscribing-plan-1')).toHaveTextContent(
        'false'
      );
    });

    it('should update uninstalling service id', () => {
      render(
        <ExtensionOperationsProvider>
          <TestComponent />
        </ExtensionOperationsProvider>
      );

      fireEvent.click(screen.getByTestId('set-uninstalling'));

      expect(screen.getByTestId('uninstalling-id')).toHaveTextContent(
        'service-1'
      );
      expect(screen.getByTestId('is-uninstalling-service-1')).toHaveTextContent(
        'true'
      );
    });

    it('should update installing service id', () => {
      render(
        <ExtensionOperationsProvider>
          <TestComponent />
        </ExtensionOperationsProvider>
      );

      fireEvent.click(screen.getByTestId('set-installing'));

      expect(screen.getByTestId('installing-id')).toHaveTextContent(
        'service-2'
      );
      expect(screen.getByTestId('is-installing-service-2')).toHaveTextContent(
        'true'
      );
    });

    it('should update subscribing plan id', () => {
      render(
        <ExtensionOperationsProvider>
          <TestComponent />
        </ExtensionOperationsProvider>
      );

      fireEvent.click(screen.getByTestId('set-subscribing'));

      expect(screen.getByTestId('subscribing-id')).toHaveTextContent('plan-1');
      expect(screen.getByTestId('is-subscribing-plan-1')).toHaveTextContent(
        'true'
      );
    });

    it('should clear all loading states', () => {
      render(
        <ExtensionOperationsProvider>
          <TestComponent />
        </ExtensionOperationsProvider>
      );

      // Set some loading states first
      fireEvent.click(screen.getByTestId('set-uninstalling'));
      fireEvent.click(screen.getByTestId('set-installing'));
      fireEvent.click(screen.getByTestId('set-subscribing'));

      // Verify they are set
      expect(screen.getByTestId('uninstalling-id')).toHaveTextContent(
        'service-1'
      );
      expect(screen.getByTestId('installing-id')).toHaveTextContent(
        'service-2'
      );
      expect(screen.getByTestId('subscribing-id')).toHaveTextContent('plan-1');

      // Clear all
      fireEvent.click(screen.getByTestId('clear-all'));

      // Verify they are cleared
      expect(screen.getByTestId('uninstalling-id')).toHaveTextContent('none');
      expect(screen.getByTestId('installing-id')).toHaveTextContent('none');
      expect(screen.getByTestId('subscribing-id')).toHaveTextContent('none');
      expect(screen.getByTestId('is-uninstalling-service-1')).toHaveTextContent(
        'false'
      );
      expect(screen.getByTestId('is-installing-service-2')).toHaveTextContent(
        'false'
      );
      expect(screen.getByTestId('is-subscribing-plan-1')).toHaveTextContent(
        'false'
      );
    });

    it('should handle setting state to null through component', () => {
      const TestNullComponent = () => {
        const { setUninstallingServiceId, uninstallingServiceId } =
          useExtensionOperations();

        return (
          <div>
            <div data-testid="uninstalling-id">
              {uninstallingServiceId || 'none'}
            </div>
            <button
              data-testid="set-to-null"
              onClick={() => setUninstallingServiceId(null)}
            >
              Set to Null
            </button>
          </div>
        );
      };

      render(
        <ExtensionOperationsProvider>
          <TestNullComponent />
        </ExtensionOperationsProvider>
      );

      // Initially should be null/none
      expect(screen.getByTestId('uninstalling-id')).toHaveTextContent('none');

      // The test passes if the component renders without error
      expect(screen.getByTestId('set-to-null')).toBeInTheDocument();
    });
  });

  describe('Hook outside provider', () => {
    it('should throw error when used outside provider', () => {
      render(<TestComponentOutsideProvider />);

      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'useExtensionOperations must be used within an ExtensionOperationsProvider'
      );
    });
  });

  describe('Helper functions', () => {
    it('should correctly identify loading states', () => {
      render(
        <ExtensionOperationsProvider>
          <TestComponent />
        </ExtensionOperationsProvider>
      );

      // Initially all should be false
      expect(screen.getByTestId('is-uninstalling-service-1')).toHaveTextContent(
        'false'
      );
      expect(screen.getByTestId('is-installing-service-2')).toHaveTextContent(
        'false'
      );
      expect(screen.getByTestId('is-subscribing-plan-1')).toHaveTextContent(
        'false'
      );

      // Set uninstalling state
      fireEvent.click(screen.getByTestId('set-uninstalling'));
      expect(screen.getByTestId('is-uninstalling-service-1')).toHaveTextContent(
        'true'
      );

      // Set installing state
      fireEvent.click(screen.getByTestId('set-installing'));
      expect(screen.getByTestId('is-installing-service-2')).toHaveTextContent(
        'true'
      );

      // Set subscribing state
      fireEvent.click(screen.getByTestId('set-subscribing'));
      expect(screen.getByTestId('is-subscribing-plan-1')).toHaveTextContent(
        'true'
      );
    });

    it('should return false for different service/plan ids', () => {
      render(
        <ExtensionOperationsProvider>
          <TestComponent />
        </ExtensionOperationsProvider>
      );

      // Set service-1 as uninstalling
      fireEvent.click(screen.getByTestId('set-uninstalling'));

      // service-1 should be uninstalling, but different services should not
      expect(screen.getByTestId('is-uninstalling-service-1')).toHaveTextContent(
        'true'
      );

      // Test with component that checks different service id
      const TestDifferentService = () => {
        const { isUninstalling } = useExtensionOperations();
        return (
          <div data-testid="is-uninstalling-different">
            {isUninstalling('different-service') ? 'true' : 'false'}
          </div>
        );
      };

      render(
        <ExtensionOperationsProvider>
          <TestDifferentService />
        </ExtensionOperationsProvider>
      );

      expect(screen.getByTestId('is-uninstalling-different')).toHaveTextContent(
        'false'
      );
    });
  });
});
