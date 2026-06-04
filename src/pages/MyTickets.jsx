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
  IonBadge,
  IonText,
} from '@ionic/react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export default function MyTickets() {
  const { user } = useAuth();
  const history = useHistory();
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    if (!user) return;
    const purchasesRef = collection(db, 'purchases');
    const q = query(purchasesRef, where('buyerId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTickets(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, [user]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Mis tickets</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {tickets.length === 0 ? (
          <IonText color="medium">
            <p style={{ textAlign: 'center', marginTop: 60 }}>
              Todavía no compraste ningún ticket.
            </p>
          </IonText>
        ) : (
          <IonList>
            {tickets.map((ticket) => (
              <IonItem
                key={ticket.id}
                button
                onClick={() => history.push(`/event/${ticket.eventId}`)}
              >
                <IonLabel>
                  <h2>{ticket.eventName}</h2>
                  {ticket.ownerName && (
                    <p>Organizador: <strong>{ticket.ownerName}</strong></p>
                  )}
                  <p>
                    Fecha:{' '}
                    <strong>
                      {ticket.eventDate
                        ? new Date(ticket.eventDate).toLocaleDateString()
                        : '—'}
                    </strong>
                  </p>
                  <p>Precio por ticket: <strong>${ticket.ticketPrice}</strong></p>
                </IonLabel>
                <div slot="end" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <IonBadge color="primary" style={{ fontSize: 16, padding: '4px 10px' }}>
                    {ticket.quantity}
                  </IonBadge>
                  <IonText color="medium" style={{ fontSize: 11 }}>
                    {ticket.quantity === 1 ? 'ticket' : 'tickets'}
                  </IonText>
                </div>
              </IonItem>
            ))}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
}
