import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ArrowRight, Check } from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '../../types/subscription';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nome: '',
    cognome: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear error when user types
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.nome || !formData.cognome) {
      setError('Tutti i campi sono obbligatori');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Le password non coincidono');
      return false;
    }

    if (formData.password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Inserisci un indirizzo email valido');
      return false;
    }

    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Check if email exists before attempting registration
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 30);

      // Create user document
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: formData.email,
        nome: formData.nome,
        cognome: formData.cognome,
        role: 'coach',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active'
      });

      // Create subscription document
      await setDoc(doc(db, 'subscriptions', userCredential.user.uid), {
        userId: userCredential.user.uid,
        plan: 'trial',
        status: 'active',
        startDate: serverTimestamp(),
        endDate: trialEndDate,
        maxCoachee: SUBSCRIPTION_PLANS.trial.limits.maxCoachee,
        maxSubcoach: SUBSCRIPTION_PLANS.trial.limits.maxSubcoach,
        features: SUBSCRIPTION_PLANS.trial.features,
      });

      // Redirect to login with success message
      navigate('/login', { 
        state: { 
          message: 'Registrazione completata con successo! Ora puoi accedere.' 
        },
        replace: true
      });
    } catch (err: any) {
      console.error('Registration error:', err);
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('Questa email è già registrata. Prova ad accedere o usa un\'altra email.');
          break;
        case 'auth/invalid-email':
          setError('Formato email non valido');
          break;
        case 'auth/operation-not-allowed':
          setError('La registrazione non è attualmente disponibile');
          break;
        case 'auth/weak-password':
          setError('La password deve essere più sicura');
          break;
        default:
          setError('Si è verificato un errore durante la registrazione. Riprova più tardi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
              Inizia Gratuitamente
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Prova gratuita di 30 giorni, senza carta di credito
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleRegister}>
            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  className="h-12"
                  placeholder="Mario"
                  autoComplete="given-name"
                />

                <Input
                  label="Cognome"
                  name="cognome"
                  value={formData.cognome}
                  onChange={handleChange}
                  required
                  className="h-12"
                  placeholder="Rossi"
                  autoComplete="family-name"
                />
              </div>

              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="h-12"
                placeholder="nome@esempio.com"
                autoComplete="email"
              />

              <Input
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="h-12"
                placeholder="••••••••"
                minLength={6}
                autoComplete="new-password"
              />

              <Input
                label="Conferma Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="h-12"
                placeholder="••••••••"
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base"
              disabled={loading}
            >
              {loading ? (
                'Registrazione in corso...'
              ) : (
                <>
                  Crea Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-base text-gray-600">
            Hai già un account?{' '}
            <a 
              href="/login" 
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              Accedi
            </a>
          </p>
        </div>
      </div>

      {/* Right side - Trial Features */}
      <div className="hidden lg:block lg:w-1/2 bg-gray-50 p-12">
        <div className="max-w-lg mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Incluso nella prova gratuita
          </h2>
          
          <ul className="space-y-5">
            {SUBSCRIPTION_PLANS.trial.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center">
                  <Check className="h-4 w-4 text-primary-600" />
                </div>
                <span className="ml-3 text-lg text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-12 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Piano Trial
              </h3>
              <span className="text-2xl font-bold text-primary-600">
                Gratuito
              </span>
            </div>
            <p className="text-gray-600">
              Accesso completo a tutte le funzionalità base per 30 giorni.
              Passa a un piano premium in qualsiasi momento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}