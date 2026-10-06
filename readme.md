# Sistema de Inscripción de Alumnos

PWA para la inscripción en línea de alumnos a una facultad, con panel administrativo
para aprobar o rechazar postulaciones.

## Stack

| Capa        | Tecnología                                          |
| ----------- | --------------------------------------------------- |
| Frontend    | React 19 + Vite (PWA con Service Worker)            |
| Estilos     | Tailwind CSS v4 + Lucide Icons                      |
| Backend     | Node.js + Express (modular: routes / controllers / services) |
| Base datos  | PostgreSQL + Prisma ORM                             |
| Auth        | JWT + bcrypt, roles `ALUMNO` y `ADMIN`              |

## Estructura

```
server/                 API Express
  prisma/schema.prisma  Modelos: User, Alumno, Carrera
  prisma/seed.js        Crea el admin y las 7 carreras
  src/routes/           Definición de endpoints
  src/controllers/      Lógica de request/response
  src/services/         Reglas de negocio
  src/validations/      Esquemas Zod (validación de backend)
  src/middleware/       Autenticación y autorización

client/                 App React
  src/pages/            Home, InscriptionForm, Login, MiInscripcion, AdminDashboard
  src/components/       Campo, Stepper, Badge, Aviso
  src/lib/              Cliente API y validación de frontend
  src/auth/             Contexto de autenticación
```

## Puesta en marcha

### 1. Backend

```bash
cd server
npm install
```

Configurá `server/.env` (copiá `.env.example` y ajustá `DATABASE_URL`):

```
DATABASE_URL="postgresql://usuario:password@localhost:5432/inscripciones?schema=public"
JWT_SECRET="un-secreto-largo-y-aleatorio"
ADMIN_EMAIL="admin@facultad.edu"
ADMIN_PASSWORD="Admin123!"
```

Creá la base y corré la migración + el seed:

```bash
createdb -U postgres inscripciones     # o CREATE DATABASE inscripciones;
npx prisma migrate dev
npx prisma db seed
```

Levantá la API:

```bash
npm run dev        # http://localhost:4000
```

### 2. Frontend

```bash
cd client
npm install
npm run dev        # http://localhost:5173
```

Vite redirige `/api` a `http://localhost:4000`, así que no hace falta configurar CORS
en desarrollo.

## Credenciales por defecto

| Rol   | Email               | Contraseña |
| ----- | ------------------- | ---------- |
| Admin | `admin@facultad.edu`| `Admin123!` |

## Rutas

### Públicas

| Método | Ruta                      | Descripción                        |
| ------ | ------------------------- | ---------------------------------- |
| GET    | `/api/health`             | Estado del servicio                |
| GET    | `/api/inscripcion/carreras`| Carreras disponibles               |
| GET    | `/api/inscripcion/turnos` | Turnos disponibles                 |
| POST   | `/api/inscripcion`        | Crear inscripción + cuenta         |

### Alumno (token)

| Método | Ruta                  | Descripción                  |
| ------ | --------------------- | ---------------------------- |
| POST   | `/api/auth/login`     | Iniciar sesión               |
| GET    | `/api/auth/perfil`    | Datos de usuario y alumno    |

### Admin (token con rol `ADMIN`)

| Método | Ruta                            | Descripción                      |
| ------ | ------------------------------- | -------------------------------- |
| GET    | `/api/admin/alumnos`            | Listado con filtros y paginación |
| GET    | `/api/admin/alumnos/:id`        | Detalle de un alumno             |
| PATCH  | `/api/admin/alumnos/:id/estado` | Aprobar / rechazar / pendiente  |
| PATCH  | `/api/admin/alumnos/:id`        | Editar datos del alumno          |
| GET    | `/api/admin/estadisticas`       | Totales por estado               |

Parámetros de `GET /api/admin/alumnos`: `estado`, `carreraId`, `cedula`, `q`
(nombre o apellido), `page`, `limit`.

## Flujo

1. El alumno completa el stepper de 3 pasos (datos personales, académicos, cuenta).
2. El POST crea el `User` con rol `ALUMNO` y el `Alumno` con estado `PENDIENTE`,
   en una transacción. La cédula es el identificador único.
3. El alumno entra con su correo y contraseña y ve el estado de su inscripción.
4. El admin filtra la lista y cambia el estado a `APROBADO` o `RECHAZADO`, con
   observación opcional.

## Validaciones

La cédula es el único identificador y no se puede reutilizar. El email también es
único. Ambas reglas se verifican contra la base antes de insertar y además tienen
constraint `UNIQUE`. El resto de campos se validan con Zod en el backend y con
`src/lib/validacion.js` en el frontend.

## Decisiones tomadas

- **Documentos adjuntos**: fuera de alcance por acuerdo previo.
- **Cuentas**: todo alumno que se inscribe recibe una cuenta en el momento.
- **Turnos**: enum (`MANANA`, `TARDE`, `NOCHE`). Las carreras son tabla porque
  cambian con frecuencia y las administra la facultad.
- **Estados**: `PENDIENTE`, `APROBADO`, `RECHAZADO` en `Alumno`, con índice para
  los filtros del panel.

## Verificación

```bash
cd client
npm run lint      # oxlint
npm run build     # build de producción + manifest PWA

cd ../server
npm test          # 21 casos contra la base `inscripciones_test`
```

Los tests usan la base `inscripciones_test`, que se crea sola y se resetea en cada
corrida, así que no tocan los datos de desarrollo. Cubren el alta de inscripción
(incluidos cédula y email duplicados), el login, los permisos por rol, los filtros
del panel y el cambio de estado.

## Pendiente para producción

- Reemplazar `JWT_SECRET` y la contraseña del admin.
- Configurar CORS con el dominio real en lugar de permitir todos los orígenes.
- Añadir rate limiting en `/api/auth/login`.

El token dura `JWT_EXPIRES_IN` (2h por defecto). Cuando expira el alumno vuelve a
iniciar sesión; no hay refresh tokens por decisión de diseño.