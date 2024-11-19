import { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { SUBSCRIPTION_PLANS, SubscriptionPlan } from '../../../types/subscription';
import { CheckCircle2 } from 'lucide-react';

export default function Subscription() {
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan>(SUBSCRIPTION_PLANS.trial);
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    setLoading(true);
    try {
      // Implementare logica di upgrade
      console.log('Upgrading to:', plan.name);
    } catch (error) {
      console.error('Error upgrading plan:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Il Tuo Abbonamento</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {Object.values(SUBSCRIPTION_PLANS).map((plan) => (
          <Card key={plan.id} className={`p-6 ${
            currentPlan.tier === plan.tier ? 'ring-2 ring-primary-500' : ''
          }`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{plan.name}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {plan.price === 0 ? 'Gratuito' : `€${plan.price}/mese`}
                </p>
              </div>
              {currentPlan.tier === plan.tier && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  Piano Attuale
                </span>
              )}
            </div>

            <ul className="mt-6 space-y-4">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex">
                  <CheckCircle2 className="h-5 w-5 text-primary-500 shrink-0" />
                  <span className="ml-3 text-sm text-gray-500">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              className="mt-8 w-full"
              variant={currentPlan.tier === plan.tier ? 'secondary' : 'primary'}
              disabled={currentPlan.tier === plan.tier || loading}
              onClick={() => handleUpgrade(plan)}
            >
              {currentPlan.tier === plan.tier
                ? 'Piano Attuale'
                : `Passa a ${plan.name}`}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}