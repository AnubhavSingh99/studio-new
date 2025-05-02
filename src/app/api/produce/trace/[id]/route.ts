// src/app/api/produce/trace/[id]/route.ts
import { NextResponse } from 'next/server';
import { getProduceLogById } from '@/lib/mock-db'; // Import mock DB function

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Invalid or missing produce ID' }, { status: 400 });
  }

  // Basic validation (length check, could add more complex checks if needed)
  if (id.length !== 24) { // Mock IDs are 24 hex characters
       return NextResponse.json({ error: 'Invalid produce ID format for mock data' }, { status: 400 });
  }

  try {
    // Get data from the mock database
    const produceData = getProduceLogById(id);

    if (!produceData) {
      return NextResponse.json({ error: 'Produce record not found in mock store' }, { status: 404 });
    }

    // Return the found data
    return NextResponse.json(produceData, { status: 200 });

  } catch (error) {
    console.error('Error fetching produce data from mock store:', error);
     const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: 'Failed to fetch produce data', details: errorMessage }, { status: 500 });
  }
}
