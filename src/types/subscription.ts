export type SubscriptionTier = 'trial' | 'pro' | 'master';

export interface SubscriptionLimits {
  maxSubcoach: number;
  maxCoachee: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: SubscriptionTier;
  price: number;
  limits: SubscriptionLimits;
  features: string[];
}

export const DEFAULT_SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  trial: {
    id: 'trial',
    name: 'Trial',
    tier: 'trial',
    price: 0,
    limits: {
      maxSubcoach: 1,
      maxCoachee: 5,
    },
    features: [
      'Accesso base alla piattaforma',
      '1 subcoach',
      'Fino a 5 coachee',
      'Funzionalità essenziali',
      'Valido per 30 giorni',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    tier: 'pro',
    price: 49,
    limits: {
      maxSubcoach: 3,
      maxCoachee: 20,
    },
    features: [
      'Tutte le funzionalità Trial',
      'Fino a 3 subcoach',
      'Fino a 20 coachee',
      'Report avanzati',
      'Supporto prioritario',
    ],
  },
  master: {
    id: 'master',
    name: 'Master',
    tier: 'master',
    price: 99,
    limits: {
      maxSubcoach: 10,
      maxCoachee: 50,
    },
    features: [
      'Tutte le funzionalità Pro',
      'Fino a 10 subcoach',
      'Fino a 50 coachee',
      'API personalizzate',
      'Account manager dedicato',
    ],
  },
};

export const SUBSCRIPTION_PLANS = DEFAULT_SUBSCRIPTION_PLANS;