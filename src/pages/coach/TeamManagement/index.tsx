import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Table, Thead, Tbody, Th, Td } from '../../../components/ui/Table';
import { UserPlus } from 'lucide-react';
import { User } from '../../../types/user';

export default function TeamManagement() {
  const { currentUser } = useAuth();
  const [subcoaches, setSubcoaches] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSubcoach, setNewSubcoach] = useState({
    email: '',
    nome: '',
    cognome: '',
    password: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubcoaches();
  }, [currentUser]);

  const fetchSubcoaches = async () => {
    if (!currentUser) return;

    try {
      const q = query(
        collection(db, 'users'),
        where('coachId', '==', currentUser.id),
        where('role', '==', 'subcoach')
      );
      const snapshot = await getDocs(q);
      const subcoachesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));
      
      setSubcoaches(subcoachesData);
    } catch (error) {
      console.error('Error fetching subcoaches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubcoach = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Create new user document for subcoach
      const userRef = await addDoc(collection(db, 'users'), {
        ...newSubcoach,
        role: 'subcoach',
        coachId: currentUser?.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Reset form and refresh list
      setNewSubcoach({ email: '', nome: '', cognome: '', password: '' });
      setShowAddForm(false);
      fetchSubcoaches();
    } catch (err) {
      setError('Errore durante l\'aggiunta del subcoach');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestione Team</h1>
        <Button
          onClick={() => setShowAddForm(true)}
          className="flex items-center"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Aggiungi Subcoach
        </Button>
      </div>

      {showAddForm && (
        <Card className="p-6">
          <h2 className="text-lg font-medium mb-4">Nuovo Subcoach</h2>
          <form onSubmit={handleAddSubcoach} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nome"
                value={newSubcoach.nome}
                onChange={(e) => setNewSubcoach({ ...newSubcoach, nome: e.target.value })}
                required
              />
              <Input
                label="Cognome"
                value={newSubcoach.cognome}
                onChange={(e) => setNewSubcoach({ ...newSubcoach, cognome: e.target.value })}
                required
              />
            </div>
            
            <Input
              label="Email"
              type="email"
              value={newSubcoach.email}
              onChange={(e) => setNewSubcoach({ ...newSubcoach, email: e.target.value })}
              required
            />
            
            <Input
              label="Password"
              type="password"
              value={newSubcoach.password}
              onChange={(e) => setNewSubcoach({ ...newSubcoach, password: e.target.value })}
              required
            />

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowAddForm(false)}
              >
                Annulla
              </Button>
              <Button type="submit">
                Aggiungi Subcoach
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
              <Th>Coachee Assegnati</Th>
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
            ) : subcoaches.length === 0 ? (
              <tr>
                <Td colSpan={5} className="text-center">
                  Nessun subcoach nel team
                </Td>
              </tr>
            ) : (
              subcoaches.map((subcoach) => (
                <tr key={subcoach.id}>
                  <Td>{subcoach.nome}</Td>
                  <Td>{subcoach.cognome}</Td>
                  <Td>{subcoach.email}</Td>
                  <Td>0</Td>
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