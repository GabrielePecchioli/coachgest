import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { StatsCard } from '../../../components/StatsCard';
import { Table, Thead, Tbody, Th, Td } from '../../../components/ui/Table';
import { Card } from '../../../components/ui/Card';
import { Users, Calendar, Target } from 'lucide-react';
import { User } from '../../../types/user';

export default function CoachDashboard() {
  const { currentUser } = useAuth();
  const [coachees, setCoachees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoachees = async () => {
      if (!currentUser) return;

      try {
        const q = query(
          collection(db, 'users'),
          where('coachId', '==', currentUser.id)
        );
        const snapshot = await getDocs(q);
        const coacheesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as User));
        
        setCoachees(coacheesData);
      } catch (error) {
        console.error('Error fetching coachees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoachees();
  }, [currentUser]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Coach</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Coachee Totali"
          value={coachees.length}
          icon={<Users className="h-6 w-6" />}
        />
        <StatsCard
          title="Sessioni Questo Mese"
          value="0"
          icon={<Calendar className="h-6 w-6" />}
        />
        <StatsCard
          title="Obiettivi Completati"
          value="0"
          icon={<Target className="h-6 w-6" />}
        />
      </div>

      <Card className="overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Lista Coachee
          </h3>
        </div>
        <Table>
          <Thead>
            <tr>
              <Th>Nome</Th>
              <Th>Cognome</Th>
              <Th>Email</Th>
              <Th>Ultima Sessione</Th>
            </tr>
          </Thead>
          <Tbody>
            {loading ? (
              <tr>
                <Td colSpan={4} className="text-center">
                  Caricamento...
                </Td>
              </tr>
            ) : coachees.length === 0 ? (
              <tr>
                <Td colSpan={4} className="text-center">
                  Nessun coachee trovato
                </Td>
              </tr>
            ) : (
              coachees.map((coachee) => (
                <tr key={coachee.id}>
                  <Td>{coachee.nome}</Td>
                  <Td>{coachee.cognome}</Td>
                  <Td>{coachee.email}</Td>
                  <Td>N/A</Td>
                </tr>
              ))
            )}
          </Tbody>
        </Table>
      </Card>
    </div>
  );
}