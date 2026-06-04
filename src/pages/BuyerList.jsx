import { useEffect, useState } from 'react';
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
  IonText,
} from '@ionic/react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export default function BuyerList() {
  const [events, setEvents] = useState([]);
  const history = useHistory();
  const { user } = useAuth();

  // Escucha todos los eventos excepto los propios
  useEffect(() => {
    const eventsRef = collection(db, 'events');
    const q = query(eventsRef, orderBy('date'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((event) => event.ownerId !== user?.uid);
      setEvents(list);
    });

    return unsubscribe;
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Explorar eventos</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {events.length === 0 ? (
          <IonText color="medium">
            <p style={{ textAlign: 'center', marginTop: 60 }}>
              Todavía no hay eventos disponibles.
            </p>
          </IonText>
        ) : (
          <IonList>
            {events.map((event) => (
              <IonItem
                key={event.id}
                button
                onClick={() => history.push(`/event/${event.id}`)}
              >
                <IonLabel>
                  <h2>{event.name}</h2>
                  {event.ownerName && (
                    <p>Organizador: <strong>{event.ownerName}</strong></p>
                  )}
                  <p>Ticket: <strong>${event.ticketPrice}</strong></p>
                  <p>
                    Fecha:{' '}
                    <strong>
                      {event.date ? new Date(event.date).toLocaleDateString() : '—'}
                    </strong>
                    {event.time && (
                      <span> — <strong>{new Date(event.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                    )}
                  </p>
                  {event.location && (
                    <p>{event.location}</p>
                  )}
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
}
