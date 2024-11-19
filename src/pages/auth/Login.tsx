import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ArrowRight } from 'lucide-react';

interface LocationState {
  message?: string;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
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
        switch (userData.role) {
          case 'super_admin':
            navigate('/admin');
            break;
          case 'coach':
          case 'subcoach':
            navigate('/coach');
            break;
          case 'coachee':
            navigate('/coachee');
            break;
          default:
            setError('Ruolo utente non valido');
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      switch (err.code) {
        case 'auth/invalid-email':
          setError('Email non valida');
          break;
        case 'auth/user-disabled':
          setError('Account disabilitato');
          break;
        case 'auth/user-not-found':
          setError('Utente non trovato');
          break;
        case 'auth/wrong-password':
          setError('Password non corretta');
          break;
        default:
          setError('Errore durante l\'accesso');
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
              Bentornato
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Accedi alla tua area personale
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            {state?.message && (
              <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
                {state.message}
              </div>
            )}
            
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
                placeholder="nome@esempio.com"
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
                  Accedi
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <div className="flex flex-col items-center space-y-4">
            <p className="text-center text-base text-gray-600">
              Non hai un account?{' '}
              <a 
                href="/register" 
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                Registrati ora
              </a>
            </p>

            <a 
              href="/admin/login" 
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Accesso Amministratore
            </a>
          </div>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-700">
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-white max-w-lg">
            <h2 className="text-4xl font-bold mb-6">
              Gestisci il tuo business di coaching in modo professionale
            </h2>
            <p className="text-lg text-white/90">
              Organizza le tue sessioni, monitora i progressi dei tuoi coachee e fai crescere il tuo business con CoachGest.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}