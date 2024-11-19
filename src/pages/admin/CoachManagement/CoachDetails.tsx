import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { User, Subscription } from '../../../types/user';
import { SUBSCRIPTION_PLANS } from '../../../types/subscription';

export default function CoachDetails() {
  const { id } = useParams<{ id: string }>();
  const [coach, setCoach] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (id) {
      loadCoachData();
    }
  }, [id]);

  const loadCoachData = async () => {
    try {
      const coachDoc = await getDoc(doc(db, 'users', id!));
      const subscriptionDoc = await getDoc(doc(db, 'subscriptions', id!));
      
      if (coachDoc.exists()) {
        setCoach({ id: coachDoc.id, ...coachDoc.data() } as User);
      }
      
      if (subscriptionDoc.exists()) {
        setSubscription({ id: subscriptionDoc.id, ...subscriptionDoc.data() } as Subscription);
      }
    } catch (error) {
      console.error('Error loading coach data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubscription = async (plan: string) => {
    if (!coach || !subscription) return;

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await updateDoc(doc(db, 'subscriptions', subscription.id), {
        plan,
        updatedAt: new Date(),
      });

      setMessage({ type: 'success', text: 'Abbonamento aggiornato con successo' });
      loadCoachData(); // Reload data
    } catch (error) {
      setMessage({ type: 'error', text: 'Errore durante l\'aggiornamento' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!coach) return;

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const newStatus = coach.status === 'active' ? 'suspended' : 'active';
      await updateDoc(doc(db, 'users', coach.id), {
        status: newStatus,
        updatedAt: new Date(),
      });

      setMessage({ type: 'success', text: 'Stato aggiornato con successo' });
      loadCoachData(); // Reload data
    } catch (error) {
      setMessage({ type: 'error', text: 'Errore durante l\'aggiornamento' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="text-center text-gray-500">
        Coach non trovato
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Gestione Coach: {coach.nome} {coach.cognome}
        </h1>
        <Button
          onClick={handleToggleStatus}
          variant={coach.status === 'active' ? 'secondary' : 'primary'}
          disabled={saving}
        >
          {coach.status === 'active' ? 'Sospendi Account' : 'Riattiva Account'}
        </Button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <Card className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Informazioni Coach
        </h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="mt-1 text-sm text-gray-900">{coach.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Stato</dt>
            <dd className="mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                coach.status === 'active' 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {coach.status === 'active' ? 'Attivo' : 'Sospeso'}
              </span>
            </dd>
          </div>
        </dl>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Abbonamento
        </h2>
        {subscription ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Piano Attuale</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Stato Abbonamento</dt>
                <dd className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    subscription.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {subscription.status === 'active' ? 'Attivo' : 'Sospeso'}
                  </span>
                </dd>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Cambia Piano
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
                  <Button
                    key={key}
                    variant={subscription.plan === key ? 'primary' : 'secondary'}
                    disabled={subscription.plan === key || saving}
                    onClick={() => handleUpdateSubscription(key)}
                  >
                    {plan.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Nessun abbonamento attivo
          </p>
        )}
      </Card>
    </div>
  );
}