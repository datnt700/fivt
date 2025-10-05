/**
 * Platform detection utilities for optimizing Powens webview integration
 * Based on https://docs.powens.com/api-reference/overview/webview#integration-guidelines
 */

export function isPlatformMobile(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

export function isPlatformIOS(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export function isPlatformAndroid(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /Android/.test(navigator.userAgent);
}

export function openPowensWebview(url: string): void {
  const isMobile = isPlatformMobile();

  // For QR code support, we need to open in a popup/new tab instead of full redirect
  // This allows users to see both QR code and desktop login options
  
  if (isMobile) {
    // On mobile, open in new tab to allow QR code scanning or app-to-app
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    
    // Fallback to current window if popup was blocked
    if (!newWindow || newWindow.closed) {
      window.location.replace(url);
    }
  } else {
    // Desktop: Open in popup window to show QR code + desktop options
    // Size optimized for banking webview
    const width = 480;
    const height = 720;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    const newWindow = window.open(
      url, 
      'powens-connect',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,status=no,toolbar=no,menubar=no,location=no`
    );
    
    // Fallback to full redirect if popup was blocked
    if (!newWindow || newWindow.closed) {
      console.log('Popup blocked, falling back to full redirect');
      window.location.replace(url);
    } else {
      // Focus the popup window
      newWindow.focus();
    }
  }
}

export function getPowensWebviewRecommendations() {
  const isMobile = isPlatformMobile();
  const isIOS = isPlatformIOS();
  const isAndroid = isPlatformAndroid();

  if (isAndroid) {
    return {
      platform: 'android',
      recommendation: 'Chrome Custom Tabs',
      note: 'For native Android apps, use Chrome Custom Tabs library for optimal app-to-app support'
    };
  }

  if (isIOS) {
    return {
      platform: 'ios',
      recommendation: 'SFSafariViewController',
      note: 'For native iOS apps, use SFSafariViewController for optimal app-to-app support'
    };
  }

  if (isMobile) {
    return {
      platform: 'mobile-web',
      recommendation: 'New tab/window',
      note: 'Opening in new tab to maximize app-to-app support on mobile browsers'
    };
  }

  return {
    platform: 'desktop-web',
    recommendation: 'Full-page redirect',
    note: 'Full-page redirect provides best experience for desktop banking flows'
  };
}