const BACKEND = (process.env.BACKEND_URL ?? 'https://agenda-dirh.onrender.com').replace(/\/$/, '');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const backendRes = await fetch(`${BACKEND}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const text = await backendRes.text();

    if (!backendRes.ok) {
      return new Response(text, {
        status: backendRes.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(text, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response('{"error":"Error interno del servidor"}', { status: 500 });
  }
}
