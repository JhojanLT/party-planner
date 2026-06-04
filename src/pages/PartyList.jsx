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
  IonFab,
  IonFabButton,
  IonIcon,
  IonText,
} from '@ionic/react';
import { add } from 'ionicons/icons';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export default function PartyList() {
  const [parties, setParties] = useState([]);
  const { user } = useAuth();
  const history = useHistory();

  // Escucha la lista de eventos en tiempo real
  useEffect(() => {
    if (!user) return;

    const eventsRef = collection(db, 'events');
    const q = query(eventsRef, where('ownerId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setParties(list);
    });

    return unsubscribe;
  }, [user]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Mis publicaciones</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {parties.length === 0 ? (
          <IonText color="medium">
            <p style={{ textAlign: 'center', marginTop: 60 }}>
              No tienes publicaciones todavía. ¡Crea una con el botón +!
            </p>
          </IonText>
        ) : (
          <IonList>
            {parties.map((party) => (
              <IonItem
                key={party.id}
                button
                onClick={() => history.push(`/event/${party.id}`)}
              >
                <IonLabel>
                  <h2>{party.name}</h2>
                  <p>Ticket: <strong>${party.ticketPrice}</strong></p>
                  <p>
                    Fecha:{' '}
                    <strong>
                      {party.date
                        ? new Date(party.date).toLocaleDateString()
                        : '—'}
                    </strong>
                  </p>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        )}

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton routerLink="/create">
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
}
