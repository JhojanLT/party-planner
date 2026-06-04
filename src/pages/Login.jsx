import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonButton,
  IonText,
} from '@ionic/react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const history = useHistory();

  async function handleSubmit() {
    setError('');
    try {
      await login(email, password);
      history.push('/');
    } catch (err) {
      setError('Email o contraseña incorrectos');
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Iniciar Sesión</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {error && (
          <IonText color="danger">
            <p style={{ textAlign: 'center' }}>{error}</p>
          </IonText>
        )}

        <IonInput
          label="Email"
          type="email"
          fill="outline"
          placeholder="Tu email"
          value={email}
          onIonInput={(e) => setEmail(e.detail.value)}
          style={{ marginBottom: 12 }}
        />

        <IonInput
          label="Contraseña"
          type="password"
          fill="outline"
          placeholder="Tu contraseña"
          value={password}
          onIonInput={(e) => setPassword(e.detail.value)}
          style={{ marginBottom: 12 }}
        />

        <IonButton expand="block" onClick={handleSubmit}>
          Entrar
        </IonButton>

        <IonButton expand="block" fill="clear" routerLink="/signup">
          Crear una cuenta nueva
        </IonButton>

        <IonButton expand="block" fill="clear" routerLink="/reset">
          Olvidé mi contraseña
        </IonButton>
      </IonContent>
    </IonPage>
  );
}
