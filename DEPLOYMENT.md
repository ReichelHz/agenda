# Despliegue de la app

Este proyecto se despliega así:

- Frontend: Vercel
- Backend: Render
- Base de datos: la que ya usa el backend vía variables de entorno

## 1. Backend en Render

En Render crea un servicio web apuntando a la carpeta `backend/`.

### Build command

```bash
./mvnw clean package -DskipTests
```

### Start command

```bash
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

### Variables de entorno

Configura estas variables en Render:

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `JWT_SECRET`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`
- `MAIL_PORT`
- `APP_MAIL_FROM`
- `APP_FRONTEND_URL`

`APP_FRONTEND_URL` debe ser la URL pública de Vercel, por ejemplo `https://tu-app.vercel.app`.

## 2. Frontend en Vercel

Importa la carpeta `frontend/` como proyecto de Next.js.

### Variable de entorno

Agrega esta variable en Vercel:

- `BACKEND_URL` = URL pública del backend en Render, por ejemplo `https://tu-backend.onrender.com`

El frontend usa esa URL desde sus route handlers en `/app/api/[...slug]/route.ts`, así que el navegador seguirá hablando con Vercel y Vercel reenviará al backend.

## 3. Checklist rápido para probar

1. Despliega primero el backend.
2. Copia la URL pública del backend en `BACKEND_URL` del frontend.
3. Despliega el frontend en Vercel.
4. Copia la URL pública del frontend en `APP_FRONTEND_URL` del backend.
5. Vuelve a desplegar el backend para que tome esa URL.

## 4. Guion para tu video

1. Abre el frontend en Vercel.
2. Regístrate como paciente.
3. Inicia sesión.
4. Revisa el dashboard.
5. Entra a un perfil o a una cita y muestra que carga datos reales desde el backend.
6. Si quieres, abre el backend en Render y muestra que responde la API.
