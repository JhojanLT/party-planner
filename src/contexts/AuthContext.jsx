import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, onSnapshot, updateDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

// Hook para usar en cualquier componente: const { user, profile, login, ... } = useAuth()
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubProfile = null;

    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (unsubProfile) { unsubProfile(); unsubProfile = null; }

      if (currentUser) {
        const profileRef = doc(db, 'users', currentUser.uid);
        unsubProfile = onSnapshot(
          profileRef,
          (snap) => { setProfile(snap.exists() ? snap.data() : null); setLoading(false); },
          () => setLoading(false)
        );
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => { unsubAuth(); if (unsubProfile) unsubProfile(); };
  }, []);

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Crea la cuenta y guarda el perfil completo (photoBase64 ya viene comprimido)
  async function signup(email, password, profileData, photoBase64) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', cred.user.uid), {
      email,
      ...profileData,
      ...(photoBase64 && { photoURL: photoBase64 }),
    });
    return cred;
  }

  // Actualiza datos del perfil (photoBase64 ya viene comprimido o null para no cambiar)
  // Si cambia el nombre, actualiza también todos los eventos del usuario
  async function updateProfile(profileData, photoBase64) {
    await updateDoc(doc(db, 'users', user.uid), {
      ...profileData,
      ...(photoBase64 !== undefined && { photoURL: photoBase64 }),
    });

    if (profileData.name !== undefined) {
      const eventsRef = collection(db, 'events');
      const q = query(eventsRef, where('ownerId', '==', user.uid));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const batch = writeBatch(db);
        snapshot.docs.forEach((eventDoc) => {
          batch.update(eventDoc.ref, { ownerName: profileData.name });
        });
        await batch.commit();
      }
    }
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  function logout() {
    return signOut(auth);
  }

  const value = { user, profile, loading, login, signup, updateProfile, resetPassword, logout };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
