import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export async function createSuperAdmin() {
  const email = 'admin@coachgest.com';
  const password = 'Admin@123456';

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user document
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email,
      nome: 'Admin',
      cognome: 'System',
      role: 'super_admin',
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active'
    });

    console.log('Super admin created successfully');
    return { email, password };
  } catch (error: any) {
    if (error.code !== 'auth/email-already-in-use') {
      console.error('Error creating super admin:', error);
      throw error;
    }
  }
}