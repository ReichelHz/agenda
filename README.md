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

## 📖 Guía rápida para Frontend

**URL Base**: `http://localhost:8081`

### 🔑 Autenticación
Todas las rutas protegidas requieren el Header: `Authorization: Bearer <token>`.

#### Registro de Profesional
`POST /api/auth/register`
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

#### Login (Obtener Token)
`POST /api/auth/login` -> devuelve `{"token": "..."}`

---

### 🏥 Módulo de Terapias
#### Listar Servicios (PÚBLICO)
`GET /api/services`

#### Crear Servicio (PROTEGIDO)
`POST /api/services`
```json
{
  "name": "Reiki",
  "durationMinutes": 60,
  "price": 25000
}
```

---

### 📅 Agenda y Disponibilidad
#### Ver Agenda de un Profesional (PÚBLICO)
`GET /api/availabilities/professional/{id}`

#### Crear Bloque de Disponibilidad (PROTEGIDO)
`POST /api/availabilities`
```json
{
  "professional": { "id": 1 },
  "dayOfWeek": "MONDAY",
  "startTime": "09:00:00",
  "endTime": "10:00:00"
}
```

---

### 🔗 Motor de Enlaces
#### Crear Link Personalizado (PROTEGIDO)
`POST /api/urls`
```json
{
  "originalUrl": "https://tu-web-frontend.com/profile/1",
  "customAlias": "maria-terapeuta"
}
```
*Acceso al link via: `GET /r/maria-terapeuta`*
