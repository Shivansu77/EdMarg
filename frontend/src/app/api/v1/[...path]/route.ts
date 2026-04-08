const BACKEND_BASE_URL = 'https://edmarg-backend.vercel.app';

const buildTargetUrl = (path: string[], requestUrl: string) => {
  const incomingUrl = new URL(requestUrl);
  const joinedPath = path.join('/');
  const search = incomingUrl.search || '';
  return `${BACKEND_BASE_URL}/api/v1/${joinedPath}${search}`;
};

const methodAllowsBody = (method: string) => !['GET', 'HEAD'].includes(method.toUpperCase());

const forwardRequest = async (request: Request, path: string[]) => {
  const targetUrl = buildTargetUrl(path, request.url);
  const headers = new Headers(request.headers);

  // Host/length are recalculated by fetch runtime.
  headers.delete('host');
  headers.delete('content-length');

  const init: RequestInit = {
    method: request.method,
    headers,
    body: undefined,
    redirect: 'manual',
  };

  if (methodAllowsBody(request.method)) {
    init.body = await request.arrayBuffer();
  }

  const backendResponse = await fetch(targetUrl, init);

  const responseHeaders = new Headers(backendResponse.headers);
  responseHeaders.delete('content-length');

  return new Response(backendResponse.body, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
    headers: responseHeaders,
  });
};

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    },
  });
}

export async function GET(request: Request, context: RouteContext) {
  const { path } = await context.params;
  return forwardRequest(request, path);
}

export async function POST(request: Request, context: RouteContext) {
  const { path } = await context.params;
  return forwardRequest(request, path);
}

export async function PUT(request: Request, context: RouteContext) {
  const { path } = await context.params;
  return forwardRequest(request, path);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { path } = await context.params;
  return forwardRequest(request, path);
}

export async function DELETE(request: Request, context: RouteContext) {
  const { path } = await context.params;
  return forwardRequest(request, path);
}
