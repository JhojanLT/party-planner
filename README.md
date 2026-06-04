# Party Planner — Ionic React + Firebase + Capacitor

App móvil para planificar eventos: login/registro con Firebase,
y CRUD completo (crear, listar, vender tickets, borrar) con Firestore.

Usa **Ionic React** (componentes con aspecto de app nativa) y está lista
para compilar a Android/iOS con **Capacitor**.

---

## Lo que necesitas

- **Node.js** versión 18+ (descárgalo de https://nodejs.org)
- Una cuenta de Google (para Firebase, es gratis)

---

## Paso 1 — Crea tu proyecto en Firebase (5 minutos)

1. Ve a https://console.firebase.google.com
2. Clic en **"Agregar proyecto"** → ponle nombre → sigue los pasos.

### 1a — Habilita Email/Password Authentication

1. Menú izquierdo → **Authentication** → clic en **"Get started"**.
2. Pestaña **"Sign-in method"** → habilita **Email/Password** → Guardar.

### 1b — Crea la base de datos Firestore

1. Menú izquierdo → **Firestore Database** → **"Create database"**.
2. Selecciona **"Start in test mode"** → elige ubicación → "Enable".

### 1c — Copia tus credenciales

1. Clic en ⚙️ (engranaje arriba a la izquierda) → **"Project settings"**.
2. Baja a **"Your apps"**.
3. Si no hay ninguna app, clic en el ícono **</>** (web) → ponle nombre
   → NO marques Firebase Hosting → "Register app".
4. Verás un bloque así:

```js
const firebaseConfig = {
  apiKey: "AIzaSyB...",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

**Copia esos valores.** Los vas a pegar en el Paso 2.

---

## Paso 2 — Pega tus credenciales

Abre el archivo **`src/firebase.js`** y reemplaza los valores falsos:

```js
// ANTES (valores de ejemplo):
apiKey: 'PEGA-TU-API-KEY-AQUI',
authDomain: 'TU-PROYECTO.firebaseapp.com',
...

// DESPUÉS (tus valores reales):
apiKey: 'AIzaSyB...',
authDomain: 'party-planner-12345.firebaseapp.com',
...
```

**Es lo único que tienes que editar en todo el proyecto.**

---

## Paso 3 — Instala y ejecuta

Abre la terminal en la carpeta del proyecto:

```bash
npm install
npm run dev
```

Abre el navegador en la URL que aparece (normalmente http://localhost:5173).

¡Eso es todo! Ya deberías ver la pantalla de login.

---

## Paso 4 (opcional) — Compilar para Android/iOS

Si quieres generar la app nativa:

```bash
# Primero compila el proyecto web
npm run build

# Agrega la plataforma que quieras
npx cap add android
npx cap add ios

# Abre el proyecto en Android Studio o Xcode
npx cap open android
npx cap open ios
```

Necesitas Android Studio (para Android) o Xcode en Mac (para iOS).

---

## Qué hace la app

| Ruta | Qué hace |
|------|----------|
| `/login` | Iniciar sesión |
| `/signup` | Crear cuenta nueva |
| `/reset` | Restablecer contraseña por email |
| `/` | Lista de tus eventos (protegida) |
| `/party/new` | Crear un evento nuevo |
| `/party/:id` | Detalle: vender/reembolsar tickets, borrar |

---

## Estructura de archivos

```
src/
├── main.jsx                  ← Punto de entrada + CSS de Ionic
├── App.jsx                   ← Rutas con IonReactRouter
├── firebase.js               ← ⚠️ AQUÍ PEGAS TUS CREDENCIALES
├── theme/
│   └── variables.css         ← Colores del tema
├── contexts/
│   └── AuthContext.jsx       ← Login/logout/usuario actual
├── components/
│   └── ProtectedRoute.jsx    ← Redirige a /login si no hay sesión
└── pages/
    ├── Login.jsx             ← Pantalla de login
    ├── Signup.jsx            ← Pantalla de registro
    ├── ResetPassword.jsx     ← Restablecer contraseña
    ├── PartyList.jsx         ← Lista de eventos + FAB para crear
    ├── CreateParty.jsx       ← Formulario con calendario
    └── PartyDetail.jsx       ← Detalle + tickets + borrar
```

---

## Preguntas frecuentes

**¿Por qué "test mode" en Firestore?**
Permite leer/escribir sin restricciones por 30 días. Perfecto para
desarrollo. En producción debes configurar Security Rules.

**¿Puedo probarlo en mi celular sin compilar?**
Sí. Corre `npm run dev -- --host` y abre la IP local desde el navegador
del celular (ej: `http://192.168.1.X:5173`). Se ve como app nativa
gracias a Ionic.

**Me da error al hacer `npm install`**
Verifica tu versión de Node: `node --version` (necesitas 18+).

**¿Qué es el fix de Capacitor en firebase.js?**
Firebase Auth normal no funciona en apps nativas compiladas con Capacitor.
El archivo ya incluye la solución: usa `indexedDBLocalPersistence` cuando
detecta que corre en móvil. No tienes que hacer nada extra.
