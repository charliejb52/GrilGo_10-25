/**
 * Get the backend API base URL
 * Uses VITE_API_URL in production, localhost in development
 */
export function getApiUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL;
  
  // Debug: Log in console to help troubleshoot
  if (typeof window !== 'undefined') {
    console.log('[API] VITE_API_URL:', apiUrl || 'NOT SET');
    console.log('[API] import.meta.env:', {
      MODE: import.meta.env.MODE,
      PROD: import.meta.env.PROD,
      DEV: import.meta.env.DEV,
    });
  }
  
  // If VITE_API_URL is set, use it (production)
  if (apiUrl && apiUrl.trim()) {
    // Remove trailing slash if present
    return apiUrl.trim().replace(/\/$/, '');
  }
  
  // Fallback to localhost for development (will use Vite proxy)
  // In production, this means the env var wasn't set!
  if (import.meta.env.PROD) {
    console.error('[API] WARNING: VITE_API_URL is not set in production!');
    console.error('[API] Please set VITE_API_URL in Vercel environment variables and redeploy.');
  }
  
  return '';
}

/**
 * Build a full API endpoint URL
 */
export function getApiEndpoint(path: string): string {
  const baseUrl = getApiUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // If baseUrl is empty (development), use proxy path
  if (!baseUrl) {
    return `/api${cleanPath}`;
  }
  
  // Production: use full Railway URL
  return `${baseUrl}/api${cleanPath}`;
}

