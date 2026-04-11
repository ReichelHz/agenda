# Agenda Backend — Documentación del Proyecto

## Descripción general

API REST construida con **Spring Boot 3.5 + Java 21** que sirve como backend para una agenda de profesionales. Permite registrar usuarios (pacientes y profesionales), gestionar disponibilidades, servicios y URLs cortas.

- **Base de datos:** PostgreSQL via Supabase (connection pooler)
- **Autenticación:** JWT stateless (Bearer token)
- **Puerto:** `8081`

---

## Requisitos previos

- Java 21
- Maven 3.8+ (o usar el wrapper incluido `./mvnw`)
- Conexión a internet (la base de datos está en Supabase)

---

## Levantar el proyecto

```bash
# Desde la raíz del proyecto
./mvnw spring-boot:run
```

El servidor arranca en: `http://localhost:8081`

> Si tenés Maven instalado globalmente también podés usar `mvn spring-boot:run`.

---

## Arquitectura y seguridad

### Endpoints públicos (sin token)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Login, devuelve JWT |
| GET | `/api/services` | Listar servicios disponibles |
| GET | `/api/availabilities/professional/{id}` | Ver disponibilidad de un profesional |
| GET | `/r/{shortCode}` | Redirección por URL corta |

### Endpoints protegidos (requieren `Authorization: Bearer <token>`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/users/me` | Perfil del usuario autenticado |
| POST | `/api/availabilities` | Crear bloque de disponibilidad |
| POST | `/api/services` | Crear un servicio |
| POST | `/api/urls` | Crear URL corta |
| GET | `/api/urls` | Listar mis URLs cortas |

---

## Guía de uso con Postman

### 1. Registrar un usuario

**POST** `http://localhost:8081/api/auth/register`

```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123",
  "role": "PATIENT",
  "phone": "1123456789",
  "birthDate": "1990-05-15"
}
```

Roles disponibles: `PATIENT`, `PROFESSIONAL`

**Respuesta esperada (201):**
```json
{
  "id": 1,
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "role": "PATIENT"
}
```

---

### 2. Login

**POST** `http://localhost:8081/api/auth/login`

```json
{
  "email": "juan@example.com",
  "password": "password123"
}
```

**Respuesta esperada (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

> Copiá el token y usalo en el header `Authorization` para las siguientes peticiones.

---

### 3. Configurar el token en Postman

En cada petición protegida, ir a la pestaña **Authorization** y seleccionar `Bearer Token`, o agregar manualmente el header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

---

### 4. Ver perfil propio

**GET** `http://localhost:8081/api/users/me`
Header: `Authorization: Bearer <token>`

**Respuesta esperada (200):**
```json
{
  "id": 1,
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "role": "PATIENT"
}
```

---

### 5. Crear un servicio

**POST** `http://localhost:8081/api/services`
Header: `Authorization: Bearer <token>`

```json
{
  "name": "Consulta General",
  "description": "Consulta médica de 30 minutos",
  "price": 5000
}
```

---

### 6. Listar servicios (público)

**GET** `http://localhost:8081/api/services`

---

### 7. Crear disponibilidad para un profesional

**POST** `http://localhost:8081/api/availabilities`
Header: `Authorization: Bearer <token>`

```json
{
  "professional": { "id": 1 },
  "dayOfWeek": "MONDAY",
  "startTime": "09:00:00",
  "endTime": "17:00:00"
}
```

Valores válidos para `dayOfWeek`: `MONDAY`, `TUESDAY`, `WEDNESDAY`, `THURSDAY`, `FRIDAY`, `SATURDAY`, `SUNDAY`

---

### 8. Ver disponibilidad de un profesional (público)

**GET** `http://localhost:8081/api/availabilities/professional/1`

---

### 9. Crear URL corta

**POST** `http://localhost:8081/api/urls`
Header: `Authorization: Bearer <token>`

```json
{
  "originalUrl": "https://www.ejemplo.com/pagina-larga",
  "customAlias": "mi-alias"
}
```

> `customAlias` es opcional. Si no se envía, se genera automáticamente.

**Respuesta esperada (201):**
```json
{
  "id": 1,
  "shortCode": "mi-alias",
  "shortUrl": "/r/mi-alias",
  "originalUrl": "https://www.ejemplo.com/pagina-larga",
  "clickCount": 0,
  "createdAt": "2026-04-08T10:00:00"
}
```

---

### 10. Listar mis URLs cortas

**GET** `http://localhost:8081/api/urls`
Header: `Authorization: Bearer <token>`

---

### 11. Redirección (pública)

**GET** `http://localhost:8081/r/mi-alias`

Devuelve un redirect `302` a la URL original.

---

## Integración con frontend

El CORS está configurado para aceptar peticiones desde los siguientes orígenes:

| Framework | URL permitida |
|-----------|---------------|
| React (Vite) | `http://localhost:5173` |
| React (CRA) | `http://localhost:3000` |
| Angular | `http://localhost:4200` |

### Ejemplo con fetch (JavaScript)

```javascript
// Login
const loginResponse = await fetch('http://localhost:8081/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'juan@example.com', password: 'password123' })
});
const { token } = await loginResponse.json();

// Petición autenticada
const meResponse = await fetch('http://localhost:8081/api/users/me', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const user = await meResponse.json();
```

### Ejemplo con axios

```javascript
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8081' });

// Interceptor para agregar el token automáticamente
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Login
const { data } = await API.post('/api/auth/login', { email, password });
localStorage.setItem('token', data.token);

// Perfil
const { data: user } = await API.get('/api/users/me');
```

---

## Modelos de datos

### User
```
id        Long
name      String
email     String (único)
password  String (bcrypt)
role      PATIENT | PROFESSIONAL
```

### Professional
```
id          Long (mismo que User)
user        User (OneToOne)
description String
phone       String
birthDate   LocalDate
services    Set<Service>
```

### Availability
```
id           Long
professional Professional
dayOfWeek    DayOfWeek (enum Java)
startTime    LocalTime (HH:mm:ss)
endTime      LocalTime (HH:mm:ss)
```

### Service
```
id          Long
name        String
description String
price       Decimal
```

### ShortUrl
```
id          Long
shortCode   String
originalUrl String
clickCount  Integer
createdAt   LocalDateTime
user        User
```

---

## Variables de entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `JWT_SECRET` | Clave secreta para firmar el JWT (mínimo 32 chars) | `0123456789abcdef...` (solo dev) |

En producción siempre definir `JWT_SECRET` como variable de entorno real:

```bash
JWT_SECRET=mi-clave-secreta-muy-larga ./mvnw spring-boot:run
```
