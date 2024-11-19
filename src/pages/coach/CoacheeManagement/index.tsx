import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Table, Thead, Tbody, Th, Td } from '../../../components/ui/Table';
import { UserPlus, Users } from 'lucide-react';
import { User } from '../../../types/user';

export default function CoacheeManagement() {
  const { currentUser } = useAuth();
  const [coachees, setCoachees] = useState<User[]>([]);
  const [subcoaches, setSubcoaches] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCoachee, setNewCoachee] = useState({
    email: '',
    nome: '',
    cognome: '',
    subcoachId: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    if (!currentUser) return;

    try {
      // Fetch coachees
      const coacheesQuery = query(
        collection(db, 'users'),
        where('coachId', '==', currentUser.id),
        where('role', '==', 'coachee')
      );
      const coacheesSnapshot = await getDocs(coacheesQuery);
      const coacheesData = coacheesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));
      
      // Fetch subcoaches
      const subcoachesQuery = query(
        collection(db, 'users'),
        where('coachId', '==', currentUser.id),
        where('role', '==', 'subcoach')
      );
      const subcoachesSnapshot = await getDocs(subcoachesQuery);
      const subcoachesData = subcoachesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));

      setCoachees(coacheesData);
      setSubcoaches(subcoachesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoachee = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Create new user document for coachee
      await addDoc(collection(db, 'users'), {
        ...newCoachee,
        role: 'coachee',
        coachId: currentUser?.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Reset form and refresh list
      setNewCoachee({ email: '', nome: '', cognome: '', subcoachId: '' });
      setShowAddForm(false);
      fetchData();
    } catch (err) {
      setError('Errore durante l\'aggiunta del coachee');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestione Coachee</h1>
        <Button
          onClick={() => setShowAddForm(true)}
          className="flex items-center"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Aggiungi Coachee
        </Button>
      </div>

      {showAddForm && (
        <Card className="p-6">
          <h2 className="text-lg font-medium mb-4">Nuovo Coachee</h2>
          <form onSubmit={handleAddCoachee} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nome"
                value={newCoachee.nome}
                onChange={(e) => setNewCoachee({ ...newCoachee, nome: e.target.value })}
                required
              />
              <Input
                label="Cognome"
                value={newCoachee.cognome}
                onChange={(e) => setNewCoachee({ ...newCoachee, cognome: e.target.value })}
                required
              />
            </div>
            
            <Input
              label="Email"
              type="email"
              value={newCoachee.email}
              onChange={(e) => setNewCoachee({ ...newCoachee, email: e.target.value })}
              required
            />
            
            <Select
              label="Assegna a Subcoach"
              value={newCoachee.subcoachId}
              onChange={(e) => setNewCoachee({ ...newCoachee, subcoachId: e.target.value })}
            >
              <option value="">Gestisci direttamente</option>
              {subcoaches.map((subcoach) => (
                <option key={subcoach.id} value={subcoach.id}>
                  {subcoach.nome} {subcoach.cognome}
                </option>
              ))}
            </Select>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowAddForm(false)}
              >
                Annulla
              </Button>
              <Button type="submit">
                Aggiungi Coachee
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden">
        <Table>
          <Thead>
            <tr>
              <Th>Nome</Th>
              <Th>Cognome</Th>
              <Th>Email</Th>
              <Th>Coach Assegnato</Th>
              <Th>Azioni</Th>
            </tr>
          </Thead>
          <Tbody>
            {loading ? (
              <tr>
                <Td colSpan={5} className="text-center">
                  Caricamento...
                </Td>
              </tr>
            ) : coachees.length === 0 ? (
              <tr>
                <Td colSpan={5} className="text-center">
                  Nessun coachee registrato
                </Td>
              </tr>
            ) : (
              coachees.map((coachee) => (
                <tr key={coachee.id}>
                  <Td>{coachee.nome}</Td>
                  <Td>{coachee.cognome}</Td>
                  <Td>{coachee.email}</Td>
                  <Td>
                    {coachee.subcoachId
                      ? subcoaches.find(s => s.id === coachee.subcoachId)?.nome || 'N/A'
                      : 'Gestione diretta'}
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