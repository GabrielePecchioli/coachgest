import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';

interface BillingData {
  ragioneSociale: string;
  partitaIva: string;
  codiceFiscale: string;
  indirizzo: string;
  cap: string;
  citta: string;
  provincia: string;
  pec: string;
  codiceDestinatario: string;
}

export default function Billing() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [billingData, setBillingData] = useState<BillingData>({
    ragioneSociale: '',
    partitaIva: '',
    codiceFiscale: '',
    indirizzo: '',
    cap: '',
    citta: '',
    provincia: '',
    pec: '',
    codiceDestinatario: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const userRef = doc(db, 'users', currentUser?.id || '');
      await updateDoc(userRef, {
        billingData,
        updatedAt: new Date(),
      });

      setMessage({ type: 'success', text: 'Dati di fatturazione aggiornati con successo' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Errore durante l\'aggiornamento dei dati' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dati di Fatturazione</h1>

      {message.text && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Input
              label="Ragione Sociale"
              value={billingData.ragioneSociale}
              onChange={(e) => setBillingData({ ...billingData, ragioneSociale: e.target.value })}
              required
            />
            <Input
              label="Partita IVA"
              value={billingData.partitaIva}
              onChange={(e) => setBillingData({ ...billingData, partitaIva: e.target.value })}
              required
            />
            <Input
              label="Codice Fiscale"
              value={billingData.codiceFiscale}
              onChange={(e) => setBillingData({ ...billingData, codiceFiscale: e.target.value })}
              required
            />
            <Input
              label="Indirizzo"
              value={billingData.indirizzo}
              onChange={(e) => setBillingData({ ...billingData, indirizzo: e.target.value })}
              required
            />
            <Input
              label="CAP"
              value={billingData.cap}
              onChange={(e) => setBillingData({ ...billingData, cap: e.target.value })}
              required
            />
            <Input
              label="Città"
              value={billingData.citta}
              onChange={(e) => setBillingData({ ...billingData, citta: e.target.value })}
              required
            />
            <Select
              label="Provincia"
              value={billingData.provincia}
              onChange={(e) => setBillingData({ ...billingData, provincia: e.target.value })}
              required
            >
              <option value="">Seleziona provincia</option>
              {/* Add Italian provinces */}
            </Select>
            <Input
              label="PEC"
              type="email"
              value={billingData.pec}
              onChange={(e) => setBillingData({ ...billingData, pec: e.target.value })}
              required
            />
            <Input
              label="Codice Destinatario SDI"
              value={billingData.codiceDestinatario}
              onChange={(e) => setBillingData({ ...billingData, codiceDestinatario: e.target.value })}
              required
              maxLength={7}
            />
          </div>

          <Button type="submit" disabled={loading} className="mt-6">
            {loading ? 'Salvataggio...' : 'Salva Dati di Fatturazione'}
          </Button>
        </form>
      </Card>
    </div>
  );
}