import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonTextarea,
  IonButton,
  IonButtons,
  IonBackButton,
  IonDatetime,
  IonText,
  IonLabel,
  IonItem,
  IonAccordion,
  IonAccordionGroup,
} from '@ionic/react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export default function CreateParty() {
  const [name, setName] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [cost, setCost] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const { user, profile } = useAuth();
  const history = useHistory();

  async function handleSubmit() {
    setError('');

    if (!name || !ticketPrice || !cost || !date) {
      setError('Completa los campos obligatorios');
      return;
    }

    try {
      const eventsRef = collection(db, 'events');
      await addDoc(eventsRef, {
        ownerId: user.uid,
        ownerName: profile?.name ?? '',
        name,
        ticketPrice: Number(ticketPrice),
        cost: Number(cost),
        date: new Date(date).getTime(),
        time: time || '',
        location: location.trim(),
        notes: notes.trim(),
        revenue: 0,
      });
      history.push('/mine');
    } catch (err) {
      setError('Error al crear el evento');
      console.error(err);
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Nuevo Evento</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {error && (
          <IonText color="danger">
            <p style={{ textAlign: 'center' }}>{error}</p>
          </IonText>
        )}

        {/* Campos obligatorios */}
        <IonText color="medium">
          <p style={{ margin: '0 0 8px 4px', fontSize: 13 }}>Información básica *</p>
        </IonText>

        <IonInput
          label="Nombre del evento"
          type="text"
          fill="outline"
          placeholder="¿Cómo se llama?"
          value={name}
          onIonInput={(e) => setName(e.detail.value)}
          style={{ marginBottom: 12 }}
        />

        <IonInput
          label="Precio del ticket ($)"
          type="number"
          fill="outline"
          placeholder="¿Cuánto pagan los invitados?"
          value={ticketPrice}
          onIonInput={(e) => setTicketPrice(e.detail.value)}
          style={{ marginBottom: 12 }}
        />

        <IonInput
          label="Costo del evento ($)"
          type="number"
          fill="outline"
          placeholder="¿Cuánto te cuesta organizarlo?"
          value={cost}
          onIonInput={(e) => setCost(e.detail.value)}
          style={{ marginBottom: 12 }}
        />

        {/* Fecha */}
        <IonText color="medium">
          <p style={{ margin: '8px 0 4px 4px', fontSize: 13 }}>Fecha *</p>
        </IonText>
        <IonDatetime
          presentation="date"
          value={date}
          min={new Date().toISOString().split('T')[0]}
          onIonChange={(e) => setDate(e.detail.value)}
          style={{ margin: '0 auto 16px' }}
        />

        {/* Hora */}
        <IonText color="medium">
          <p style={{ margin: '0 0 4px 4px', fontSize: 13 }}>Hora (opcional)</p>
        </IonText>
        <IonDatetime
          presentation="time"
          value={time || undefined}
          onIonChange={(e) => setTime(e.detail.value)}
          style={{ margin: '0 auto 16px' }}
        />

        {/* Lugar */}
        <IonInput
          label="Lugar"
          type="text"
          fill="outline"
          placeholder="Dirección o nombre del lugar"
          value={location}
          onIonInput={(e) => setLocation(e.detail.value)}
          style={{ marginBottom: 12 }}
        />

        {/* Notas extra */}
        <IonTextarea
          label="Notas / detalles extra"
          fill="outline"
          placeholder="Código de vestimenta, temática, indicaciones especiales..."
          value={notes}
          onIonInput={(e) => setNotes(e.detail.value)}
          autoGrow
          rows={3}
          style={{ marginBottom: 20 }}
        />

        <IonButton expand="block" onClick={handleSubmit}>
          Crear Evento
        </IonButton>
      </IonContent>
    </IonPage>
  );
}
