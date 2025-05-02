// src/lib/mock-db.ts

import { randomBytes } from 'crypto';

export interface ProduceLog {
  _id: string;
  produceType: string;
  quantity: number;
  origin: string;
  farmingPractices?: string;
  transportationDetails?: string;
  blockchainTransactionHash: string; // Keep simulated hash
  loggedAt: Date;
}

// In-memory store for produce logs
const produceStore: Map<string, ProduceLog> = new Map();

// Function to add a new produce log
export const addProduceLog = (data: Omit<ProduceLog, '_id' | 'blockchainTransactionHash' | 'loggedAt'>): ProduceLog => {
  const _id = randomBytes(12).toString('hex'); // Generate a simple unique ID
  const transactionHash = `0x${randomBytes(32).toString('hex')}`; // Simulate hash
  const newLog: ProduceLog = {
    ...data,
    _id,
    blockchainTransactionHash: transactionHash,
    loggedAt: new Date(),
  };
  produceStore.set(_id, newLog);
  console.log("Added to mock DB:", newLog);
  return newLog;
};

// Function to get a produce log by ID
export const getProduceLogById = (id: string): ProduceLog | undefined => {
   console.log("Getting from mock DB, ID:", id);
   console.log("Current store:", produceStore);
  return produceStore.get(id);
};

// Function to get all produce logs (optional, for potential future use)
export const getAllProduceLogs = (): ProduceLog[] => {
  return Array.from(produceStore.values());
};
