import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const token = request.cookies.get('accessToken')?.value;
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role') || '';
    const limit = searchParams.get('limit') || '20';

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const query = new URLSearchParams();
    if (role) query.append('role', role);
    query.append('limit', limit);

    const response = await fetch(`${backendUrl}/api/admin/users?${query}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch users' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
