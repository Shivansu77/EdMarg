import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; action: string } }
) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const token = request.cookies.get('accessToken')?.value;
    const { id, action } = params;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const endpoint = action === 'approve' ? 'approve' : 'reject';

    const response = await fetch(`${backendUrl}/api/admin/mentors/${id}/${endpoint}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to update mentor' },
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
