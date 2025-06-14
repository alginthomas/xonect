
/**
 * Utility functions for batch navigation and URL management
 */

export const navigateToBatchLeads = (batchId: string, batchName?: string) => {
  console.log('🔗 Navigating to batch leads:', { batchId, batchName });
  
  // Update the URL with proper batch parameter
  const url = new URL(window.location.origin);
  url.searchParams.set('tab', 'leads');
  url.searchParams.set('batch', batchId);
  
  // Update browser history without triggering a page reload
  window.history.pushState(
    { tab: 'leads', batch: batchId, batchName }, 
    '', 
    url.toString()
  );
  
  // Trigger a custom event to notify components of the navigation
  window.dispatchEvent(new CustomEvent('batchNavigated', {
    detail: { batchId, batchName }
  }));
  
  console.log('✅ Navigation completed to:', url.toString());
};

export const getBatchFromURL = (): { batchId: string | null; tabFromURL: string | null } => {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    batchId: urlParams.get('batch'),
    tabFromURL: urlParams.get('tab')
  };
};

export const clearBatchFromURL = () => {
  const url = new URL(window.location.href);
  url.searchParams.delete('batch');
  window.history.replaceState({}, '', url.toString());
};

export const validateBatchExists = (batchId: string, importBatches: any[]): boolean => {
  return importBatches.some(batch => batch.id === batchId);
};
