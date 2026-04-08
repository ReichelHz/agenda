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

Público: /api/auth/** (Registro/Login) y /r/** (Redirección).

Protegido: Requiere Header Authorization: Bearer <token>.

Privacidad: Implementación de /api/users/me para asegurar que cada usuario acceda solo a su propia información.

### 👥 Estructura de Roles
| Rol | Descripción |
| :--- | :--- |
| **PATIENT** | Usuario final que busca y agenda citas con profesionales. |
| **PROFESSIONAL** | Terapeuta con perfil público que gestiona su propia agenda y servicios. |
| **ADMIN** | Gestión global del sistema y moderación de servicios. |

### 🛣️ Endpoints Principales
**Autenticación (`/api/auth`)**
- `POST /register`: Registro de nuevos usuarios (especificando rol).
- `POST /login`: Obtención de JWT para acceso protegido.

**Usuarios (`/api/users`)**
- `GET /me`: Obtiene el perfil del usuario autenticado.

**Redirección (`/r`)**
- `GET /{code}`: Acceso rápido a perfiles públicos de profesionales.

### 🏗️ Arquitectura de Datos
El sistema utiliza una estructura de **herencia lógica** vinculada al usuario:
- **User**: Contiene las credenciales y el rol principal.
- **Patient**: Extiende al usuario con datos médicos y personales para las citas.
- **Professional**: Extiende al usuario con información de especialidad y disponibilidad horaria.

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
- [x] **Seguridad**: implementación de JWT, encriptación BCrypt y control de acceso por roles.
- [x] **Motor de Enlaces**: sistema de redirección segura `/r/{code}` para perfiles.
- [ ] **Módulo de Servicios**: entidad `Service/Therapy` (gestión de precios y especialidades).
- [ ] **Gestión de Agenda**: entidad `Appointment` con lógica de validación de horarios y disponibilidad.
- [ ] **Notificaciones**: integración de servicio para alertas por email.
- [ ] **Documentación**: integración de Swagger/OpenAPI.
- [ ] **Despliegue**: dockerización y setup de CI/CD para producción.
