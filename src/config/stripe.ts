export interface StripeConfig {
  publicKey: string;
  clientId: string;
  mode: 'test' | 'live';
  webhookSecret: string;
  connected: boolean;
  accountId?: string;
}

export const DEFAULT_STRIPE_CONFIG: StripeConfig = {
  publicKey: '',
  clientId: '',
  mode: 'test',
  webhookSecret: '',
  connected: false,
};

export const getStripeConnectUrl = (clientId: string, mode: 'test' | 'live') => {
  const redirectUri = `${window.location.origin}/admin/settings/stripe/callback`;
  const state = Math.random().toString(36).substring(7);
  
  const params = new URLSearchParams({
    client_id: clientId,
    state,
    scope: 'read_write',
    response_type: 'code',
    redirect_uri: redirectUri,
  });

  return `https://connect.stripe.com/oauth/authorize?${params.toString()}`;
};