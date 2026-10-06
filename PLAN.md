# Instrucciones del Proyecto: Sistema de Inscripción de Alumnos

> Este documento es el plan original del proyecto, restaurado tal como estaba.
> Para la documentación técnica actual del proyecto, ver [README.md](README.md).

## Stack Tecnológico Requerido

- **Frontend:** React.js v18+ estructurado como una Progressive Web App (PWA) con soporte Offline básico y Service Workers.
- **Estilos y Componentes:** Tailwind CSS para un diseño moderno y adaptativo (Mobile-First). Iconografía con Lucide Icons.
- **Backend:** Node.js con Express.js (arquitectura limpia y modular por carpetas: controllers, routes, models/services).
- **Base de Datos:** PostgreSQL (versión 16 o 17).
- **Persistencia de Datos:** Utilizar Prisma ORM para el mapeo, migraciones y consultas a la base de datos de manera tipada.

---

## Requerimientos y Detalles Básicos de la Página Web

El sistema debe permitir la inscripción en línea de alumnos para la facultad. Se deben estructurar los siguientes módulos y vistas con sus flujos de datos correspondientes:

### 1. Formulario de Inscripción de Alumnos

Diseñar un formulario interactivo paso a paso (Stepper Form) para capturar los siguientes datos esenciales con validaciones tanto en Frontend como en Backend:

- **Datos Personales:** Nombres, Apellidos, Cédula de Identidad (o documento equivalente), Fecha de Nacimiento, Género, Teléfono y Correo Electrónico.
- **Datos Académicos:** Carrera seleccionada, Turno preferido (Mañana, Tarde, Noche) y Año de Ingreso.
- **Documentación Requerida:** Campos para adjuntar de manera digital (Cédula escaneada, Título de bachiller, Foto tipo carnet).

### 2. Panel Administrativo (Dashboard Básico)

Una vista protegida para los encargados de la facultad que permita:

- Listar todos los alumnos postulados/inscritos con filtros de búsqueda rápidos (por carrera, estado de inscripción o cédula).
- Cambiar el estado de la inscripción del alumno (Estados: *Pendiente, Aprobado, Rechazado*).
- Visualizar los documentos adjuntos de cada alumno.

---

## Alcance acordado

Durante la implementación se tomaron los siguientes criterios, que amplían o recortan el plan original:

| Tema | Decisión |
| --- | --- |
| Cuentas de usuario | El alumno recibe cuenta al inscribirse |
| Identificador | La cédula es el único identificador |
| Documentos adjuntos | Fuera de alcance |
| Carreras | Tabla en la base de datos, con las 7 cargadas por el seed |
| Turnos | Enum `MANANA`, `TARDE`, `NOCHE` |
| Estados | `PENDIENTE` → `APROBADO` / `RECHAZADO` |
| Refresh tokens | No se implementan; el JWT expira y el usuario vuelve a iniciar sesión |
