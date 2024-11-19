import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { Card } from '../../../components/ui/Card';
import { Table, Thead, Tbody, Th, Td } from '../../../components/ui/Table';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface Transaction {
  id: string;
  date: Date;
  amount: number;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  invoiceUrl?: string;
}

export default function Transactions() {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!currentUser?.id) return;

      try {
        const q = query(
          collection(db, 'transactions'),
          where('userId', '==', currentUser.id),
          orderBy('date', 'desc')
        );
        const snapshot = await getDocs(q);
        const transactionsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: new Date(doc.data().date.seconds * 1000)
        })) as Transaction[];
        
        setTransactions(transactionsData);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [currentUser]);

  const getStatusBadge = (status: Transaction['status']) => {
    const styles = {
      completed: 'bg-green-50 text-green-700',
      pending: 'bg-yellow-50 text-yellow-700',
      failed: 'bg-red-50 text-red-700'
    };

    const labels = {
      completed: 'Completato',
      pending: 'In Attesa',
      failed: 'Fallito'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Storico Transazioni</h1>

      <Card className="overflow-hidden">
        <Table>
          <Thead>
            <tr>
              <Th>Data</Th>
              <Th>Descrizione</Th>
              <Th>Importo</Th>
              <Th>Stato</Th>
              <Th>Fattura</Th>
            </tr>
          </Thead>
          <Tbody>
            {loading ? (
              <tr>
                <Td colSpan={5} className="text-center">
                  Caricamento...
                </Td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <Td colSpan={5} className="text-center">
                  Nessuna transazione trovata
                </Td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <Td>
                    {format(transaction.date, 'dd MMMM yyyy', { locale: it })}
                  </Td>
                  <Td>{transaction.description}</Td>
                  <Td>€{transaction.amount.toFixed(2)}</Td>
                  <Td>{getStatusBadge(transaction.status)}</Td>
                  <Td>
                    {transaction.invoiceUrl && (
                      <a
                        href={transaction.invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700"
                      >
                        Scarica
                      </a>
                    )}
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