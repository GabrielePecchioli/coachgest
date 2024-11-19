import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { updatePassword } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../../config/firebase';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

export default function Profile() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profileData, setProfileData] = useState({
    nome: currentUser?.nome || '',
    cognome: currentUser?.cognome || '',
    email: currentUser?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const userRef = doc(db, 'users', currentUser?.id || '');
      await updateDoc(userRef, {
        nome: profileData.nome,
        cognome: profileData.cognome,
        updatedAt: new Date(),
      });

      setMessage({ type: 'success', text: 'Profilo aggiornato con successo' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Errore durante l\'aggiornamento del profilo' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profileData.newPassword !== profileData.confirmPassword) {
      setMessage({ type: 'error', text: 'Le password non coincidono' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, profileData.newPassword);
        setMessage({ type: 'success', text: 'Password aggiornata con successo' });
        setProfileData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Errore durante l\'aggiornamento della password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profilo</h1>

      {message.text && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <Card className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Dati Personali</h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nome"
              value={profileData.nome}
              onChange={(e) => setProfileData({ ...profileData, nome: e.target.value })}
              required
            />
            <Input
              label="Cognome"
              value={profileData.cognome}
              onChange={(e) => setProfileData({ ...profileData, cognome: e.target.value })}
              required
            />
          </div>
          <Input
            label="Email"
            type="email"
            value={profileData.email}
            disabled
            className="bg-gray-50"
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Aggiornamento...' : 'Aggiorna Profilo'}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Modifica Password</h2>
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <Input
            label="Password Attuale"
            type="password"
            value={profileData.currentPassword}
            onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
            required
          />
          <Input
            label="Nuova Password"
            type="password"
            value={profileData.newPassword}
            onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
            required
          />
          <Input
            label="Conferma Nuova Password"
            type="password"
            value={profileData.confirmPassword}
            onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Aggiornamento...' : 'Aggiorna Password'}
          </Button>
        </form>
      </Card>
    </div>
  );
}