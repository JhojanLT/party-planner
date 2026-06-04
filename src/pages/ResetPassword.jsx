import { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonButton,
  IonButtons,
  IonBackButton,
  IonText,
} from '@ionic/react';
import { useAuth } from '../contexts/AuthContext';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { resetPassword } = useAuth();

  async function handleSubmit() {
    setError('');
    setMessage('');
    try {
      await resetPassword(email);
      setMessage('¡Listo! Revisa tu email para restablecer tu contraseña.');
    } catch (err) {
      setError('No se pudo enviar el email. ¿Está bien escrito?');
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/login" />
          </IonButtons>
          <IonTitle>Restablecer Contraseña</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {error && (
          <IonText color="danger">
            <p style={{ textAlign: 'center' }}>{error}</p>
          </IonText>
        )}
        {message && (
          <IonText color="success">
            <p style={{ textAlign: 'center' }}>{message}</p>
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

        <IonButton expand="block" onClick={handleSubmit}>
          Enviar Email
        </IonButton>

        <IonButton expand="block" fill="clear" routerLink="/login">
          Volver al login
        </IonButton>
      </IonContent>
    </IonPage>
  );
}
