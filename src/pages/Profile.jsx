import { useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonButtons,
  IonIcon,
  IonAvatar,
  IonText,
  useIonToast,
} from '@ionic/react';
import { createOutline, logOutOutline, cameraOutline, checkmarkOutline, closeOutline } from 'ionicons/icons';
import { useAuth } from '../contexts/AuthContext';
import { resizeImageToBase64 } from '../utils/imageUtils';

export default function Profile() {
  const { user, profile, updateProfile, logout } = useAuth();
  const history = useHistory();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();
  const [presentToast] = useIonToast();

  function startEdit() {
    setName(profile?.name ?? '');
    setPhone(profile?.phone ?? '');
    setAvatarFile(null);
    setAvatarPreview(null);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    if (!name.trim()) {
      presentToast({ message: 'El nombre es obligatorio', duration: 1500, color: 'warning' });
      return;
    }
    setSaving(true);
    try {
      const photoBase64 = avatarFile ? await resizeImageToBase64(avatarFile) : undefined;
      await updateProfile(
        { name: name.trim(), phone: phone.trim(), photoURL: profile?.photoURL ?? null },
        photoBase64
      );
      presentToast({ message: 'Perfil actualizado', duration: 1500, color: 'success' });
      setEditing(false);
    } catch (err) {
      presentToast({ message: 'No se pudo guardar', duration: 1500, color: 'danger' });
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    window.location.href = '/login';
  }

  const avatarSrc = avatarPreview ?? profile?.photoURL;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Perfil</IonTitle>
          <IonButtons slot="end">
            {editing ? (
              <>
                <IonButton onClick={cancelEdit}>
                  <IonIcon slot="icon-only" icon={closeOutline} />
                </IonButton>
                <IonButton onClick={handleSave} disabled={saving}>
                  <IonIcon slot="icon-only" icon={checkmarkOutline} />
                </IonButton>
              </>
            ) : (
              <IonButton onClick={startEdit}>
                <IonIcon slot="icon-only" icon={createOutline} />
              </IonButton>
            )}
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* Avatar */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20, marginTop: 8 }}>
          <div
            style={{ position: 'relative', cursor: editing ? 'pointer' : 'default' }}
            onClick={editing ? () => fileRef.current.click() : undefined}
          >
            <IonAvatar style={{ width: 96, height: 96 }}>
              {avatarSrc ? (
                <img src={avatarSrc} alt="avatar" style={{ objectFit: 'cover' }} />
              ) : (
                <div style={{
                  width: '100%', height: '100%', background: '#e0e0e0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%'
                }}>
                  <IonIcon icon={cameraOutline} style={{ fontSize: 36, color: '#888' }} />
                </div>
              )}
            </IonAvatar>
            {editing && (
              <div style={{
                position: 'absolute', bottom: 0, right: 0,
                background: 'var(--ion-color-primary)', borderRadius: '50%',
                width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <IonIcon icon={cameraOutline} style={{ fontSize: 16, color: '#fff' }} />
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
        </div>

        {editing ? (
          <>
            <IonInput
              label="Nombre completo *"
              type="text"
              fill="outline"
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
            <IonText color="medium">
              <p style={{ textAlign: 'center', fontSize: 13 }}>Email: {user?.email}</p>
            </IonText>
          </>
        ) : (
          <IonList>
            <IonItem>
              <IonLabel>
                <p>Nombre</p>
                <h2>{profile?.name ?? '—'}</h2>
              </IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>
                <p>Teléfono</p>
                <h2>{profile?.phone || '—'}</h2>
              </IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>
                <p>Email</p>
                <h2>{user?.email}</h2>
              </IonLabel>
            </IonItem>
          </IonList>
        )}

        <IonButton
          expand="block"
          color="danger"
          onClick={handleLogout}
          style={{ marginTop: 32 }}
        >
          <IonIcon slot="start" icon={logOutOutline} />
          Cerrar sesión
        </IonButton>
      </IonContent>
    </IonPage>
  );
}
