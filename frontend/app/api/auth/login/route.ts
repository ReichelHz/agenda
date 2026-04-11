import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8081';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const backendRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!backendRes.ok) {
      const text = await backendRes.text();
      return new Response(text || 'Credenciales incorrectas', { status: backendRes.status });
    }

    const data = await backendRes.json();
    const token: string = data.token;

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });

    return response;
  } catch {
    return new Response('Error interno del servidor', { status: 500 });
  }
}
