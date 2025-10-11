'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface ExtensionOperationsContextType {
  // Loading states
  uninstallingServiceId: string | null;
  installingServiceId: string | null;
  subscribingPlanId: string | null;

  // State setters
  setUninstallingServiceId: (id: string | null) => void;
  setInstallingServiceId: (id: string | null) => void;
  setSubscribingPlanId: (id: string | null) => void;

  // Helper functions
  isUninstalling: (serviceId: string) => boolean;
  isInstalling: (serviceId: string) => boolean;
  isSubscribing: (planId: string) => boolean;

  // Clear all loading states
  clearAllLoadingStates: () => void;
}

const ExtensionOperationsContext = createContext<
  ExtensionOperationsContextType | undefined
>(undefined);

export function ExtensionOperationsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [uninstallingServiceId, setUninstallingServiceId] = useState<
    string | null
  >(null);
  const [installingServiceId, setInstallingServiceId] = useState<string | null>(
    null
  );
  const [subscribingPlanId, setSubscribingPlanId] = useState<string | null>(
    null
  );

  const isUninstalling = (serviceId: string) =>
    uninstallingServiceId === serviceId;
  const isInstalling = (serviceId: string) => installingServiceId === serviceId;
  const isSubscribing = (planId: string) => subscribingPlanId === planId;

  const clearAllLoadingStates = () => {
    setUninstallingServiceId(null);
    setInstallingServiceId(null);
    setSubscribingPlanId(null);
  };

  const value: ExtensionOperationsContextType = {
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
  };

  return (
    <ExtensionOperationsContext.Provider value={value}>
      {children}
    </ExtensionOperationsContext.Provider>
  );
}

export function useExtensionOperations() {
  const context = useContext(ExtensionOperationsContext);
  if (context === undefined) {
    throw new Error(
      'useExtensionOperations must be used within an ExtensionOperationsProvider'
    );
  }
  return context;
}
