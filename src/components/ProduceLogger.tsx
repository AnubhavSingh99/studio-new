'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { QrCode, Loader2, CheckCircle } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

const produceSchema = z.object({
  produceType: z.string().min(1, 'Produce type is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  origin: z.string().min(1, 'Origin details are required'),
  farmingPractices: z.string().optional(),
  transportationDetails: z.string().optional(),
});

type ProduceFormData = z.infer<typeof produceSchema>;

export function ProduceLogger() {
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ProduceFormData>({
    resolver: zodResolver(produceSchema),
    defaultValues: {
      produceType: '',
      quantity: 1,
      origin: '',
      farmingPractices: '',
      transportationDetails: '',
    },
  });

  // TODO: Replace with actual blockchain interaction and QR code generation library
  const onSubmit = async (data: ProduceFormData) => {
    setIsGenerating(true);
    setError(null);
    setQrCodeData(null);
    console.log('Logging produce data (simulated blockchain):', data);

    // Simulate API call / blockchain transaction
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      // In a real app:
      // 1. Send data to Firebase backend
      // 2. Backend interacts with blockchain (e.g., writes data to smart contract)
      // 3. Backend generates a unique identifier (hash or ID)
      // 4. Backend generates QR code content based on the identifier/data
      // 5. Return QR code data URL or identifier to frontend

      // Simulate success
      const qrContent = JSON.stringify({ ...data, timestamp: new Date().toISOString() });
      // Simulate generating a QR code URL (replace with actual library like 'qrcode.react' or server-side generation)
      const dummyQrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrContent)}`;
      setQrCodeData(dummyQrDataUrl);
      form.reset(); // Clear form after successful submission
    } catch (err) {
      console.error('Error logging produce:', err);
      setError('Failed to log produce. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="produceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Produce Type</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Organic Tomatoes" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity (e.g., kg, units)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 100" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="origin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Origin (Farm Name/Region)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Green Valley Farms, CA" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="farmingPractices"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Farming Practices (Optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="e.g., Organic certified, sustainable methods" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

           <FormField
            control={form.control}
            name="transportationDetails"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transportation Details (Optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="e.g., Refrigerated truck, shipped on 2024-07-28" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />


          <Button type="submit" disabled={isGenerating} className="w-full bg-primary hover:bg-primary/90">
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <QrCode className="mr-2 h-4 w-4" />
            )}
            {isGenerating ? 'Generating QR Code...' : 'Log Produce & Generate QR'}
          </Button>
          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        </form>
      </Form>

      <div className="flex items-center justify-center">
        {isGenerating && (
          <div className="flex flex-col items-center text-muted-foreground">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="mt-2">Generating Traceability QR Code...</p>
          </div>
        )}
        {qrCodeData && !isGenerating && (
          <Card className="w-full max-w-xs text-center shadow-lg border-accent">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2 text-accent">
                 <CheckCircle className="h-5 w-5" /> Produce Logged!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Scan this QR code for traceability:</p>
              {/* Using picsum for placeholder as QR generation needs a library or backend */}
               <Image
                    src={qrCodeData}
                    alt="Generated QR Code Placeholder"
                    width={150}
                    height={150}
                    className="mx-auto rounded-md border p-1 bg-white"
                    data-ai-hint="qr code"
                />
            </CardContent>
             <CardFooter className="text-xs text-muted-foreground justify-center">
                Blockchain record created (simulated).
             </CardFooter>
          </Card>
        )}
         {!qrCodeData && !isGenerating && (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed border-border rounded-lg p-8 h-full w-full max-w-xs">
                <QrCode className="h-16 w-16 mb-4 text-primary/50" />
                <p>Your generated QR code will appear here once you log the produce.</p>
            </div>
         )}
      </div>
    </div>
  );
}
