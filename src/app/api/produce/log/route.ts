// src/app/api/produce/log/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { addProduceLog } from '@/lib/mock-db'; // Import mock DB function

const produceSchema = z.object({
  produceType: z.string().min(1),
  quantity: z.number().min(1),
  origin: z.string().min(1),
  farmingPractices: z.string().optional(),
  transportationDetails: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validationResult = produceSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input data', details: validationResult.error.errors }, { status: 400 });
    }

    const produceData = validationResult.data;

    // Add data to the mock database
    const newLog = addProduceLog(produceData);

    if (!newLog || !newLog._id) {
       throw new Error('Failed to add data to mock store');
    }

    // Return the generated mock ID
    return NextResponse.json({ id: newLog._id.toString() }, { status: 201 });

  } catch (error) {
    console.error('Error logging produce to mock store:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    // Provide a generic error message, hide specific details like auth errors
    return NextResponse.json({ error: 'Failed to log produce data.' }, { status: 500 });
  }
}
