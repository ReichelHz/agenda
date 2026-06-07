import { type NextRequest } from 'next/server';

// BACKEND_URL es una variable de entorno server-side (sin NEXT_PUBLIC_).
// En local: http://localhost:8081
// En producción (Render/Vercel): https://agenda-dirh.onrender.com
const BACKEND = (process.env.BACKEND_URL ?? 'https://agenda-dirh.onrender.com').replace(/\/$/, '');

async function proxy(
  request: NextRequest,
  slug: string[]
): Promise<Response> {
  const pathname = slug.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${BACKEND}/api/${pathname}${searchParams ? `?${searchParams}` : ''}`;

  const authHeader = request.headers.get('Authorization');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  const hasBody = !['GET', 'HEAD'].includes(request.method);

  try {
    const backendRes = await fetch(url, {
      method: request.method,
      headers,
      ...(hasBody ? { body: request.body, duplex: 'half' } : {}),
    } as RequestInit);

    const text = await backendRes.text();
    const contentType = backendRes.headers.get('Content-Type') ?? 'application/json';
    return new Response(text || null, {
      status: backendRes.status,
      headers: { 'Content-Type': contentType },
    });
  } catch {
    return new Response('Error al contactar el servidor', { status: 502 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  return proxy(request, slug);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  return proxy(request, slug);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  return proxy(request, slug);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  return proxy(request, slug);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  return proxy(request, slug);
}
