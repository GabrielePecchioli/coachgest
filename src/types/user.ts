export type UserRole = 'super_admin' | 'coach' | 'subcoach' | 'coachee';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  nome: string;
  cognome: string;
  coachId?: string;
  subcoachId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'suspended' | 'cancelled';
  renewalDate: Date;
  maxCoachee: number;
  maxSubcoach: number;
  features: string[];
}