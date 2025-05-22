// Store and retrieve redirect paths for authentication

// Local storage key for redirect path
const REDIRECT_KEY = 'auth_redirect_path';

/**
 * Save the intended destination path to redirect to after authentication
 * @param path - The path to redirect to after successful authentication
 */
export const saveRedirectPath = (path: string): void => {
  if (path && path !== '/login') {
    localStorage.setItem(REDIRECT_KEY, path);
  }
};

/**
 * Get and clear the saved redirect path
 * @returns The saved redirect path or '/' if none exists
 */
export const getAndClearRedirectPath = (): string => {
  const redirectPath = localStorage.getItem(REDIRECT_KEY) || '/';
  localStorage.removeItem(REDIRECT_KEY);
  return redirectPath;
};

/**
 * Get the URL to redirect to after authentication
 * This appends the current origin to create a full URL
 */
export const getRedirectUrl = (): string => {
  return window.location.origin;
};
