🌿 Agenda de Terapias Alternativas - Backend
Sistema profesional de gestión de citas y perfiles públicos para terapeutas, diseñado para centralizar la reserva de servicios de bienestar. Desarrollado con una arquitectura moderna en Java 21 y Spring Boot 3.

🚀 Arquitectura y Tecnologías
Java 21 (LTS): Aprovechando las últimas mejoras de rendimiento.

Spring Boot 3.4+: Framework base para microservicios.

MongoDB: Persistencia NoSQL para un modelo de datos flexible (ideal para diversos tipos de terapias).

Spring Security 6 + JWT: Autenticación Stateless y protección contra vulnerabilidades (IDOR, CSRF).

Lombok: Reducción de código repetitivo (Boilerplate).

JUnit 5 & MockMvc: Pruebas de integración automatizadas para el flujo de seguridad.

🔐 Seguridad y Acceso
La API implementa un modelo de seguridad basado en Roles y Tokens:

Público: /api/auth/** (Registro/Login) y /r/** (Redirección a perfiles de terapeutas).

Protegido: Requiere Header Authorization: Bearer <token>.

Privacidad: Implementación de /api/users/me para asegurar que cada usuario acceda solo a su propia información.

🛠️ Configuración e Instalación
Requisitos previos
MongoDB: Corriendo localmente en localhost:27017 o vía Docker.

JDK 21 instalado.

Pasos
Clona el repositorio: git clone <url-del-repo>

Configura las variables de entorno en tu sistema o en el application.yaml:

JWT_SECRET: Clave maestra para la firma de tokens (mínimo 64 caracteres).

MONGO_DB_NAME: terapias_db (Recomendado cambiar de acortador_db para mayor claridad).

Ejecuta la aplicación:

Bash
./mvnw spring-boot:run
📌 Roadmap de Desarrollo (Equipo)
[x] Infraestructura Base: Spring Boot + MongoDB + Java 21.

[x] Seguridad: JWT, Encriptación de claves (BCrypt) y Tests de Login.

[x] Motor de Enlaces: Redirección segura /r/{code} para perfiles.

[ ] Módulo de Servicios: Entidad Therapy (Nombre, precio, duración, especialidad).

[ ] Gestión de Agenda: Entidad Appointment con lógica de disponibilidad horaria.

[ ] Documentación: Integración de Swagger/OpenAPI para facilitar el desarrollo del Frontend.