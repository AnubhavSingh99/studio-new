// src/app/api/produce/log/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { randomBytes } from 'crypto'; // For simulating transaction hash
import { z } from 'zod';

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

    const client = await clientPromise;
    const db = client.db(); // Use default database from connection string or specify one e.g., client.db("agritrace")
    const collection = db.collection('produce_logs');

    // Simulate blockchain transaction hash
    const transactionHash = `0x${randomBytes(32).toString('hex')}`;

    const result = await collection.insertOne({
      ...produceData,
      blockchainTransactionHash: transactionHash, // Store simulated hash
      loggedAt: new Date(),
    });

    if (!result.insertedId) {
       throw new Error('Failed to insert data into MongoDB');
    }


    // Return the MongoDB document ID
    return NextResponse.json({ id: result.insertedId.toString() }, { status: 201 });

  } catch (error) {
    console.error('Error logging produce to MongoDB:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: 'Failed to log produce data', details: errorMessage }, { status: 500 });
  }
}
