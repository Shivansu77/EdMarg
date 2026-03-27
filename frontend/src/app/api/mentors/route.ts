import { NextRequest, NextResponse } from 'next/server';

const resolveBackendUrl = () => {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:5000';

  return baseUrl.replace(/\/$/, '');
};

export async function GET(request: NextRequest) {
  try {
    const backendUrl = resolveBackendUrl();
    const token =
      request.cookies.get('accessToken')?.value ??
      request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const query = request.nextUrl.searchParams.toString();
    const endpoint = query
      ? `${backendUrl}/api/v1/users/browsementor?${query}`
      : `${backendUrl}/api/v1/users/browsementor`;

    const response = await fetch(endpoint, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unable to fetch mentors',
      },
      { status: 500 }
    );
  }
}
