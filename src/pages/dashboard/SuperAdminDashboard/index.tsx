import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { StatsCard } from '../../../components/StatsCard';
import { Table, Thead, Tbody, Th, Td } from '../../../components/ui/Table';
import { Card } from '../../../components/ui/Card';
import { Users, CreditCard, TrendingUp } from 'lucide-react';
import { User, Subscription } from '../../../types/user';

export default function SuperAdminDashboard() {
  const [coaches, setCoaches] = useState<User[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const subsSnapshot = await getDocs(collection(db, 'subscriptions'));
        
        const coachesData = usersSnapshot.docs
          .filter(doc => doc.data().role === 'coach')
          .map(doc => ({ id: doc.id, ...doc.data() } as User));
        
        const subscriptionsData = subsSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Subscription));

        setCoaches(coachesData);
        setSubscriptions(subscriptionsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Amministratore</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Coach Totali"
          value={coaches.length}
          icon={<Users className="h-6 w-6" />}
        />
        <StatsCard
          title="Abbonamenti Attivi"
          value={subscriptions.filter(s => s.status === 'active').length}
          icon={<CreditCard className="h-6 w-6" />}
        />
        <StatsCard
          title="Ricavi Mensili"
          value={`€${subscriptions
            .filter(s => s.status === 'active')
            .reduce((acc, curr) => acc + (curr.plan === 'premium' ? 99 : 49), 0)}`}
          icon={<TrendingUp className="h-6 w-6" />}
        />
      </div>

      <Card className="overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Lista Coach
          </h3>
        </div>
        <Table>
          <Thead>
            <tr>
              <Th>Nome</Th>
              <Th>Cognome</Th>
              <Th>Email</Th>
              <Th>Abbonamento</Th>
            </tr>
          </Thead>
          <Tbody>
            {loading ? (
              <tr>
                <Td colSpan={4} className="text-center">
                  Caricamento...
                </Td>
              </tr>
            ) : coaches.length === 0 ? (
              <tr>
                <Td colSpan={4} className="text-center">
                  Nessun coach trovato
                </Td>
              </tr>
            ) : (
              coaches.map((coach) => (
                <tr key={coach.id}>
                  <Td>{coach.nome}</Td>
                  <Td>{coach.cognome}</Td>
                  <Td>{coach.email}</Td>
                  <Td>
                    {subscriptions.find(s => s.userId === coach.id)?.plan || 'Nessuno'}
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