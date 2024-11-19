import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { StatsCard } from '../../../components/StatsCard';
import { Card } from '../../../components/ui/Card';
import { Calendar, Target, Clock } from 'lucide-react';

export default function CoacheeDashboard() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSessions: 0,
    completedGoals: 0,
    upcomingSessions: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!currentUser) return;

      try {
        // Fetch statistics from Firestore
        // This is a placeholder for actual data fetching
        setStats({
          totalSessions: 0,
          completedGoals: 0,
          upcomingSessions: 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [currentUser]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Coachee</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Sessioni Totali"
          value={stats.totalSessions}
          icon={<Calendar className="h-6 w-6" />}
        />
        <StatsCard
          title="Obiettivi Completati"
          value={stats.completedGoals}
          icon={<Target className="h-6 w-6" />}
        />
        <StatsCard
          title="Prossime Sessioni"
          value={stats.upcomingSessions}
          icon={<Clock className="h-6 w-6" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-medium text-gray-900">Obiettivi Recenti</h2>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Nessun obiettivo impostato
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-medium text-gray-900">Prossime Sessioni</h2>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Nessuna sessione programmata
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}