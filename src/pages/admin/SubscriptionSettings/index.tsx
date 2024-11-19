import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { DEFAULT_SUBSCRIPTION_PLANS, SubscriptionPlan, SubscriptionTier } from '../../../types/subscription';

export default function SubscriptionSettings() {
  const [plans, setPlans] = useState<Record<SubscriptionTier, SubscriptionPlan>>(DEFAULT_SUBSCRIPTION_PLANS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const docRef = doc(db, 'config', 'subscriptions');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setPlans(docSnap.data() as typeof plans);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await setDoc(doc(db, 'config', 'subscriptions'), plans);
      setMessage({ type: 'success', text: 'Piani di abbonamento aggiornati con successo' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Errore durante il salvataggio' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setPlans(DEFAULT_SUBSCRIPTION_PLANS);
  };

  const updatePlan = (tier: SubscriptionTier, field: string, value: any) => {
    setPlans(prev => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        [field]: value,
      },
    }));
  };

  const updateFeature = (tier: SubscriptionTier, index: number, value: string) => {
    const newPlans = { ...plans };
    newPlans[tier].features[index] = value;
    setPlans(newPlans);
  };

  if (loading) {
    return <div>Caricamento...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestione Piani di Abbonamento</h1>
        <div className="space-x-3">
          <Button variant="secondary" onClick={handleReset}>
            Ripristina Default
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvataggio...' : 'Salva Modifiche'}
          </Button>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {Object.entries(plans).map(([tier, plan]) => (
          <Card key={tier} className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Piano {plan.name}
            </h2>

            <div className="space-y-4">
              <Input
                label="Nome Piano"
                value={plan.name}
                onChange={(e) => updatePlan(tier as SubscriptionTier, 'name', e.target.value)}
              />

              <Input
                label="Prezzo (€)"
                type="number"
                value={plan.price}
                onChange={(e) => updatePlan(tier as SubscriptionTier, 'price', Number(e.target.value))}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Max Subcoach"
                  type="number"
                  value={plan.limits.maxSubcoach}
                  onChange={(e) => updatePlan(tier as SubscriptionTier, 'limits', {
                    ...plan.limits,
                    maxSubcoach: Number(e.target.value)
                  })}
                />

                <Input
                  label="Max Coachee"
                  type="number"
                  value={plan.limits.maxCoachee}
                  onChange={(e) => updatePlan(tier as SubscriptionTier, 'limits', {
                    ...plan.limits,
                    maxCoachee: Number(e.target.value)
                  })}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Funzionalità
                </label>
                {plan.features.map((feature, index) => (
                  <Input
                    key={index}
                    value={feature}
                    onChange={(e) => updateFeature(tier as SubscriptionTier, index, e.target.value)}
                  />
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}