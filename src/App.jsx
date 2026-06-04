import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ResetPassword from './pages/ResetPassword';
import Tabs from './components/Tabs';

// Inicializa Ionic
setupIonicReact();

function AppRoutes() {
  return (
    <IonRouterOutlet>
      {/* Rutas públicas */}
      <Route exact path="/login" component={Login} />
      <Route exact path="/signup" component={Signup} />
      <Route exact path="/reset" component={ResetPassword} />

      {/* App con pestañas: una sola ruta para todos los paths de los tabs */}
      <Route
        path={['/explore', '/mine', '/create', '/event', '/tickets', '/profile']}
        component={Tabs}
      />

      <Route exact path="/">
        <Redirect to="/explore" />
      </Route>
    </IonRouterOutlet>
  );
}

export default function App() {
  return (
    <IonApp>
      <IonReactRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </IonReactRouter>
    </IonApp>
  );
}
