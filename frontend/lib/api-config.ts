// Servidor: llama al backend directamente con BACKEND_URL.
// Cliente: URL vacía → proxy de Next.js (app/api/[...slug]/route.ts) → backend.
export const API_URL =
  typeof window === 'undefined'
    ? (process.env.BACKEND_URL ?? 'https://agenda-dirh.onrender.com').replace(/\/$/, '')
    : (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '');