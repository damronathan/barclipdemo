import { PublicClientApplication } from '@azure/msal-browser';

console.log('Environment variables:', {
    clientId: process.env.REACT_APP_CLIENT_ID,
    authority: process.env.REACT_APP_AUTHORITY,
    redirectUri: process.env.REACT_APP_REDIRECT_URI,
    apiScope: process.env.REACT_APP_API_SCOPE
  });
export const msalInstance = new PublicClientApplication({
  auth: {
    clientId: process.env.REACT_APP_CLIENT_ID || '',
    authority: process.env.REACT_APP_AUTHORITY || '',
    redirectUri: process.env.REACT_APP_REDIRECT_URI || '', 
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
});

export async function signIn() {
  const loginRequest = {
    scopes: [process.env.REACT_APP_API_SCOPE || 'openid'],
    prompt: 'login'
  };

  try {
    // This will generate the dynamic URL and redirect automatically
    await msalInstance.loginRedirect(loginRequest);
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}




