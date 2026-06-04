import { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonButton,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonText,
  IonBadge,
  IonModal,
  IonInput,
  useIonAlert,
  useIonToast,
} from '@ionic/react';
import { add, remove, trashOutline, cartOutline, ticketOutline, locationOutline, timeOutline, readerOutline } from 'ionicons/icons';
import { doc, onSnapshot, runTransaction, deleteDoc, getDoc, setDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export default function EventDetail() {
  const { eventId } = useParams();
  const { user } = useAuth();
  const history = useHistory();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [myPurchase, setMyPurchase] = useState(null);
  const [ownerContact, setOwnerContact] = useState(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [qty, setQty] = useState(1);
  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();

  useEffect(() => {
    const eventRef = doc(db, 'events', eventId);
    const unsubscribe = onSnapshot(eventRef, (snapshot) => {
      if (snapshot.exists()) {
        setEvent({ id: snapshot.id, ...snapshot.data() });
      } else {
        setEvent(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [eventId]);

  useEffect(() => {
    if (!user) return;
    const purchaseRef = doc(db, 'purchases', `${user.uid}_${eventId}`);
    const unsubscribe = onSnapshot(purchaseRef, (snap) => {
      setMyPurchase(snap.exists() ? snap.data() : null);
      if (snap.exists()) {
        setOwnerContact({ name: snap.data().ownerName, phone: snap.data().ownerPhone });
      }
    });
    return unsubscribe;
  }, [user, eventId]);

  async function handleTicket(type) {
    const eventRef = doc(db, 'events', eventId);
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(eventRef);
      const data = snap.data();
      const newRevenue =
        type === 'add'
          ? data.revenue + data.ticketPrice
          : data.revenue - data.ticketPrice;
      transaction.update(eventRef, { revenue: newRevenue });
    });
  }

  function handleDelete() {
    presentAlert({
      header: '¿Borrar evento?',
      message: 'Esta acción no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Borrar',
          role: 'destructive',
          handler: async () => {
            await deleteDoc(doc(db, 'events', eventId));
            history.push('/mine');
          },
        },
      ],
    });
  }

  function openBuyModal() {
    setQty(1);
    setShowBuyModal(true);
  }

  async function executeBuy() {
    if (!qty || qty < 1) return;
    setShowBuyModal(false);
    setBuying(true);
    try {
      const eventRef = doc(db, 'events', eventId);
      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(eventRef);
        if (!snap.exists()) throw new Error('El evento ya no existe');
        const data = snap.data();
        transaction.update(eventRef, {
          revenue: data.revenue + data.ticketPrice * qty,
        });
      });

      const ownerRef = doc(db, 'users', event.ownerId);
      const ownerSnap = await getDoc(ownerRef);
      const ownerData = ownerSnap.exists() ? ownerSnap.data() : {};

      const purchaseRef = doc(db, 'purchases', `${user.uid}_${eventId}`);
      await setDoc(
        purchaseRef,
        {
          buyerId: user.uid,
          eventId,
          eventName: event.name,
          eventDate: event.date,
          ticketPrice: event.ticketPrice,
          ownerName: event.ownerName ?? '',
          ownerPhone: ownerData.phone ?? '',
          quantity: increment(qty),
          lastPurchasedAt: Date.now(),
        },
        { merge: true }
      );

      presentToast({
        message: `¡${qty} ticket${qty > 1 ? 's' : ''} comprado${qty > 1 ? 's' : ''}!`,
        duration: 1500,
        color: 'success',
      });
    } catch (err) {
      presentToast({ message: 'No se pudo completar la compra.', duration: 1500, color: 'danger' });
    } finally {
      setBuying(false);
    }
  }

  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <p>Cargando...</p>
        </IonContent>
      </IonPage>
    );
  }

  if (!event) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/explore" />
            </IonButtons>
            <IonTitle>No encontrado</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <p>Este evento no existe.</p>
        </IonContent>
      </IonPage>
    );
  }

  const isOwner = user && event.ownerId === user.uid;
  const profit = event.revenue - event.cost;
  const ticketsSold =
    event.ticketPrice > 0 ? Math.round(event.revenue / event.ticketPrice) : 0;
  const total = event ? event.ticketPrice * qty : 0;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={isOwner ? '/mine' : '/explore'} />
          </IonButtons>
          <IonTitle>{event.name}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {isOwner ? (
          <>
            <IonCard>
              <IonCardHeader>
                <IonText>
                  <h2 style={{ margin: 0 }}>
                    Ganancias:{' '}
                    <span style={{ color: profit > 0 ? '#16a34a' : '#ef4444' }}>
                      ${profit.toFixed(2)}
                    </span>
                  </h2>
                </IonText>
              </IonCardHeader>
              <IonCardContent>
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
                  <p>
                    <IonIcon icon={locationOutline} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    <strong>{event.location}</strong>
                  </p>
                )}
                <p>Costo: <strong>${event.cost}</strong></p>
                <p>Ingresos: <strong>${event.revenue}</strong></p>
                {event.notes && (
                  <p style={{ marginTop: 8, borderTop: '1px solid var(--ion-color-light)', paddingTop: 8 }}>
                    <IonIcon icon={readerOutline} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    {event.notes}
                  </p>
                )}
              </IonCardContent>
            </IonCard>

            <h3 style={{ textAlign: 'center', margin: '16px 0' }}>
              Tickets vendidos: {ticketsSold}
            </h3>

            <div style={{ display: 'flex', gap: 12 }}>
              <IonButton
                expand="block"
                color="medium"
                onClick={() => handleTicket('refund')}
                style={{ flex: 1 }}
              >
                <IonIcon slot="start" icon={remove} />
                Reembolsar
              </IonButton>
              <IonButton
                expand="block"
                onClick={() => handleTicket('add')}
                style={{ flex: 1 }}
              >
                <IonIcon slot="start" icon={add} />
                Vender
              </IonButton>
            </div>

            <IonButton
              expand="block"
              color="danger"
              onClick={handleDelete}
              style={{ marginTop: 32 }}
            >
              <IonIcon slot="start" icon={trashOutline} />
              Borrar Evento
            </IonButton>
          </>
        ) : (
          <>
            <IonCard>
              <IonCardHeader>
                <IonText>
                  <h2 style={{ margin: 0 }}>{event.name}</h2>
                </IonText>
              </IonCardHeader>
              <IonCardContent>
                {event.ownerName && (
                  <p>Organizador: <strong>{event.ownerName}</strong></p>
                )}
                <p>Precio del ticket: <strong>${event.ticketPrice}</strong></p>
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
                  <p>
                    <IonIcon icon={locationOutline} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    <strong>{event.location}</strong>
                  </p>
                )}
                {event.notes && (
                  <p style={{ marginTop: 8, borderTop: '1px solid var(--ion-color-light)', paddingTop: 8 }}>
                    <IonIcon icon={readerOutline} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    {event.notes}
                  </p>
                )}
              </IonCardContent>
            </IonCard>

            {myPurchase && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0' }}>
                <IonIcon icon={ticketOutline} style={{ fontSize: 20, color: 'var(--ion-color-primary)' }} />
                <IonText>
                  <span>Ya tienes </span>
                  <IonBadge color="primary">{myPurchase.quantity}</IonBadge>
                  <span> ticket{myPurchase.quantity !== 1 ? 's' : ''} de este evento</span>
                </IonText>
              </div>
            )}

            {myPurchase && ownerContact && (
              <IonCard color="light" style={{ marginTop: 8 }}>
                <IonCardHeader>
                  <IonText>
                    <h3 style={{ margin: 0 }}>Contacto del organizador</h3>
                  </IonText>
                </IonCardHeader>
                <IonCardContent>
                  {ownerContact.name && (
                    <p>Nombre: <strong>{ownerContact.name}</strong></p>
                  )}
                  {ownerContact.phone ? (
                    <p>Teléfono: <strong>{ownerContact.phone}</strong></p>
                  ) : (
                    <p style={{ color: 'var(--ion-color-medium)' }}>El organizador no registró teléfono.</p>
                  )}
                </IonCardContent>
              </IonCard>
            )}

            <IonButton
              expand="block"
              onClick={openBuyModal}
              disabled={buying}
              style={{ marginTop: 16 }}
            >
              <IonIcon slot="start" icon={cartOutline} />
              {buying ? 'Procesando...' : myPurchase ? 'Comprar más tickets' : 'Comprar tickets'}
            </IonButton>
          </>
        )}
      </IonContent>

      {/* Modal selector de cantidad */}
      <IonModal
        isOpen={showBuyModal}
        onDidDismiss={() => setShowBuyModal(false)}
        initialBreakpoint={0.4}
        breakpoints={[0, 0.4]}
        handleBehavior="cycle"
      >
        <IonContent className="ion-padding">
          <h3 style={{ textAlign: 'center', marginTop: 16, marginBottom: 4 }}>
            Comprar tickets
          </h3>
          <p style={{ textAlign: 'center', color: 'var(--ion-color-medium)', marginTop: 0, marginBottom: 24 }}>
            ${event?.ticketPrice} por ticket
          </p>

          {/* Selector de cantidad */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
            <IonButton
              shape="round"
              color="medium"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              style={{ width: 48, height: 48 }}
            >
              <IonIcon slot="icon-only" icon={remove} />
            </IonButton>

            <IonInput
              type="number"
              value={qty}
              min={1}
              onIonInput={(e) => {
                const v = parseInt(e.detail.value, 10);
                setQty(v > 0 ? v : 1);
              }}
              style={{
                width: 72,
                textAlign: 'center',
                fontSize: 28,
                fontWeight: 'bold',
                '--padding-start': 0,
                '--padding-end': 0,
              }}
            />

            <IonButton
              shape="round"
              onClick={() => setQty((q) => q + 1)}
              style={{ width: 48, height: 48 }}
            >
              <IonIcon slot="icon-only" icon={add} />
            </IonButton>
          </div>

          <p style={{ textAlign: 'center', fontSize: 18, marginBottom: 24 }}>
            Total: <strong>${total.toFixed(2)}</strong>
          </p>

          <div style={{ display: 'flex', gap: 12 }}>
            <IonButton
              expand="block"
              color="medium"
              fill="outline"
              onClick={() => setShowBuyModal(false)}
              style={{ flex: 1 }}
            >
              Cancelar
            </IonButton>
            <IonButton
              expand="block"
              onClick={executeBuy}
              style={{ flex: 1 }}
            >
              Confirmar
            </IonButton>
          </div>
        </IonContent>
      </IonModal>
    </IonPage>
  );
}
