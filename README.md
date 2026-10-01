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
├─ catalogos/       Carreras y niveles
└─ alumnos/         Registro de alumno (CU-02) y expediente con avance reticular (CU-03)
```

Cada módulo sigue las capas `controller → service → repository → domain`, con `dto` para entrada y salida.

## Qué está listo (incremento 0)

| Área | Estado |
| --- | --- |
| Esquema de base de datos | Migración `V1` con las 23 tablas del Anexo A y `V2` con catálogos |
| Seguridad | Login JWT (8 h), BCrypt, 4 roles, jefa del DGTV en solo lectura, bloqueo tras 5 intentos |
| Errores | Formato `application/problem+json` con campo `codigo` |
| Alumnos | Registro público (siempre rol Alumno) y consulta del expediente con validación de propiedad |
| Frontend | Login, registro, rutas protegidas por rol, menú lateral por rol, expediente del alumno |
| Despliegue | Docker Compose con MySQL, API y Nginx |

Las demás pantallas aparecen en el menú con el aviso "en construcción" y el caso de uso que las implementará.

## Desarrollo local

Requisitos: JDK 21, Node 22 y MySQL 8.0 (o Docker).

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

## Siguientes incrementos (orden del cronograma)

1. Docentes: facilitadores, grupos, horarios sin traslapes y actas (CU-07 a CU-10).
2. Exámenes y evaluación de diagnóstico (CU-04 a CU-06, CU-22 a CU-24).
3. Pagos: papeleta, carga del comprobante, lectura del QR y validación (CU-11 a CU-13).
4. Constancias con folio único y PDF, y mensajería a la jefa del DGTV (CU-14, CU-15, CU-25).
5. Reportes, lenguas maternas y supervisión (CU-17 a CU-19, CU-21).
