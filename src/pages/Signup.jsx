import { useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
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
  IonAvatar,
  IonIcon,
} from '@ionic/react';
import { cameraOutline } from 'ionicons/icons';
import { useAuth } from '../contexts/AuthContext';
import { resizeImageToBase64 } from '../utils/imageUtils';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();
  const { signup } = useAuth();
  const history = useHistory();

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleSubmit() {
    setError('');
    if (!name.trim()) { setError('El nombre es obligatorio'); return; }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    setLoading(true);
    try {
      const photoBase64 = avatarFile ? await resizeImageToBase64(avatarFile) : null;
      await signup(email, password, { name: name.trim(), phone: phone.trim() }, photoBase64);
      history.push('/');
    } catch (err) {
      setError('No se pudo crear la cuenta. ¿Ya existe ese email?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/login" />
          </IonButtons>
          <IonTitle>Crear Cuenta</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {error && (
          <IonText color="danger">
            <p style={{ textAlign: 'center' }}>{error}</p>
          </IonText>
        )}

        {/* Foto de perfil */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileRef.current.click()}>
            <IonAvatar style={{ width: 90, height: 90 }}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" style={{ objectFit: 'cover' }} />
              ) : (
                <div style={{
                  width: '100%', height: '100%', background: '#e0e0e0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%'
                }}>
                  <IonIcon icon={cameraOutline} style={{ fontSize: 32, color: '#888' }} />
                </div>
              )}
            </IonAvatar>
            <div style={{
              position: 'absolute', bottom: 0, right: 0,
              background: 'var(--ion-color-primary)', borderRadius: '50%',
              width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <IonIcon icon={cameraOutline} style={{ fontSize: 16, color: '#fff' }} />
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
        </div>

        <IonInput
          label="Nombre completo *"
          type="text"
          fill="outline"
          placeholder="Tu nombre"
          value={name}
          onIonInput={(e) => setName(e.detail.value)}
          style={{ marginBottom: 12 }}
        />

        <IonInput
          label="Teléfono"
          type="tel"
          fill="outline"
          placeholder="Opcional"
          value={phone}
          onIonInput={(e) => setPhone(e.detail.value)}
          style={{ marginBottom: 12 }}
        />

        <IonInput
          label="Email *"
          type="email"
          fill="outline"
          placeholder="Tu email"
          value={email}
          onIonInput={(e) => setEmail(e.detail.value)}
          style={{ marginBottom: 12 }}
        />

        <IonInput
          label="Contraseña *"
          type="password"
          fill="outline"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onIonInput={(e) => setPassword(e.detail.value)}
          style={{ marginBottom: 20 }}
        />

        <IonButton expand="block" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
        </IonButton>

        <IonButton expand="block" fill="clear" routerLink="/login">
          Ya tengo cuenta
        </IonButton>
      </IonContent>
    </IonPage>
  );
}
