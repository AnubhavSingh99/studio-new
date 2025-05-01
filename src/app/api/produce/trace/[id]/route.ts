// src/app/api/produce/trace/[id]/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb'; // Import ObjectId

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Invalid or missing produce ID' }, { status: 400 });
  }

  // Validate if the ID is a valid MongoDB ObjectId
  if (!ObjectId.isValid(id)) {
       return NextResponse.json({ error: 'Invalid produce ID format' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('produce_logs');

    const produceData = await collection.findOne({ _id: new ObjectId(id) });

    if (!produceData) {
      return NextResponse.json({ error: 'Produce record not found' }, { status: 404 });
    }

    // Return the found data
    return NextResponse.json(produceData, { status: 200 });

  } catch (error) {
    console.error('Error fetching produce data from MongoDB:', error);
     const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: 'Failed to fetch produce data', details: errorMessage }, { status: 500 });
  }
}
