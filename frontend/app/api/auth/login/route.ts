const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8081';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const backendRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const text = await backendRes.text();

    if (!backendRes.ok) {
      return new Response(text, { status: backendRes.status });
    }

    return new Response(text, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response('{"error":"Error interno del servidor"}', { status: 500 });
  }
}
