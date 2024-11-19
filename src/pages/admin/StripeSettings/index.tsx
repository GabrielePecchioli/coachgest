import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface StripeConfig {
  publicKey: string;
  clientId: string;
  mode: 'test' | 'live';
  webhookSecret: string;
  connected: boolean;
  accountId?: string;
}

const DEFAULT_STRIPE_CONFIG: StripeConfig = {
  publicKey: '',
  clientId: '',
  mode: 'test',
  webhookSecret: '',
  connected: false,
};

export default function StripeSettings() {
  const [config, setConfig] = useState<StripeConfig>(DEFAULT_STRIPE_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const docRef = doc(db, 'config', 'stripe');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setConfig(docSnap.data() as StripeConfig);
      }
    } catch (error) {
      console.error('Error loading Stripe config:', error);
      setMessage({ type: 'error', text: 'Errore nel caricamento della configurazione' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await setDoc(doc(db, 'config', 'stripe'), config);
      setMessage({ type: 'success', text: 'Configurazione salvata con successo' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Errore durante il salvataggio' });
    } finally {
      setSaving(false);
    }
  };

  const handleConnectStripe = () => {
    if (!config.clientId) {
      setMessage({ type: 'error', text: 'Inserisci prima il Client ID di Stripe' });
      return;
    }

    const redirectUri = `${window.location.origin}/admin/settings/stripe/callback`;
    const state = Math.random().toString(36).substring(7);
    
    const params = new URLSearchParams({
      client_id: config.clientId,
      state,
      scope: 'read_write',
      response_type: 'code',
      redirect_uri: redirectUri,
    });

    window.location.href = `https://connect.stripe.com/oauth/authorize?${params.toString()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Configurazione Stripe</h1>

      {message.text && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                Stato Connessione
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {config.connected
                  ? 'Account Stripe collegato correttamente'
                  : 'Account Stripe non collegato'}
              </p>
            </div>
            {config.connected ? (
              <div className="flex items-center text-green-600">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Connesso
              </div>
            ) : (
              <Button onClick={handleConnectStripe}>
                Collega con Stripe
              </Button>
            )}
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="grid gap-6">
              <Select
                label="Modalità"
                value={config.mode}
                onChange={(e) => setConfig({ ...config, mode: e.target.value as 'test' | 'live' })}
              >
                <option value="test">Test</option>
                <option value="live">Live</option>
              </Select>

              <Input
                label="Client ID"
                value={config.clientId}
                onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
                placeholder="es. ca_..."
              />

              <Input
                label="Chiave Pubblica"
                value={config.publicKey}
                onChange={(e) => setConfig({ ...config, publicKey: e.target.value })}
                placeholder={`Stripe ${config.mode === 'test' ? 'test' : 'live'} public key`}
              />

              <Input
                label="Webhook Secret"
                value={config.webhookSecret}
                onChange={(e) => setConfig({ ...config, webhookSecret: e.target.value })}
                placeholder="whsec_..."
              />

              {config.accountId && (
                <div className="text-sm text-gray-500">
                  Account ID: {config.accountId}
                </div>
              )}
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-md">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-400 mr-3" />
              <div className="text-sm text-yellow-700">
                <h3 className="font-medium">Webhook Endpoint</h3>
                <p className="mt-1">
                  Configura il seguente URL come endpoint webhook nel dashboard Stripe:<br />
                  <code className="bg-yellow-100 px-2 py-1 rounded">
                    {window.location.origin}/api/webhooks/stripe
                  </code>
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Salvataggio...' : 'Salva Configurazione'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}