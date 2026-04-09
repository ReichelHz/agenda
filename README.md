🌿 Agenda de Terapias Alternativas - Backend
Sistema profesional de gestión de citas y perfiles públicos para terapeutas, diseñado para centralizar la reserva de servicios de bienestar. Desarrollado con una arquitectura moderna en Java 21 y Spring Boot 3.

🚀 Arquitectura y Tecnologías
Java 21 (LTS): Aprovechando las últimas mejoras de rendimiento.

Spring Boot 3.4+: Framework base para microservicios.

PostgreSQL (Supabase): Persistencia relacional para una gestión eficiente de citas.

Spring Security 6 + JWT: Autenticación Stateless y protección contra vulnerabilidades (IDOR, CSRF).

Lombok: Reducción de código repetitivo (Boilerplate).

JUnit 5 & MockMvc: Pruebas de integración automatizadas para el flujo de seguridad.

🔐 Seguridad y Acceso
La API implementa un modelo de seguridad basado en Roles (PATIENT, PROFESSIONAL, ADMIN) y Tokens JWT:

- **Público**: `/api/auth/**`, `/r/**`, `GET /api/services` y `GET /api/availabilities/**`.
- **Protegido**: Requiere Header `Authorization: Bearer <token>`.

Privacidad: Implementación de `/api/users/me` para asegurar que cada usuario acceda solo a su propia información.

### 👥 Estructura de Roles
| Rol | Descripción |
| :--- | :--- |
| **PATIENT** | Usuario final que busca y agenda citas con profesionales. |
| **PROFESSIONAL** | Terapeuta con perfil público que gestiona su propia agenda y servicios. |
| **ADMIN** | Gestión global del sistema y moderación de servicios. |

### 🛣️ Endpoints de Interés
- `POST /api/urls`: Acortador con soporte para `customAlias` (ej: `/r/maria-terapeuta`).
- `GET /api/availabilities/professional/{id}`: Consulta de agenda pública.
- `GET /api/services`: Catálogo público de terapias.
- `GET /api/users/me`: Perfil del usuario actual.

### 🏗️ Arquitectura de Datos
El sistema utiliza una estructura de **herencia lógica** vinculada al usuario:
- **User**: Credenciales básicas y rol.
- **Professional**: Extendida con `phone`, `birthDate`, `description` y lista de `Service`.
- **Availability**: Bloques horarios (Día, Hora Inicio, Hora Fin) vinculados al Profesional.
- **Service**: Definición de terapia (Nombre, Duración, Precio).

---

### 🚀 Estrategia de Despliegue (Recomendado)
Para mantener el proyecto en un entorno gratuito y profesional:
- **Backend**: [Koyeb](https://www.koyeb.com/) (Plan Nano). 
    * *Nota*: Configurar `JAVA_TOOL_OPTIONS: -Xmx384m` para optimizar la RAM.
- **Base de Datos**: [Supabase](https://supabase.com/) (PostgreSQL).
- **Frontend**: [Vercel](https://vercel.com/).

### 📧 Integración de Emails
Para el envío de notificaciones de citas sin costo:
- **Proveedor**: [Brevo](https://www.brevo.com/) (vía SMTP o API) o **Gmail SMTP** (requiere App Password).
- **Lógica**: Implementación mediante `spring-boot-starter-mail`.

---

🛠️ Configuración e Instalación
Requisitos previos
PostgreSQL: Base de datos relacional.

JDK 21 instalado.

Pasos
Clona el repositorio: git clone 

Configura las variables de entorno en tu sistema o en el application.yaml:

SPRING_DATASOURCE_URL: URL de conexión a la base de datos.
SPRING_DATASOURCE_USERNAME / PASSWORD.
JWT_SECRET: Clave maestra (mínimo 64 caracteres).

Ejecuta la aplicación:

Bash
./mvnw spring-boot:run
📌 Roadmap de Desarrollo
- [x] **Infraestructura Base**: migración exitosa de MongoDB a PostgreSQL (Supabase) + Java 21.
- [x] **Seguridad**: implementación de JWT, BCrypt y resolución de dependencias circulares.
- [x] **Motor de Enlaces**: sistema `/r/{code}` con soporte para `customAlias`.
- [x] **Módulo de Servicios**: entidad `Service` (gestión de precios y nombres).
- [x] **Gestión de Agenda**: entidad `Availability` y acceso público a calendarios.
- [ ] **Módulo de Reservas**: proceso de agendamiento (`Appointment`) y validación de horarios.
- [ ] **Notificaciones**: integración de servicio para alertas por email.
- [ ] **Documentación**: integración de Swagger/OpenAPI.
- [ ] **Despliegue**: dockerización y setup de CI/CD para producción.

---

---

## 📖 Guía para el Desarrollador Frontend

### 🌐 Configuración de Conexión
- **URL Base**: `http://localhost:8081`
- **CORS**: Permitido para `localhost:3000`, `5173` y `4200`.

### 🔐 Flujo de Autenticación
1.  **Obtención**: Envía las credenciales a `POST /api/auth/login`.
2.  **Almacenamiento**: Guarda el `token` devuelto (ej. en LocalStorage).
3.  **Uso**: En cada petición protegida, añade el Header:  
    `Authorization: Bearer <TU_TOKEN_AQUÍ>`

---

### 📑 Referencia de Endpoints

| Método | Endpoint | Especial | Auth | Body (Request) |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Registro | No | Ver ejemplo abajo |
| **POST** | `/api/auth/login` | Login | No | `{"email":"", "password":""}` |
| **GET** | `/api/users/me` | Mi Perfil | **SÍ** | - |
| **GET** | `/api/services` | Listar Terapias | No | - |
| **POST** | `/api/services` | Crear Terapia | **SÍ** | `{"name":"", "durationMinutes":60, "price":0}` |
| **GET** | `/api/availabilities/professional/{id}` | Agenda Pública | No | - |
| **POST** | `/api/availabilities` | Crear Horario | **SÍ** | `{"professional":{"id":1}, "dayOfWeek":"MONDAY", "startTime":"HH:mm:ss", "endTime":"HH:mm:ss"}` |
| **POST** | `/api/urls` | Crear Link Corto | **SÍ** | `{"originalUrl":"", "customAlias":""}` |
| **GET** | `/r/{code}` | Redirección | No | - |

---

---

### 📦 Detalle de Endpoints (Manual paso a paso)

#### 1. Autenticación y Registro

**A) Login (Obtener Acceso)**
- **URL**: `POST /api/auth/login`
- **Auth**: No requiere.
- **Body**:
```json
{
    "email": "maria@terapias.com",
    "password": "password123"
}
```
- **Respuesta**: Devuelve un `token`. Úsalo en el header de las demás peticiones.

**B) Registro de Profesional**
- **URL**: `POST /api/auth/register`
- **Auth**: No requiere.
- **Body**:
```json
{
  "name": "Maria Perez",
  "email": "maria@example.com",
  "password": "password123",
  "role": "PROFESSIONAL",
  "phone": "+56912345678",
  "birthDate": "1985-05-20"
}
```

**C) Registro de Paciente**
- **URL**: `POST /api/auth/register`
- **Auth**: No requiere.
- **Body**:
```json
{
  "name": "Juan Perez",
  "email": "juan@example.com",
  "password": "password123",
  "role": "PATIENT"
}
```

---

#### 2. Gestión de Terapias y Disponibilidad

**D) Listar Terapias (Público)**
- **URL**: `GET /api/services`
- **Auth**: No requiere.
- **Respuesta**: Lista de objetos `Service`.

**E) Crear Terapia**
- **URL**: `POST /api/services`
- **Auth**: **SÍ (Bearer Token)**
- **Body**:
```json
{
  "name": "Masaje Descontracturante",
  "durationMinutes": 60,
  "price": 30000
}
```

**F) Ver Horarios de un Profesional (Público)**
- **URL**: `GET /api/availabilities/professional/{id}`
- **Auth**: No requiere.
- **Nota**: El `{id}` es el ID numérico del profesional.

**G) Crear Horario de Disponibilidad**
- **URL**: `POST /api/availabilities`
- **Auth**: **SÍ (Bearer Token)**
- **Body**:
```json
{
  "professional": { "id": 1 },
  "dayOfWeek": "MONDAY",
  "startTime": "09:00:00",
  "endTime": "10:00:00"
}
```

---

#### 3. Perfil y Utilidades

**H) Ver mi Perfil**
- **URL**: `GET /api/users/me`
- **Auth**: **SÍ (Bearer Token)**
- **Respuesta**: Datos del usuario logueado.

---

### 🔗 Motor de Enlaces (Redirección vía Frontend)

Para que el usuario final nunca vea el Backend, el flujo ahora es:
1.  **POST `/api/urls`**: Genera un link que apunta al Front (ej: `http://localhost:3000/r/maria-terapias`).
2.  **Frontend**: Debe capturar la ruta `/r/:code`.
3.  **GET `/api/urls/resolve/{code}`**: El Front llama a este endpoint (Público) para obtener la `originalUrl`.
4.  **Redirección**: El Front redirige al usuario a la URL obtenida.

**Crear Link Personalizado (PROTEGIDO)**
- **URL**: `POST /api/urls`
- **Body**:
```json
{
  "originalUrl": "http://localhost:3000/perfil/maria",
  "customAlias": "maria-terapias"
}
```

**Resolver Redirección (PÚBLICO)**
- **URL**: `GET /api/urls/resolve/{code}`
- **Respuesta**: `{"originalUrl": "..."}`
