import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { Card } from '../../../components/ui/Card';
import { Table, Thead, Tbody, Th, Td } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import { User, Subscription } from '../../../types/user';

export default function CoachManagement() {
  const [coaches, setCoaches] = useState<User[]>([]);
  const [subscriptions, setSubscriptions] = useState<Record<string, Subscription>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch coaches
      const coachesQuery = query(
        collection(db, 'users'),
        where('role', '==', 'coach')
      );
      const coachesSnapshot = await getDocs(coachesQuery);
      const coachesData = coachesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));

      // Fetch subscriptions
      const subsQuery = query(collection(db, 'subscriptions'));
      const subsSnapshot = await getDocs(subsQuery);
      const subsData = subsSnapshot.docs.reduce((acc, doc) => ({
        ...acc,
        [doc.data().userId]: { id: doc.id, ...doc.data() }
      }), {} as Record<string, Subscription>);

      setCoaches(coachesData);
      setSubscriptions(subsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubscriptionStatus = (coachId: string) => {
    const sub = subscriptions[coachId];
    if (!sub) return 'Nessun abbonamento';
    
    return `${sub.plan.charAt(0).toUpperCase() + sub.plan.slice(1)} - ${
      sub.status === 'active' ? 'Attivo' : 'Sospeso'
    }`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestione Coach</h1>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <Thead>
            <tr>
              <Th>Nome</Th>
              <Th>Cognome</Th>
              <Th>Email</Th>
              <Th>Abbonamento</Th>
              <Th>Stato</Th>
              <Th>Azioni</Th>
            </tr>
          </Thead>
          <Tbody>
            {loading ? (
              <tr>
                <Td colSpan={6} className="text-center">
                  Caricamento...
                </Td>
              </tr>
            ) : coaches.length === 0 ? (
              <tr>
                <Td colSpan={6} className="text-center">
                  Nessun coach registrato
                </Td>
              </tr>
            ) : (
              coaches.map((coach) => (
                <tr key={coach.id}>
                  <Td>{coach.nome}</Td>
                  <Td>{coach.cognome}</Td>
                  <Td>{coach.email}</Td>
                  <Td>{getSubscriptionStatus(coach.id)}</Td>
                  <Td>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      coach.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {coach.status === 'active' ? 'Attivo' : 'Sospeso'}
                    </span>
                  </Td>
                  <Td>
                    <Button variant="secondary" size="sm">
                      Gestisci
                    </Button>
                  </Td>
                </tr>
              ))
            )}
          </Tbody>
        </Table>
      </Card>
    </div>
  );
}