# SIGCLEM

Sistema web para la gestión de la información académica y administrativa de la Coordinación de Lenguas
Extranjeras y Maternas del Instituto Tecnológico de Chilpancingo.

Proyecto de residencia profesional. El diseño completo está en el documento de desarrollo (Fase 4).

## Estructura

```
sigclem/
├─ sigclem-api/   API REST · Java 21 · Spring Boot 4.1 · Spring Security + JWT · JPA · Flyway · MySQL 8
├─ sigclem-web/   SPA · React 19 · Vite · Tailwind CSS 4 · React Router · Axios · lucide-react
├─ db-init/       Script que crea las cuentas de MySQL (flyway con DDL, app solo con DML)
├─ docker-compose.yml, .env.example, deploy.sh
```

### Backend (paquetes por módulo, Tabla 57)

```
mx.edu.itch.sigclem
├─ config/          OpenAPI y endpoint de salud
├─ seguridad/       JWT, 4 roles, login con bloqueo tras 5 intentos, cuentas iniciales
├─ comun/excepcion  Excepciones del sistema y manejador global RFC 7807 (Tabla 61)
├─ catalogos/       Carreras, niveles, periodos, modalidades y aulas
├─ alumnos/         Registro de alumno (CU-02) y expediente con avance reticular (CU-03)
├─ examenes/        Solicitud, programación y evaluación de exámenes (CU-04 a CU-06)
├─ facilitadores/    Alta, consulta, edición y desactivación de facilitadores (CU-07)
├─ grupos/           Apertura, horarios, consulta y actas de calificaciones (CU-08 a CU-10)
├─ reportes/         Resumen académico por periodo y nivel (CU-17)
├─ diagnosticos/     Solicitud, programación y resultado de evaluación diagnóstica (CU-22)
├─ constancias/      Solicitud, autorización, folio único y emisión PDF (CU-14, CU-15)
├─ pagos/            Tarifas, autorizaciones, comprobantes e inscripción con pago validado (CU-11 a CU-13)
├─ boletas/          Consulta del historial de calificaciones por periodo (CU-20)
├─ lenguasmaternas/  Catálogo, registro con documento y revisión de lenguas maternas (CU-18, CU-19)
└─ notificaciones/   Mensajería entre coordinación y jefatura del DGTV (CU-25)
```

Cada módulo sigue las capas `controller → service → repository → domain`, con `dto` para entrada y salida.

## Qué está listo (incrementos 0 y 1)

| Área | Estado |
| --- | --- |
| Esquema de base de datos | Migraciones `V1` a `V8`: esquema inicial, catálogos, tarifas, notificaciones, constancias y cargos con saldo |
| Seguridad | Login JWT (8 h), BCrypt, 4 roles, jefa del DGTV en solo lectura, bloqueo tras 5 intentos |
| Errores | Formato `application/problem+json` con campo `codigo` |
| Alumnos | Registro público (siempre rol Alumno) y consulta del expediente con validación de propiedad |
| Exámenes | El alumno solicita y consulta sus propios exámenes; coordinación programa y captura resultados por rúbrica (CU-04 a CU-06) |
| Lenguas maternas | Catálogo administrable por coordinación, registro y consulta del documento propio del alumno, y revisión/validación o rechazo (CU-18, CU-19) |
| Boletas | Historial de calificaciones por periodo y grupo; las calificaciones se muestran únicamente después de cerrar el acta (CU-20) |
| Constancias | Solicitud al acreditar los diez niveles de inglés, folio único, emisión PDF y notificaciones a coordinación, alumno y jefatura (CU-14, CU-15) |
| Reportes académicos | Resumen por periodo y nivel de grupos, inscripciones, actas cerradas, pendientes, promedios y resultados publicados (CU-17) |
| Evaluaciones diagnósticas | Solicitud, programación con avisos a ambas partes, consulta del puntaje, observaciones y recomendación (CU-22 a CU-24); el diagnóstico no modifica el avance de nivel |
| Búsqueda de alumnos y supervisión | Consulta paginada por nombre, número de control, carrera o correo; consulta de expedientes y vistas de solo lectura de alumnos, facilitadores y grupos (CU-16, CU-21) |
| Mensajería | Coordinación envía mensajes a jefatura; jefatura consulta su bandeja y marca mensajes como leídos (CU-25) |
| Facilitadores | Alta con contraseña temporal, consulta, edición y desactivación lógica por el coordinador (CU-07) |
| Grupos y actas | Apertura con validación de traslapes, vista del facilitador, captura de calificaciones y cierre inmutable (CU-08 a CU-10) |
| Pagos e inscripciones | Conceptos y tarifas administrables, cargos emitidos por coordinación, abonos con saldo, evidencia JPG, captura manual de CFDI, validación/rechazo e inscripción al liquidar el curso (CU-11 a CU-13) |
| Frontend | Login, registro, rutas protegidas por rol, expediente, exámenes, pagos e inscripción, boletas, constancias con descarga de PDF, reportes, facilitadores, grupos, actas y gestión de lenguas maternas |
| Despliegue | Docker Compose con MySQL, API y Nginx |

El alumno puede aportar los datos leídos del QR o enviar la fotografía JPG para que coordinación capture UUID, RFC e importe manualmente. La verificación de validez fiscal del CFDI sigue siendo una revisión de coordinación, no una consulta automática al SAT.
Las constancias solo se solicitan cuando el alumno acredita los diez niveles de inglés. Los flujos CU-11 a CU-13 incorporan cargos emitidos por coordinación y abonos parciales; antes de producción, aplica y verifica las migraciones pendientes en una base de datos MySQL respaldada.

## Desarrollo local

Requisitos: JDK 21, Node 22 y MySQL 8.0 (o Docker). Para usar la base MySQL 8.0 de Docker mientras ejecutas la API desde el IDE, inicia el servicio `db` con `docker compose up -d db`; queda disponible en `localhost:3308`. El puerto evita conflictos con instalaciones locales de MySQL en `3307`.

1. Crea la base de datos:
   ```sql
   CREATE DATABASE sigclem CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
   ```
2. Backend (Flyway crea las tablas al arrancar):
   ```bash
   cd sigclem-api
   export DB_USER=root DB_PASS=tu_contrasena
   export JWT_SECRET="una-cadena-aleatoria-de-al-menos-32-caracteres"
   export COORDINADOR_USUARIO=coordinador COORDINADOR_CONTRASENA=Coordinador2026
   ./mvnw spring-boot:run          # En Windows: mvnw.cmd spring-boot:run
   ```
   Swagger UI: http://localhost:8080/api/v1/docs/ui
3. Frontend:
   ```bash
   cd sigclem-web
   npm install
   npm run dev                      # http://localhost:5173 (redirige /api al puerto 8080)
   ```
4. Pruebas: `./mvnw test` (backend) y `npm test` (frontend).

## Despliegue con Docker Compose

```bash
cp .env.example .env     # y llena todas las contraseñas y JWT_SECRET
docker compose up -d --build
```

La aplicación queda en el puerto definido en `WEB_PORT` (80 por omisión). Nginx sirve la SPA y redirige `/api` al
contenedor de la API. Para HTTPS, coloca el certificado del instituto en un proxy frontal o agrega un bloque
`listen 443 ssl` a `sigclem-web/nginx.conf`.

## Trabajo pendiente

- Ampliar las pruebas de integración con MySQL y verificar el flujo completo de solicitudes, emisión y descarga de constancias.
