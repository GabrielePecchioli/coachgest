import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ArrowRight, Shield } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === 'super_admin') {
          navigate('/admin');
        } else {
          setError('Accesso non autorizzato. Solo gli amministratori possono accedere a questa area.');
          await auth.signOut();
        }
      } else {
        setError('Utente non trovato');
        await auth.signOut();
      }
    } catch (err: any) {
      console.error('Login error:', err);
      switch (err.code) {
        case 'auth/invalid-credential':
          setError('Credenziali non valide. Verifica email e password.');
          break;
        case 'auth/user-not-found':
          setError('Utente amministratore non trovato.');
          break;
        case 'auth/wrong-password':
          setError('Password non corretta.');
          break;
        default:
          setError('Errore durante l\'accesso. Riprova più tardi.');
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary-600" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Accesso Amministratore
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Area riservata agli amministratori di sistema
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12"
              placeholder="admin@coachgest.com"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12"
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base"
            disabled={loading}
          >
            {loading ? (
              'Accesso in corso...'
            ) : (
              <>
                Accedi come Amministratore
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </form>

        <div className="text-center">
          <a 
            href="/login" 
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Torna al login normale
          </a>
        </div>
      </div>
    </div>
  );
}