import { Redirect, Route } from 'react-router-dom';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonLabel,
  IonIcon,
  IonRouterOutlet,
} from '@ionic/react';
import {
  searchOutline,
  ticketOutline,
  addCircleOutline,
  personOutline,
  bagOutline,
} from 'ionicons/icons';
import ProtectedRoute from './ProtectedRoute';
import ExploreList from '../pages/BuyerList';
import MyEventsList from '../pages/PartyList';
import CreateParty from '../pages/CreateParty';
import EventDetail from '../pages/EventDetail';
import Profile from '../pages/Profile';
import MyTickets from '../pages/MyTickets';

// Navegación principal con pestañas inferiores.
// Cualquier usuario puede explorar/comprar y crear/gestionar sus eventos.
export default function Tabs() {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/explore">
          <ProtectedRoute>
            <ExploreList />
          </ProtectedRoute>
        </Route>

        <Route exact path="/mine">
          <ProtectedRoute>
            <MyEventsList />
          </ProtectedRoute>
        </Route>

        <Route exact path="/create">
          <ProtectedRoute>
            <CreateParty />
          </ProtectedRoute>
        </Route>

        <Route exact path="/event/:eventId">
          <ProtectedRoute>
            <EventDetail />
          </ProtectedRoute>
        </Route>

        <Route exact path="/tickets">
          <ProtectedRoute>
            <MyTickets />
          </ProtectedRoute>
        </Route>

        <Route exact path="/profile">
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        </Route>

        {/* Por defecto, ir a Explorar */}
        <Route exact path="/">
          <Redirect to="/explore" />
        </Route>
      </IonRouterOutlet>

      <IonTabBar slot="bottom">
        <IonTabButton tab="explore" href="/explore">
          <IonIcon icon={searchOutline} />
          <IonLabel>Explorar</IonLabel>
        </IonTabButton>

        <IonTabButton tab="mine" href="/mine">
          <IonIcon icon={ticketOutline} />
          <IonLabel>Mis eventos</IonLabel>
        </IonTabButton>

        <IonTabButton tab="tickets" href="/tickets">
          <IonIcon icon={bagOutline} />
          <IonLabel>Mis tickets</IonLabel>
        </IonTabButton>

        <IonTabButton tab="create" href="/create">
          <IonIcon icon={addCircleOutline} />
          <IonLabel>Crear</IonLabel>
        </IonTabButton>

        <IonTabButton tab="profile" href="/profile">
          <IonIcon icon={personOutline} />
          <IonLabel>Perfil</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
}
