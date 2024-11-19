import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';

export default function StripeCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      
      if (!code) {
        setError('Codice di autorizzazione mancante');
        return;
      }

      try {
        // Update Stripe config with the new connection
        const configRef = doc(db, 'config', 'stripe');
        const configSnap = await getDoc(configRef);
        
        if (configSnap.exists()) {
          await updateDoc(configRef, {
            connected: true,
            // In a real app, you would exchange the code for an access token
            // using your backend API
          });
        }

        // Redirect back to Stripe settings
        navigate('/admin/settings/stripe', {
          state: { message: 'Account Stripe collegato con successo' }
        });
      } catch (error) {
        console.error('Error handling Stripe callback:', error);
        setError('Errore durante la connessione con Stripe');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto"></div>
        <p className="mt-4 text-gray-600">Connessione con Stripe in corso...</p>
      </div>
    </div>
  );
}