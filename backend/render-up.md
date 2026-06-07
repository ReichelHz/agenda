# Deploy en Render — Backend (Spring Boot)

## Requisitos previos

- Cuenta en [render.com](https://render.com)
- Repositorio en GitHub con el código del backend
- App de Gmail con **contraseña de aplicación** generada (no la contraseña normal)

---

## Paso 0 — Correcciones necesarias ANTES de subir

### 0.1 Credenciales de base de datos hardcodeadas

El archivo `application.yaml` tiene las credenciales de Supabase en texto plano. Esto es un riesgo de seguridad. Modificalo así:

```yaml
# application.yaml
server:
  port: ${PORT:8081}      # <-- permite que Render inyecte su propio PORT

spring:
  datasource:
    url: ${DB_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    driver-class-name: org.postgresql.Driver
  # ... resto igual
```

Luego esas variables se configuran en el panel de Render (ver Paso 3).

### 0.2 CORS — agregar tu dominio de producción

En `WebConfig.java`, agregá el dominio de tu frontend en producción:

```java
config.setAllowedOrigins(List.of(
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:4200",
    "https://tu-frontend.onrender.com"   // <-- tu dominio real
));
```

---

## Paso 1 — Crear el Web Service en Render

1. En el dashboard de Render → **New** → **Web Service**
2. Conectar el repositorio de GitHub
3. Configurar:

| Campo | Valor |
|-------|-------|
| **Name** | `agenda-backend` (o el nombre que prefieras) |
| **Region** | Oregon (US West) o el más cercano a vos |
| **Branch** | `main` |
| **Root Directory** | `backend` (si el repo tiene frontend y backend juntos) |
| **Runtime** | `Docker` |
| **Build Command** | *(vacío — lo maneja el Dockerfile)* |
| **Start Command** | *(vacío — lo maneja el Dockerfile)* |
| **Instance Type** | Free (para pruebas) o Starter ($7/mes para producción) |

> **Nota sobre el plan Free:** En el plan gratuito, el servicio se suspende después de 15 minutos de inactividad. La primera petición luego de eso puede tardar ~30 segundos en responder ("cold start"). Para producción real usá al menos el plan **Starter**.

---

## Paso 2 — Dockerfile

Render no tiene runtime nativo para Java. El deploy se hace via **Docker**. El `Dockerfile` ya está creado en la raíz del proyecto — usa una imagen multi-stage:

1. **Stage build**: `maven:3.9-eclipse-temurin-21` compila el proyecto
2. **Stage run**: `eclipse-temurin:21-jre` ejecuta el JAR resultante

No necesitás configurar Build Command ni Start Command en Render — el `Dockerfile` lo maneja todo.

---

## Paso 3 — Variables de entorno

En el panel de Render → tu servicio → **Environment** → agregar las siguientes:

### Obligatorias

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `SPRING_DATASOURCE_URL` | URL JDBC de Supabase | `jdbc:postgresql://aws-1-us-east-2.pooler.supabase.com:6543/postgres?prepareThreshold=0` |
| `SPRING_DATASOURCE_USERNAME` | Usuario de Supabase | `postgres.oudlnfeonpvdadsdkwwh` |
| `SPRING_DATASOURCE_PASSWORD` | Contraseña de Supabase | `tu_password_real` |
| `MAIL_USERNAME` | Email Gmail para enviar correos | `tuapp@gmail.com` |
| `MAIL_PASSWORD` | **Contraseña de aplicación** de Gmail (no la normal) | `xxxx xxxx xxxx xxxx` |
| `JWT_SECRET` | Secreto para firmar JWT — mínimo 64 caracteres hex | Ver generador abajo |

### Recomendadas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `APP_FRONTEND_URL` | URL del frontend en producción (para links en emails) | `https://tu-frontend.vercel.app` |
| `APP_MAIL_FROM` | Dirección "from" en los emails | `noreply@tu-dominio.com` |

### Cómo generar JWT_SECRET

```bash
# En terminal (Mac/Linux)
openssl rand -hex 32
```

Copiá el resultado (64 caracteres) y pegalo como valor de `JWT_SECRET`.

---

## Paso 4 — Base de datos (Supabase)

Ya tenés Supabase configurado. Solo asegurate de:

1. El proyecto de Supabase esté **activo** (no pausado por inactividad en plan free)
2. La IP de Render esté permitida en las reglas de red de Supabase:
   - Supabase Dashboard → Settings → Database → **Network Restrictions**
   - Agregá `0.0.0.0/0` temporalmente para pruebas, o las IPs de Render para producción
3. Usar el **connection pooler** de Supabase (puerto 6543) como ya está configurado — es la opción correcta para apps con múltiples conexiones

### Alternativa: PostgreSQL de Render

Si preferís no depender de Supabase, podés crear una base de datos PostgreSQL directamente en Render:

1. **New** → **PostgreSQL**
2. Render te da la variable `DATABASE_URL` automáticamente
3. Actualizá `DB_URL` en las variables de entorno del Web Service con ese valor

---

## Paso 5 — Deploy

1. Guardá las variables de entorno → Render hace deploy automático
2. Seguí los logs en **Logs** para confirmar que arranca bien
3. Buscá en los logs: `Started BackendApplication in X seconds`

La URL del servicio será algo como: `https://agenda-backend.onrender.com`

---

## Verificación post-deploy

```bash
# Health check básico
curl https://agenda-backend.onrender.com/v3/api-docs

# Swagger UI (si está público)
# Abrir en el navegador:
# https://agenda-backend.onrender.com/swagger-ui.html
```

---

## Contraseña de aplicación de Gmail (paso a paso)

El SMTP de Gmail requiere una **App Password**, no tu contraseña normal:

1. Ir a [myaccount.google.com/security](https://myaccount.google.com/security)
2. Asegurate de tener **verificación en 2 pasos** activada
3. Buscar **"Contraseñas de aplicaciones"** (App passwords)
4. Crear una nueva para "Mail" → "Windows Computer" (o cualquier nombre)
5. Copiar los 16 caracteres generados → ese es el valor de `MAIL_PASSWORD`

---

## Resumen de variables (para copiar/pegar)

```
SPRING_DATASOURCE_URL=jdbc:postgresql://aws-1-us-east-2.pooler.supabase.com:6543/postgres?prepareThreshold=0
SPRING_DATASOURCE_USERNAME=postgres.oudlnfeonpvdadsdkwwh
SPRING_DATASOURCE_PASSWORD=ph8dQA2JrW39bmIz
MAIL_USERNAME=<tu_email@gmail.com>
MAIL_PASSWORD=<app_password_de_16_chars>
JWT_SECRET=15681bbaa512fcd4b5abf79b072170095e3e5f3aac5a5a8dd458b36ea525ba1e
APP_FRONTEND_URL=https://<nombre-frontend>.onrender.com
APP_MAIL_FROM=<tu_email@gmail.com>
```

> ⚠️ `MAIL_USERNAME`, `MAIL_PASSWORD` y `APP_MAIL_FROM` — completalos con tu cuenta de Gmail y su App Password.
> ⚠️ `APP_FRONTEND_URL` — reemplazá con la URL real de tu frontend en Render una vez que lo crees.

---

## Troubleshooting

| Problema | Causa probable | Solución |
|----------|---------------|----------|
| Build falla con "Java version" | Imagen Docker incorrecta | Verificar que el `Dockerfile` use `eclipse-temurin:21` |
| `Connection refused` a DB | Supabase pausado o IP bloqueada | Activar proyecto Supabase, revisar Network Restrictions |
| Emails no llegan | App Password incorrecto o 2FA desactivado | Regenerar App Password en Google Account |
| Error 401 en endpoints públicos | JWT secret diferente entre deploys | Verificar que `JWT_SECRET` esté seteado |
| Cold start lento | Plan Free de Render | Upgradar a Starter o usar un cron job para hacer ping cada 14 min |
