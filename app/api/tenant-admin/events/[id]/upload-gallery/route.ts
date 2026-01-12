import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:7000';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('token')?.value;
    const formData = await request.formData();
    const { id } = await params;
    
    const res = await fetch(`${BACKEND_URL}/tenant-admin/events/${id}/upload-gallery`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Error uploading gallery:', error);
    return NextResponse.json({ error: 'Failed to upload gallery images' }, { status: 500 });
  }
}
